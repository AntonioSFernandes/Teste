<script lang="ts">
    import { goto, invalidate } from "$app/navigation";
    import { getApi, updateAuthorization } from "$lib/api";

    let erros = $state("");
    
    let nome = $state("");

    let senha = $state("");

    async function cadastrar() {
        const response = await getApi().api.register.post({
            nome: nome,
            password: senha,
        });

        if (response.error) {
            switch (response.error.status) {
                case 409:
                    erros = response.error.value;
                    break;
                default:
                    erros = "Erro desconhecido.";
            }
            return;
        }
        console.log("Novo usuário registrado:", response.data);

        updateAuthorization(response.data.sessionToken);
        await invalidate("auth:authorization")
        
        await goto("/");

    }
</script>

<h1>Cadastro</h1>

{#if erros}
    <p style="color: red">{erros}</p>
{/if}

<label for="nome">Nome:</label>
<input id="nome" type="text" bind:value={nome} />


<label for="senha">Senha:</label>
<input id="senha" type="password" bind:value={senha} />

<button onclick={cadastrar}>Cadastrar</button>
