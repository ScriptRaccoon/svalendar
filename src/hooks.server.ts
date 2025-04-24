import { JWT_SECRET } from '$env/static/private';
import { redirect, type Handle } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('jwt');
	if (token) {
		try {
			const decoded = jwt.verify(token, JWT_SECRET) as { name: string };
			event.locals.name = decoded.name;
		} catch (err) {
			console.error('JWT verification failed:', err);
			event.locals.name = undefined;
		}
	} else {
		event.locals.name = undefined;
	}

	const is_protected = event.url.pathname.startsWith('/app');

	if (is_protected && !event.locals.name) {
		redirect(302, '/login');
	}

	return await resolve(event);
};
