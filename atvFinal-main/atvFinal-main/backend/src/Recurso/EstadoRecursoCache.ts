import type { EstadoRecursoCacheado } from './EstadoCacheado';
import type { AtualizacaoDeEstado } from './AtualizacaoDeEstado';
import type { ConsultaEstadoResult } from './ConsultaEstadoResult';
import type { SolicitacaoDeReservaPedenteEntity, SolicitacaoDeReservaProcessada, SolicitacaoDeReservaRequest, SolicitacaoDeReservaResult } from './SolicitacaoDeReserva';

const EstadoRecursoCacheMap = new Map<string, EstadoRecursoCacheado>()

const SolicitacaoReservaPendenteMap = new Map<string, SolicitacaoDeReservaPedenteEntity>()

export function getEstadoRecurso(recursoId: string): ConsultaEstadoResult {

    const estadoRecursoCacheado = EstadoRecursoCacheMap.get(recursoId)

    if (!estadoRecursoCacheado) {
        return { recursoId: recursoId, estado: "desconhecido" }
    }

    else if (estadoRecursoCacheado.estado === "indisponivel") {

        const now = new Date()
        const expiracao = new Date(estadoRecursoCacheado.expiracaoTimestamp)

        if (now > expiracao) {
            return {
                recursoId: recursoId,
                estado: "indisponivel_expirado",
                updateTimestamp: estadoRecursoCacheado.estadoUpdateTimestamp,
                expiracaoTimestamp: estadoRecursoCacheado.expiracaoTimestamp,
                usuarioId: estadoRecursoCacheado.reservadoPeloUsuarioId,
            }
        }

        else {
            return {
                recursoId: recursoId,
                estado: "indisponivel",
                updateTimestamp: estadoRecursoCacheado.estadoUpdateTimestamp,
                expiracaoTimestamp: estadoRecursoCacheado.expiracaoTimestamp,
                usuarioId: estadoRecursoCacheado.reservadoPeloUsuarioId
            }
        }

    }

    else if (estadoRecursoCacheado.estado === "disponivel") {

        const solicitacao = SolicitacaoReservaPendenteMap.get(recursoId)

        if (solicitacao) {
            return {
                recursoId: recursoId,
                estado: "solicitacao_de_reserva_pendente",
                usuarioId: solicitacao.usuarioId,
                solicitacaoTimestamp: solicitacao.solicitacaoTimestamp,
                expiracaoTimestamp: solicitacao.expiracaoTimestamp
            }
        } else {

            return {
                recursoId: recursoId,
                estado: "disponivel",
                updateTimestamp: estadoRecursoCacheado.estadoUpdateTimestamp
            }
        }
    }

    else {
        return { recursoId: recursoId, estado: "desconhecido" }
    }


}


export function solicitarReserva(req: SolicitacaoDeReservaRequest): SolicitacaoDeReservaResult {

    const recurso = getEstadoRecurso(req.recursoId)

    if (recurso.estado !== "disponivel") {

        switch (recurso.estado) {
            case "indisponivel":
                return { sucesso: false, erro: `Recurso ${req.recursoId} está indisponível.` }
            case "indisponivel_expirado":
                return { sucesso: false, erro: `Recurso ${req.recursoId} está indisponível (expirado).` }
            case "desconhecido":
                return { sucesso: false, erro: `Recurso ${req.recursoId} está em estado desconhecido.` }
            case "solicitacao_de_reserva_pendente":
                return { sucesso: false, erro: `Recurso ${req.recursoId} já possui uma solicitação de reserva pendente.` }
        }

    }

    const now = new Date().toISOString()

    const solicitacao: SolicitacaoDeReservaPedenteEntity = {
        solicitacaoDeReservaId: crypto.randomUUID(),
        recursoId: req.recursoId,
        usuarioId: req.usuarioId,
        expiracaoTimestamp: req.expiracaoTimestamp,
        solicitacaoTimestamp: now,
    }

    SolicitacaoReservaPendenteMap.set(req.recursoId, solicitacao)

    return { sucesso: true, solicitacao }

}

export function getSolicitacaoReservaPendente(recursoId: string): SolicitacaoDeReservaPedenteEntity | undefined {

    const solicitacao = SolicitacaoReservaPendenteMap.get(recursoId)

    if (solicitacao) {
        console.log("Solicitação de reserva pendente encontrada para o recurso:", recursoId);
    }

    else {
        console.log("Nenhuma solicitação de reserva pendente para o recurso:", recursoId);
    }

    return solicitacao

}

export function handleAtualizacaoDeEstadoRequest(recursoId: string, atualizacao: AtualizacaoDeEstado) {

    const novoEstado: EstadoRecursoCacheado = {
        ...atualizacao,
        recursoId,
        estadoUpdateTimestamp: new Date().toISOString()
    }

    EstadoRecursoCacheMap.set(recursoId, novoEstado)
}



export function handleSolicitacaoDeReservaProcessada(recursoId: string, solicitacaoProcessada: SolicitacaoDeReservaProcessada) {

    const solicitacaoPendente = SolicitacaoReservaPendenteMap.get(recursoId)

    if (!solicitacaoPendente) {
        console.log(`Recebido resultado de solicitação de reserva para recurso ${recursoId}, mas não há solicitação pendente.`)
        return
    }

    if (solicitacaoPendente.solicitacaoDeReservaId !== solicitacaoProcessada.solicitacaoDeReservaId) {
        console.error(`Recebido resultado de solicitação de reserva para recurso ${recursoId}, mas o ID processado não corresponde à solicitação pendente.`)
        return
    }

    if (solicitacaoProcessada.resultado === "aceita") {
        // Atualiza o estado do recurso para indisponível

        console.log(`Solicitação de reserva aceita para o recurso ${recursoId}`)

        const now = new Date().toISOString()

        const estadoRecurso: EstadoRecursoCacheado = {
            recursoId: recursoId,
            estado: "indisponivel",
            estadoUpdateTimestamp: now,
            expiracaoTimestamp: solicitacaoPendente.expiracaoTimestamp,
            reservadoPeloUsuarioId: solicitacaoPendente.usuarioId
        }

        EstadoRecursoCacheMap.set(recursoId, estadoRecurso)
    }

    else if (solicitacaoProcessada.resultado === "negada") {
        console.log(`Solicitação de reserva negada para o recurso ${recursoId}`)
    }


    // Remove a solicitação pendente
    SolicitacaoReservaPendenteMap.delete(recursoId)

}
