import { Elysia, t, sse } from "elysia";
import { getSolicitacaoReservaPendente, handleAtualizacaoDeEstadoRequest, handleSolicitacaoDeReservaProcessada } from "./EstadoRecursoCache";
import { AtualizacaoDeEstadoSchema, type AtualizacaoDeEstado } from "./AtualizacaoDeEstado";
import { SolicitacaoDeReservaPedenteEntitySchema, SolicitacaoDeReservaProcessadaSchema } from "./SolicitacaoDeReserva";
import { db } from "../database/Database";


// Map < secret, recursoId >
const secretCache = new Map<string, string>();


const RecursoServer = new Elysia()

    // Fornece tipagem para o resolve, más não força a presença do header,
    // pois o header for definido na construção do cliente de api e não em cada requisição individual
    .guard({
        headers: t.Optional(t.Object({
            authorization: t.String()
        })),
    })

    //
    .resolve(async ({ headers, status }) => {

        const secret = headers.authorization;

        // 
        if (!secret) {
            return status(401, { message: "Cabeçalho de autorização ausente" });
        }

        // Verificar cache
        let recursoId = secretCache.get(secret);

        if (!recursoId) {
            // Buscar no banco de dados
            const row = await db
                .selectFrom('recurso')
                .where('secretToken', '=', secret)
                .select(['id'])
                .executeTakeFirst()

            if (!row) {
                return status(401, { message: "Recurso não autorizado" });
            }

            recursoId = row.id;
            secretCache.set(secret, recursoId);

        }

        return { recursoId };


    })

    .post("/atualizacao_estado", ({ body, status, recursoId }) => {

        handleAtualizacaoDeEstadoRequest(recursoId, body.atualizacaoDeEstado)

        return status(200)
    }, {
        body: t.Object({
            atualizacaoDeEstado: AtualizacaoDeEstadoSchema,
        }),

    })



    .get("/solicitacao_de_reserva_pedente", ({ status, recursoId }) => {

        const solicitacao = getSolicitacaoReservaPendente(recursoId)

        if (!solicitacao) {
            return status(404, {})
        }

        return status(200, solicitacao)
    }, {
        response: {
            200: SolicitacaoDeReservaPedenteEntitySchema,
            404: t.Object({})
        }
    })
    .post("/resultado_solicitacao_de_reserva", ({ body, status, recursoId }) => {

        handleSolicitacaoDeReservaProcessada(recursoId, body.solicitacaoDeReservaProcessada)

        return;
    }, {
        body: t.Object({
            solicitacaoDeReservaProcessada: SolicitacaoDeReservaProcessadaSchema
        }),
    })

    
    .get("/authstatus", async ({ status, recursoId }) => {

        const result = await db
            .selectFrom('recurso')
            .where('id', '=', recursoId)
            .select(['id', 'nome', 'descricao'])
            .executeTakeFirst()

        if (!result) {
            return status(401, { message: "Recurso não encontrado" })
        }

        return status(200, result);

    },
        {
            response: {
                200: t.Object({
                    id: t.String(),
                    nome: t.String(),
                    descricao: t.String()
                }),
                401: t.Object({
                    message: t.String()
                })
            }
        }
    )


export { RecursoServer };
export type RecursoServer = typeof RecursoServer