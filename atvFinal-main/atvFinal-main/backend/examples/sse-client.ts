import { Elysia } from 'elysia'
import type { App } from './sse-server'
import { treaty } from '@elysiajs/eden'

const api = treaty<App>("localhost:8080")
    
const response = await api.sse.get()

console.log(response)

if (response.status === 200) {
    const readable = response.data

    if (!readable) throw new Error("No reader")

    while (true) {
        const { value, done } = await readable.next()
        if (done) break
        console.log(value.data)
    }
} else {
    console.log("Error", response)
}

