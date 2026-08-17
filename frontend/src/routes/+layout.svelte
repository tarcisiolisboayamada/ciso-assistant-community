<script lang="ts">
	import { run } from 'svelte/legacy';
	import { onMount } from 'svelte';

	// Most of the app wide CSS should be put in this file
	import '../app.css';
	import '@fortawesome/fontawesome-free/css/all.min.css';

	import { browser } from '$app/environment';

	onMount(() => {
		document.body.dataset.hydrated = 'true';
	});

	import Toast from '$lib/components/Toast/Toast.svelte';
	import Dialog from '$lib/components/Modals/Modal.svelte';
	import DisplayJSONModal from '$lib/components/Modals/DisplayJSONModal.svelte';
	import CreateModal from '$lib/components/Modals/CreateModal.svelte';
	import DeleteConfirmModal from '$lib/components/Modals/DeleteConfirmModal.svelte';
	import ProblematicScenariosModal from '$lib/components/Modals/ProblematicScenariosModal.svelte';
	import { initializeModalStore, type ModalComponent } from '$lib/components/Modals/stores';
	import {
		initializeToastStore,
		getToastStore,
		type ToastSettings
	} from '$lib/components/Toast/stores';

	import { getFlash } from 'sveltekit-flash-message';
	import { page } from '$app/stores';
	import { clientSideToast } from '$lib/utils/stores';
	import { generateRamp, rampToCssVars } from '$lib/utils/colorRamp';

	initializeModalStore();
	initializeToastStore();

	const flash = getFlash(page);
	const toastStore = getToastStore();

	const toast = (message: string, options: Record<string, string>) => {
		const t: ToastSettings = {
			message: message,
			...options
		};
		toastStore.trigger(t);
	};

	interface FlashMessage {
		message: string;
		type: 'success' | 'error' | 'warning' | 'info';
		timeout?: number;
		autohide?: boolean;
	}

	function handleToast(flash: FlashMessage | undefined) {
		if (!flash) return;

		const background =
			flash.type == 'success'
				? 'preset-filled-success-500'
				: flash.type === 'error'
					? 'preset-filled-error-500'
					: flash.type == 'warning'
						? 'preset-filled-warning-500'
						: 'preset-filled-primary-500';

		const toastOptions: ToastSettings = {
			background
		};

		if (flash.timeout !== undefined) {
			toastOptions.timeout = flash.timeout;
		}
		if (flash.autohide !== undefined) {
			toastOptions.autohide = flash.autohide;
		}

		toast(flash.message, toastOptions);
	}

	clientSideToast.subscribe((flash) => {
		handleToast(flash);
		clientSideToast.set(undefined);
	});

	flash.subscribe(($flash) => {
		handleToast($flash);
		// Clearing the flash message could sometimes
		// be required here to avoid double-toasting.
		flash.set(undefined);
	});

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	const modalRegistry: Record<string, ModalComponent> = {
		// Set a unique modal ID, then pass the component reference
		displayJSONModal: { ref: DisplayJSONModal },
		createModal: { ref: CreateModal },
		deleteConfirmModal: { ref: DeleteConfirmModal },
		problematicScenariosModal: { ref: ProblematicScenariosModal }
	};

	run(() => {
		if (browser && $page.url.searchParams.has('refresh')) {
			$page.url.searchParams.delete('refresh');
			window.location.href = $page.url.href;
		}
	});

	let branding = $derived($page.data?.branding);
	let brandingVisible = $derived(!!$page.data?.user || branding?.show_to_unauthenticated !== false);

	let brandingCss = $derived.by(() => {
		if (!branding) return '';
		const blocks: string[] = [];
		if (branding.primary_color) {
			blocks.push(rampToCssVars('primary', generateRamp(branding.primary_color)));
		}
		if (branding.secondary_color) {
			blocks.push(rampToCssVars('secondary', generateRamp(branding.secondary_color)));
		}
		if (!blocks.length) return '';
		return `[data-theme='cisotheme'] {\n${blocks.join('\n')}\n}`;
	});
</script>

<svelte:head>
	{#if brandingVisible && branding?.favicon_data_uri}
		<link rel="icon" href={branding.favicon_data_uri} />
	{:else}
		<link rel="icon" href="/favicon.ico" />
	{/if}
	{#if brandingCss}
		{@html `<style>${brandingCss}</style>`}
	{/if}
</svelte:head>
<Dialog components={modalRegistry} />
<Toast zIndex="z-[1000]" />
{@render children?.()}

{#if $flash}
	{@const bg = $flash.type == 'success' ? '#3D9970' : '#FF4136'}
	<div style:background-color={bg} class="flash">{$flash.message}</div>
{/if}
