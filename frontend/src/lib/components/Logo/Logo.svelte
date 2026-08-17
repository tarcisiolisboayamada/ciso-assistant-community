<script lang="ts">
	import { page } from '$app/state';
	import ciso from '$lib/assets/ciso.svg';

	interface Props {
		height?: number;
		width?: number;
		variant?: 'icon' | 'full';
	}

	let { height = 200, width = 200, variant = 'icon' }: Props = $props();

	let brandingVisible = $derived(
		!!page.data?.user || page.data?.branding?.show_to_unauthenticated !== false
	);
	let logoSrc = $derived((brandingVisible && page.data?.branding?.logo_data_uri) || ciso);
	let clientName = $derived(
		(brandingVisible && page.data?.branding?.client_name) || 'CISO TSI'
	);
</script>

{#if variant === 'full'}
	<div class="lockup" style:height="{height}px">
		<img
			class="c"
			height={height}
			width={height}
			src={logoSrc}
			alt="{clientName} icon"
			data-testid="logo-image"
		/>
		{#if brandingVisible && page.data?.branding?.logo_data_uri}
			<span class="wordmark" style:font-size="{height * 0.34}px">{clientName}</span>
		{:else}
			<span class="wordmark" style:font-size="{height * 0.34}px"
				><span class="wordmark-ciso">CISO</span><span class="wordmark-tsi"> TSI</span></span
			>
		{/if}
	</div>
{:else}
	<img class="c" {height} {width} src={logoSrc} alt="{clientName} icon" data-testid="logo-image" />
{/if}

<style>
	.lockup {
		display: flex;
		align-items: center;
		gap: 0.5em;
	}
	.wordmark {
		letter-spacing: -0.01em;
		white-space: nowrap;
	}
	.wordmark-ciso {
		font-weight: 800;
		color: #010622;
	}
	.wordmark-tsi {
		font-weight: 300;
		color: #2950b2;
	}
	:global(.dark) .wordmark-ciso {
		color: var(--color-surface-50, #fff);
	}
</style>
