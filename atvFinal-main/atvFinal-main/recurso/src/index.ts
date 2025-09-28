import { treaty } from "@elysiajs/eden";
import type { RecursoServer } from "@backend/Recurso/RecursoServer";
import type { AtualizacaoDeEstado } from "@backend/Recurso/AtualizacaoDeEstado";
import type { Estado } from "./Estado";
import type { SolicitacaoDeReservaPedenteEntity, SolicitacaoDeReservaProcessada } from "@backend/Recurso/SolicitacaoDeReserva";

await Bun.sleep(2000 + Math.random() * 1000); // Espera o backend iniciar


//#region Configuração de variaveis de ambiente

if (!Bun.env.RECURSO_ID || !Bun.env.RECURSO_SECRET) {
    throw new Error("RECURSO_ID e RECURSO_SECRET devem ser definidos nas variáveis de ambiente");
}

const RECURSO_ID = Bun.env.RECURSO_ID;
const RECURSO_SECRET = Bun.env.RECURSO_SECRET;

//#endregion


//#region Instancia do cliente de api

const client = treaty<RecursoServer>("http://backend:4000", {
    headers: {
        "authorization": RECURSO_SECRET
    }
});

//#endregion


//#region Verificação de autenticação
const authResult = await client.authstatus.get()

if (authResult.status !== 200) {
    throw new Error("Falha na autenticação do recurso com o servidor central");
}
console.log("Recurso autenticado com sucesso no servidor central");
//#endregion


//#region Estado do recurso
let estadoAtual: Estado = {
    estado: "disponivel"
};
//#endregion



async function sendAtualizacaoDeEstado() {

    const result = await client.atualizacao_estado.post({
        atualizacaoDeEstado: estadoAtual
    })

    if (result.status !== 200) {
        console.error("Falha ao enviar atualização de estado para o servidor central", result);
    } else {
        console.log("Atualização de estado enviada com sucesso");
    }

}

async function pullSolicitacaoDeReservaPendente() {

    console.log("Verificando se há solicitações de reserva pendentes...");

    const result = await client.solicitacao_de_reserva_pedente.get();

    if (result.error) {
        console.log("Nenhuma solicitação de reserva pendente");
        return;
    }

    const solicitacao = result.data;

    console.log("Solicitação de reserva pendente recebida");

    if (estadoAtual.estado === "indisponivel") {

        console.warn("Recurso está indisponível, negando solicitação de reserva");

        const solicitacaoProcessada: SolicitacaoDeReservaProcessada = {
            solicitacaoDeReservaId: solicitacao.solicitacaoDeReservaId,
            resultado: 'negada',
        }

        const sucessoEnvio = await sendSolicitacaoDeReservaProcessada(solicitacaoProcessada);

        if (!sucessoEnvio) {
            console.error("Falha ao enviar resultado de solicitação de reserva processada");
        }

        return;
    }

    console.log("Recurso está disponível, aceitando solicitação de reserva");

    const novoEstado: Estado = {
        estado: "indisponivel",
        expiracaoTimestamp: solicitacao.expiracaoTimestamp,
        reservadoPeloUsuarioId: solicitacao.usuarioId
    }

    const resultadoEnvio = await sendSolicitacaoDeReservaProcessada({
        solicitacaoDeReservaId: solicitacao.solicitacaoDeReservaId,
        resultado: 'aceita'
    })

    if (!resultadoEnvio) {
        console.warn("Falha ao enviar resultado de solicitação de reserva processada, não alterando estado do recurso");
        return;
    }

    estadoAtual = novoEstado;

    console.log("Estado do recurso alterado para indisponível devido à reserva aceita");

}

async function sendSolicitacaoDeReservaProcessada(solicitacaoDeReservaProcessada: Omit<SolicitacaoDeReservaProcessada, 'recursoId'>): Promise<boolean> {

    const result = await client.resultado_solicitacao_de_reserva.post({solicitacaoDeReservaProcessada});


    if (result.error) {
        console.error("Falha ao enviar resultado de solicitação de reserva processada:", result);
        return false;
    }

    console.log("Resultado de solicitação de reserva processada enviado com sucesso");
    return true;
}

async function mainLoop() {

    await sendAtualizacaoDeEstado();

    await Bun.sleep(2500);

    await pullSolicitacaoDeReservaPendente();

    await Bun.sleep(2500);

}

while(true) {
    await mainLoop();
}