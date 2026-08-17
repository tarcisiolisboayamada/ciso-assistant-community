<script lang="ts">
	import ciso from '$lib/assets/ciso.svg';

	interface Props {
		height?: number;
		width?: number;
		variant?: 'icon' | 'full';
	}

	let { height = 200, width = 200, variant = 'icon' }: Props = $props();
</script>

{#if variant === 'full'}
	<div class="lockup" style:height="{height}px">
		<img class="c" height={height} width={height} src={ciso} alt="CISO TSI icon" data-testid="logo-image" />
		<span class="wordmark" style:font-size="{height * 0.34}px"
			><span class="wordmark-ciso">CISO</span><span class="wordmark-tsi"> TSI</span></span
		>
	</div>
{:else}
	<img class="c" {height} {width} src={ciso} alt="CISO TSI icon" data-testid="logo-image" />
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
