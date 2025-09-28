import { Elysia, t } from "elysia";
import { db } from "../database/Database";
import { getEstadoRecurso, solicitarReserva } from "../Recurso/EstadoRecursoCache";
import type { ConsultaEstadoResult } from "../Recurso/ConsultaEstadoResult";
import { AuthPlugin } from "./auth/AuthPlugin";


interface RecursoInfo {
    id: string;
    nome: string;
    descricao: string;
    estado: ConsultaEstadoResult;
    secretToken?: string; // Apenas para ADMIN
}

const RecursoEndpoints = new Elysia()
    .use(AuthPlugin)
    .get("/recursos", async ({}) => {

        const recursos = await db.selectFrom('recurso').select(['id', 'nome', 'descricao']).execute()

        const recursoInfos: RecursoInfo[] = recursos.map(recurso => {
            return {
                id: recurso.id,
                nome: recurso.nome,
                descricao: recurso.descricao,
                estado: getEstadoRecurso(recurso.id)
            }
        })
        return recursoInfos
    })
    .get("/recurso/:id", async ({ params, status, auth }) => {
        const recurso = await db.selectFrom('recurso').where('id', '=', params.id).selectAll().executeTakeFirst()

        if (!recurso) {
            return status(404, { message: "Recurso não encontrado" })
        }

        let recursoInfo: RecursoInfo = {
            id: recurso.id,
            nome: recurso.nome,
            descricao: recurso.descricao,
            estado: getEstadoRecurso(recurso.id)
        }

        if(auth?.role === "ADMIN"){
            recursoInfo = {
                ...recursoInfo,
                secretToken: recurso.secretToken
            }
        }

        return recursoInfo
    },{
        requireBeUser: true,
    })
    .post("/recurso", async ({ body, }) => {

        const id = crypto.randomUUID()
        const secretToken = crypto.randomUUID()

        await db.insertInto('recurso').values({
            id,
            secretToken,
            nome: body.nome,
            descricao: body.descricao,
        }).execute()

        return { id, secretToken }

    },
        {
            requiredRole: "ADMIN",
            body: t.Object({
                nome: t.String(),
                descricao: t.String(),
            }),
            response: {
                201: t.Object({
                    id: t.String(),
                    nome: t.String(),
                    descricao: t.String(),
                    secretToken: t.String(),
                })
            }
        }
    )
    .post("/recurso/:id/reservar", async ({ params, auth, status, body }) => {

        const RecursoRow = await db.selectFrom('recurso').where('id', '=', params.id).selectAll().executeTakeFirst()

        if (!RecursoRow) {
            return status(404, { message: "Recurso não encontrado" })
        }

        solicitarReserva({
            recursoId: RecursoRow.id,
            usuarioId: auth.userId,
            expiracaoTimestamp: body.expiracao,
        })

    }, {
        requireBeUser: true,
        body: t.Object({
            expiracao: t.String({format: "date-time"})
        }),
    })
    .post("/recurso/:id/liberar", () => { })



export { RecursoEndpoints }