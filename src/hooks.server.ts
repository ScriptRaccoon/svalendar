import { JWT_SECRET } from '$env/static/private'
import type { UserLocals } from '$lib/server/types'
import { redirect, type Handle } from '@sveltejs/kit'
import jwt from 'jsonwebtoken'

const protected_paths = ['/app', '/account'] as const

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('jwt')
	if (token) {
		try {
			const decoded = jwt.verify(token, JWT_SECRET) as UserLocals
			event.locals.user = decoded
		} catch (err) {
			console.error('JWT verification failed:', err)
			event.locals.user = undefined
		}
	} else {
		event.locals.user = undefined
	}

	const is_protected = protected_paths.some((path) =>
		event.url.pathname.startsWith(path)
	)

	if (is_protected && !event.locals.user) {
		redirect(302, '/login')
	}

	return await resolve(event)
}
