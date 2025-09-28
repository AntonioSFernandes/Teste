


interface ConsultaEstadoResultBase {

    recursoId: string;

    estado:
    | "disponivel"
    | "indisponivel"
    | "indisponivel_expirado"
    | "desconhecido"
    | "solicitacao_de_reserva_pendente";

}

interface ConsultaEstadoResultDisponivel extends ConsultaEstadoResultBase {

    recursoId: string;

    estado: "disponivel";

    updateTimestamp: string;
}

interface ConsultaEstadoResultIndisponivelBase extends ConsultaEstadoResultBase {

    recursoId: string;

    updateTimestamp: string;

    expiracaoTimestamp: string;

    usuarioId: string;

}

interface ConsultaEstadoResultIndisponivel extends ConsultaEstadoResultIndisponivelBase {
    estado: "indisponivel";
}

interface ConsultaEstadoResultIndisponivelExpirado extends ConsultaEstadoResultIndisponivelBase {
    estado: "indisponivel_expirado";
}

interface ConsultaEstadoResultDesconhecido extends ConsultaEstadoResultBase {

    recursoId: string;

    estado: "desconhecido";

}

interface ConsultaEstadoResultSolicitacaoDeReservaPendente extends ConsultaEstadoResultBase {

    recursoId: string;

    estado: "solicitacao_de_reserva_pendente";

    usuarioId: string;

    solicitacaoTimestamp: string;

    expiracaoTimestamp: string;

}

export type ConsultaEstadoResult =
    | ConsultaEstadoResultDisponivel
    | ConsultaEstadoResultIndisponivel
    | ConsultaEstadoResultIndisponivelExpirado
    | ConsultaEstadoResultDesconhecido
    | ConsultaEstadoResultSolicitacaoDeReservaPendente;
