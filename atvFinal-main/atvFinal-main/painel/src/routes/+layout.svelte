<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
    import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();

	let { auth } = data;

</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>


<header style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1.5rem; background: #f8f9fa; border-bottom: 1px solid #e5e7eb;">
	<div style="font-weight: bold; font-size: 1.2rem;">Painel IoT</div>
	<div style="display: flex; align-items: center; gap: 1rem;">
		{#if auth === null}
			<a href="/login" style="display: flex; align-items: center; gap: 0.5rem; background: none; border: none; cursor: pointer; font-size: 1rem; color: #333; text-decoration: none;">
				<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
				Login
			</a>
			<a href="/cadastro" style="display: flex; align-items: center; gap: 0.5rem; background: none; border: none; cursor: pointer; font-size: 1rem; color: #1976d2; text-decoration: none;">
				<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg>
				Cadastro
			</a>
		{:else}
			<span style="font-size: 1rem; color: #333;">
				{auth.username} <small style="color: #888;">({auth.role})</small>
			</span>
			<button style="display: flex; align-items: center; gap: 0.5rem; background: none; border: none; cursor: pointer; font-size: 1rem; color: #d32f2f;">
				<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
				Logout
			</button>
		{/if}
	</div>
</header>

{@render children?.()}
