import { JWT_SECRET } from '$env/static/private'
import type { RequestEvent } from '@sveltejs/kit'
import jwt from 'jsonwebtoken'
import type { UserLocals } from './types'

const JWT_COOKIE_NAME = 'jwt'

export function authenticate(event: RequestEvent): void {
	const token = event.cookies.get(JWT_COOKIE_NAME)
	if (!token) return
	try {
		const { id } = jwt.verify(token, JWT_SECRET) as UserLocals
		event.locals.user = { id }
	} catch (_) {}
}

export function set_auth_cookie(event: RequestEvent, user: UserLocals) {
	const token = jwt.sign(user, JWT_SECRET)

	event.cookies.set(JWT_COOKIE_NAME, token, {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		maxAge: 60 * 60 * 24 * 7 // 1 week
	})
}

export function remove_auth_cookie(event: RequestEvent) {
	event.cookies.delete(JWT_COOKIE_NAME, { path: '/' })
	delete event.locals.user
}
