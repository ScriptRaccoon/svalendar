import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
	event.cookies.delete('jwt', { path: '/' });
	event.locals.user = undefined;
	redirect(302, '/login');
};
