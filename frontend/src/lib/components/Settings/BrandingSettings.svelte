<script lang="ts">
	import { onMount } from 'svelte';

	interface Branding {
		client_name: string;
		logo_data_uri: string;
		favicon_data_uri: string;
		primary_color: string;
		secondary_color: string;
		show_to_unauthenticated: boolean;
	}

	let branding = $state<Branding>({
		client_name: '',
		logo_data_uri: '',
		favicon_data_uri: '',
		primary_color: '',
		secondary_color: '',
		show_to_unauthenticated: true
	});

	let status = $state<'idle' | 'loading' | 'saving' | 'saved' | 'error'>('loading');
	let errorMessage = $state('');

	onMount(async () => {
		try {
			const res = await fetch('/fe-api/branding');
			if (res.ok) branding = await res.json();
			status = 'idle';
		} catch {
			status = 'idle';
		}
	});

	function readFileAsDataUri(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = reject;
			reader.readAsDataURL(file);
		});
	}

	async function handleFileInput(event: Event, field: 'logo_data_uri' | 'favicon_data_uri') {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		branding[field] = await readFileAsDataUri(file);
	}

	async function save() {
		status = 'saving';
		errorMessage = '';
		try {
			const res = await fetch('/fe-api/branding', {
				method: 'PATCH',
				body: JSON.stringify(branding)
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				errorMessage = JSON.stringify(data);
				status = 'error';
				return;
			}
			branding = await res.json();
			status = 'saved';
		} catch (e) {
			errorMessage = e instanceof Error ? e.message : String(e);
			status = 'error';
		}
	}
</script>

<div class="space-y-6 max-w-xl">
	<span class="text-surface-600-400 block">
		Customize the product name, logo, favicon, and accent colors shown across the interface.
	</span>

	<label class="block">
		<span class="text-sm font-medium">Client name</span>
		<input class="input" type="text" bind:value={branding.client_name} placeholder="CISO TSI" />
	</label>

	<label class="block">
		<span class="text-sm font-medium">Logo</span>
		<input class="input" type="file" accept="image/*" onchange={(e) => handleFileInput(e, 'logo_data_uri')} />
		{#if branding.logo_data_uri}
			<img src={branding.logo_data_uri} alt="Logo preview" class="h-12 mt-2" />
		{/if}
	</label>

	<label class="block">
		<span class="text-sm font-medium">Favicon</span>
		<input
			class="input"
			type="file"
			accept="image/*"
			onchange={(e) => handleFileInput(e, 'favicon_data_uri')}
		/>
		{#if branding.favicon_data_uri}
			<img src={branding.favicon_data_uri} alt="Favicon preview" class="h-8 mt-2" />
		{/if}
	</label>

	<div class="flex gap-6">
		<label class="block">
			<span class="text-sm font-medium">Primary color</span>
			<input class="input" type="color" bind:value={branding.primary_color} />
		</label>
		<label class="block">
			<span class="text-sm font-medium">Secondary color</span>
			<input class="input" type="color" bind:value={branding.secondary_color} />
		</label>
	</div>

	<label class="flex items-center gap-2">
		<input type="checkbox" bind:checked={branding.show_to_unauthenticated} />
		<span class="text-sm">Show custom branding to unauthenticated users (login screen)</span>
	</label>

	<button class="btn preset-filled-primary-500" onclick={save} disabled={status === 'saving'}>
		{status === 'saving' ? 'Saving…' : 'Save'}
	</button>

	{#if status === 'saved'}
		<span class="text-success-500 text-sm block">Saved.</span>
	{:else if status === 'error'}
		<span class="text-error-500 text-sm block">Error: {errorMessage}</span>
	{/if}
</div>
