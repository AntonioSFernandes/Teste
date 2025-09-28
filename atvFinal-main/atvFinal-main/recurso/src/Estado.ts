



export type EstadoBaseEnum = "disponivel" | "indisponivel";

export interface EstadoBase {
    estado: EstadoBaseEnum;
}

export interface EstadoDisponivel extends EstadoBase {
    estado: "disponivel";
}

export interface EstadoIndisponivel extends EstadoBase {
    estado: "indisponivel";
    expiracaoTimestamp: string; // ISO 8601
    reservadoPeloUsuarioId: string;
}

export type Estado = EstadoDisponivel | EstadoIndisponivel;