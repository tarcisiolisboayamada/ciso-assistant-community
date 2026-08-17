import { BASE_API_URL } from '$lib/utils/constants';

import type { LayoutServerLoad } from './$types';

interface BrandingSettings {
	client_name: string;
	logo_data_uri: string;
	favicon_data_uri: string;
	primary_color: string;
	secondary_color: string;
	show_to_unauthenticated: boolean;
}

const EMPTY_BRANDING: BrandingSettings = {
	client_name: '',
	logo_data_uri: '',
	favicon_data_uri: '',
	primary_color: '',
	secondary_color: '',
	show_to_unauthenticated: true
};

export const load: LayoutServerLoad = async ({ locals, fetch }) => {
	let branding = EMPTY_BRANDING;
	try {
		const res = await fetch(`${BASE_API_URL}/settings/branding/`);
		if (res.ok) branding = await res.json();
	} catch {
		// Branding is purely cosmetic; fall back to defaults on any failure.
	}

	return {
		featureFlags: locals.featureFlags,
		generalSettings: locals.generalSettings,
		branding
	};
};
