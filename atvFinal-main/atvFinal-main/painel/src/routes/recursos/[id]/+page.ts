import { getApi } from "$lib/api";
import type { PageLoad } from "./$types";


export const load: PageLoad = async ({ params, depends }) => {

    const response = await getApi().api.recurso({ id: params.id }).get()

    if (response.error) {
        console.error(response.error)
        return { error: "Aconteceu um erro ao carregar o recurso" }
    }

    return { recurso: response.data }

}