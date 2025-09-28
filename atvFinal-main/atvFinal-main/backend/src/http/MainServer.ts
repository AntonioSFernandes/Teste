import { Elysia } from "elysia";
import { RecursoEndpoints } from "./RecursoEndpoints";


const MainServer = new Elysia({prefix: '/api'})
    .use(RecursoEndpoints)




export { MainServer };
export type MainServer = typeof MainServer
