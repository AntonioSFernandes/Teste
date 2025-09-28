<script lang="ts">
    import { invalidate } from "$app/navigation";
    import { onDestroy } from "svelte";
    import type { PageProps } from "./$types";

    let { data }: PageProps = $props();

    let { recursos } = data;

    let interval = setInterval(async () => await invalidate("recursos:recursos"), 5000);

    onDestroy(() => clearInterval(interval));
</script>

<table>
    <thead>
        <tr>
            <th>Nome</th>
            <th>Descrição</th>
            <th>Estado</th>
        </tr>
    </thead>
    <tbody>
        {#each recursos as recurso}
            <tr>
                <td>{recurso.nome}</td>
                <td>{recurso.descricao}</td>
                <td>{recurso.estado.estado}</td>

            </tr>
        {/each}
    </tbody>
</table>

<style>
    table {
        border: 1px solid black;
    }

    td {
        border: 1px solid black;
    }
</style>
