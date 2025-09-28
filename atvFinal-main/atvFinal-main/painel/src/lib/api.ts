import { dev } from "$app/environment";
import type { MainServer } from "@backend/http/MainServer"
import { treaty, type Treaty } from "@elysiajs/eden"

let api: Treaty.Create<MainServer>;

const url =  dev ? "http://localhost:5173" : "http://localhost:8080"

let authorization: string | undefined = undefined;

export function getApi() {
    if (!api) {
        createApi()
        return api
    } else {
        return api
    }
}


function createApi() {

    if (authorization) {
        console.log("Criando cliente de api com token de autorização:", authorization);
        api = treaty<MainServer>(url, {
            headers: {
                "authorization": authorization
            }
        })
    } else {
        console.log("Criando cliente de api sem token de autorização");
        api = treaty<MainServer>(url)
    }


}



export function updateAuthorization(token: string) {
    authorization = token;
    createApi()
}