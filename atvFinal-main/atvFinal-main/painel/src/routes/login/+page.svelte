<script lang="ts">
    let nome = $state("");
    let senha = $state("");
    let confirmarSenha = $state("");
</script>

<h1>Login</h1>

<label for="nome">Nome:</label>
<input id="nome" type="text" bind:value={nome} />

<label for="senha">Senha:</label>
<input id="senha" type="password" bind:value={senha} />

<button type="submit">Entrar</button>
