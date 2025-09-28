import { t, type Static } from "elysia";
import { check, type TypeEqualityGuard } from "../typeCheck";



// Atualizacao recebida do recurso
export type AtualizacaoDeEstado_EstadoEnum = 
    | "disponivel"
    | "indisponivel";

interface AtualizacaoDeEstadoBase {
    estado: AtualizacaoDeEstado_EstadoEnum;
}

interface AtualizacaoDeEstadoDisponivel extends AtualizacaoDeEstadoBase {
    estado: "disponivel";
}

interface AtualizacaoDeEstadoIndisponivel extends AtualizacaoDeEstadoBase {
    estado: "indisponivel";
    expiracaoTimestamp: string;
    reservadoPeloUsuarioId: string;
}

export type AtualizacaoDeEstado =
    | AtualizacaoDeEstadoDisponivel
    | AtualizacaoDeEstadoIndisponivel;


// Schemas:
const AtualizacaoDeEstado_EstadoEnumSchema = t.Enum({
    disponivel: "disponivel",
    indisponivel: "indisponivel",
});
check<TypeEqualityGuard<
    Static<typeof AtualizacaoDeEstado_EstadoEnumSchema>,
    AtualizacaoDeEstado_EstadoEnum
>>();

// Base
const AtualizacaoDeEstadoBaseSchema = t.Object({
    estado: AtualizacaoDeEstado_EstadoEnumSchema
}) satisfies { static: AtualizacaoDeEstadoBase };

const AtualizacaoDeEstadoDisponivelSchema = t.Intersect([
    AtualizacaoDeEstadoBaseSchema,
    t.Object({
        estado: t.Literal("disponivel")
    })
]) satisfies { static: AtualizacaoDeEstadoDisponivel };

// Indisponível (base + campos extras)
const AtualizacaoDeEstadoIndisponivelSchema = t.Intersect([
    AtualizacaoDeEstadoBaseSchema,
    t.Object({
        estado: t.Literal("indisponivel"),
        expiracaoTimestamp: t.String(),
        reservadoPeloUsuarioId: t.String()
    })
]) satisfies { static: AtualizacaoDeEstadoIndisponivel };

// União
export const AtualizacaoDeEstadoSchema = t.Union([
    AtualizacaoDeEstadoDisponivelSchema,
    AtualizacaoDeEstadoIndisponivelSchema
]);
check<TypeEqualityGuard<
    Static<typeof AtualizacaoDeEstadoSchema>,
    AtualizacaoDeEstado
>>();

