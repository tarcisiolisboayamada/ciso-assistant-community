import { BASE_API_URL } from '$lib/utils/constants';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ fetch }) => {
	const req = await fetch(`${BASE_API_URL}/settings/branding/`);
	const responseData = await req.text();

	return new Response(responseData, {
		status: req.status,
		headers: { 'Content-Type': 'application/json' }
	});
};

export const PATCH: RequestHandler = async ({ fetch, request }) => {
	const body = await request.text();
	const req = await fetch(`${BASE_API_URL}/settings/branding/`, {
		method: 'PATCH',
		body,
		headers: { 'Content-Type': 'application/json' }
	});
	const responseData = await req.text();

	return new Response(responseData, {
		status: req.status,
		headers: { 'Content-Type': 'application/json' }
	});
};
