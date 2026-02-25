import { authenticate } from '$lib/server/auth'
import { generate_id } from '$lib/server/snowflake'
import { redirect, type Handle } from '@sveltejs/kit'

export const handle: Handle = async ({ event, resolve }) => {
	authenticate(event)

	const is_protected = event.url.pathname.startsWith('/app')

	if (is_protected && !event.locals.user) {
		redirect(302, '/login')
	}

	return await resolve(event)
}
