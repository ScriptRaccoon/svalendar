import { authenticate } from '$lib/server/auth'
import { redirect, type Handle } from '@sveltejs/kit'

const protected_routes = ['/account', '/dashboard', '/calendar', '/inbox']

export const handle: Handle = async ({ event, resolve }) => {
	authenticate(event)

	const is_protected = protected_routes.some((route) =>
		event.url.pathname.startsWith(route)
	)

	if (is_protected && !event.locals.user) {
		redirect(302, '/login')
	}

	return await resolve(event)
}
