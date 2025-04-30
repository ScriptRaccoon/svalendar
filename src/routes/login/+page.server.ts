import type { Actions } from './$types'
import { fail, redirect } from '@sveltejs/kit'
import { query } from '$lib/server/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '$env/static/private'
import { RateLimiter } from '$lib/server/rate-limiter'
import sql from 'sql-template-tag'

const login_rate_limiter = new RateLimiter(5, 60 * 1000) // 5 attempts per minute

export const load = async (event) => {
	const user = event.locals.user
	if (user) redirect(302, '/app/dashboard')
}

export const actions: Actions = {
	default: async (event) => {
		const form_data = await event.request.formData()
		const name = form_data.get('name') as string | null

		const ip = event.getClientAddress()
		if (login_rate_limiter.is_rate_limited(ip)) {
			return fail(429, {
				error: 'Too many requests. Please try again later.',
				name
			})
		}

		const password = form_data.get('password') as string | null
		if (!name) {
			return fail(400, { error: 'Name is required.', name })
		}

		const user_query = sql`
		SELECT id, password_hash, default_calendar_id
		FROM users
		WHERE name = ${name}`

		const { rows, err } = await query<{
			id: number
			password_hash: string
			default_calendar_id: number | null
		}>(user_query)

		if (err) {
			return fail(500, { error: 'Database error.', name })
		}

		if (!rows.length) {
			return fail(400, { error: 'Invalid name or password.', name })
		}

		const { password_hash, id, default_calendar_id } = rows[0]

		const pw_is_correct = await bcrypt.compare(password!, password_hash)
		if (!pw_is_correct) {
			return fail(400, { error: 'Invalid name or password.', name })
		}

		login_rate_limiter.clear(ip)

		const token = jwt.sign({ id }, JWT_SECRET)

		event.cookies.set('jwt', token, {
			httpOnly: true,
			maxAge: 60 * 60 * 24 * 7, // 1 week
			path: '/',
			secure: true
		})

		const login_query = sql`
		UPDATE users
		SET last_login = CURRENT_TIMESTAMP
		WHERE name = ${name}`

		await query(login_query) // ignore errors on purpose

		const redirect_url = default_calendar_id
			? `/app/calendar/${default_calendar_id}`
			: '/app/dashboard'

		redirect(302, redirect_url)
	}
}
