

interface EstadoRecursoCacheadoBase {
    recursoId: string

    estado: "disponivel" | "indisponivel";
}

interface EstadoRecursoCacheadoDisponivel extends EstadoRecursoCacheadoBase {
    estado: "disponivel";
    estadoUpdateTimestamp: string;
}

interface EstadoRecursoCacheadoIndisponivel extends EstadoRecursoCacheadoBase {
    estado: "indisponivel";
    estadoUpdateTimestamp: string;
    expiracaoTimestamp: string;
    reservadoPeloUsuarioId: string;
}

export type EstadoRecursoCacheado =
    | EstadoRecursoCacheadoDisponivel
    | EstadoRecursoCacheadoIndisponivel;