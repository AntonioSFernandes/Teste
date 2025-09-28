import { t } from "elysia";

// Frontend envia para o backend
export interface SolicitacaoDeReservaRequest {
    recursoId: string;
    usuarioId: string;
    expiracaoTimestamp: string;
}

// Backend retorna o resultado da solicitacao para o frontend
export type SolicitacaoDeReservaResult =
    | { sucesso: true; solicitacao: SolicitacaoDeReservaPedenteEntity }
    | { sucesso: false; erro: string };




// Backend armazena a solicitacao pendente em memoria
// Backend envia para o recurso quando o recurso faz pulling
export interface SolicitacaoDeReservaPedenteEntity {
    solicitacaoDeReservaId: string; // UUID
    recursoId: string;
    usuarioId: string;
    solicitacaoTimestamp: string;
    expiracaoTimestamp: string;
}




export type ResultadoDeSolicitacaoProcessadaEnum =
    | 'aceita'
    | 'negada';

// Recurso -> Backend / POST
export interface SolicitacaoDeReservaProcessada {
    resultado: ResultadoDeSolicitacaoProcessadaEnum;
    solicitacaoDeReservaId: string; // UUID
}

// Schemas

export const SolicitacaoDeReservaPedenteEntitySchema = t.Object({
    solicitacaoDeReservaId: t.String(),
    recursoId: t.String(),
    usuarioId: t.String(),
    solicitacaoTimestamp: t.String(),
    expiracaoTimestamp: t.String(),
}) satisfies { static: SolicitacaoDeReservaPedenteEntity };


export const SolicitacaoDeReservaProcessadaSchema = t.Object({
    resultado: t.Enum({
        aceita: 'aceita',
        negada: 'negada'
    }),
    solicitacaoDeReservaId: t.String(),
}) satisfies { static: SolicitacaoDeReservaProcessada };
