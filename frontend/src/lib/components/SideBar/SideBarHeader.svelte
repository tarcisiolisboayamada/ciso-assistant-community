<script lang="ts">
	import { page } from '$app/state';
	import Logo from '$lib/components/Logo/Logo.svelte';

	let clientLogoSrc = $derived(page.data?.branding?.client_logo_data_uri);
</script>

<header>
	<a href="/analytics" class="flex flex-col space-x-4 border-b pb-3 items-center justify-center gap-2">
		<Logo />
		{#if clientLogoSrc}
			<img src={clientLogoSrc} alt="Client logo" class="max-h-10 max-w-[85%] object-contain" />
		{/if}
	</a>
</header>
