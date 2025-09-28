import type { ReadableStreamController } from 'bun'
import { Elysia, sse } from 'elysia'

const clients = new Map<string, ReadableStreamController<string>>()

const app = new Elysia()
    .get('/sse', async function () {
        console.log("Client connected")

        const id = crypto.randomUUID()


        const stream = new ReadableStream<string>({
            start(controller) {
                clients.set(id, controller)
            },
            cancel(reason) {
                clients.delete(id)
            }
        })

        console.log(`client ${id} conectado`)

        return sse(stream)
    })
    .listen(8080)

setInterval(() => {
    clients.forEach((stream, id) => {
        stream.enqueue(`data: ${new Date().toISOString()}`)
    })
}, 1000)

export type App = typeof app