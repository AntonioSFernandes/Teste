import { getApi } from "$lib/api";
import type { LayoutLoad } from "./$types";



export const load: LayoutLoad = async ({ depends }) => {

    depends("auth:authorization");

    const response = await getApi().api.me.get()

    if(response.error){
        console.log("Layout Load auth error:", response.error);
        return { auth: null };
    }

    const authStatus = response.data.authStatus

    authStatus ? console.log("Usuário autenticado:", authStatus.username) : console.log("Nenhum usuário autenticado");

    return { auth: authStatus };
}