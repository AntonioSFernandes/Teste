import { getApi } from '$lib/api';
import type { PageLoad } from './$types';


export const load: PageLoad = async ({ depends }) => {

    depends('recursos:recursos')

    const response = await getApi().api.recursos.get()

    if (response.error) {
        console.error(response.error)
        return { recursos: [] }
    }

    return { recursos: response.data }

}