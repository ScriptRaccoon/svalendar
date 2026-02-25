import type { Actions, PageServerLoad } from './$types'
import { fail, redirect } from '@sveltejs/kit'
import { query } from '$lib/server/db'
import bcrypt from 'bcryptjs'
import { RateLimiter } from '$lib/server/rate-limiter'
import sql from 'sql-template-tag'
import { dev } from '$app/environment'
import { set_auth_cookie } from '$lib/server/auth'

const login_rate_limiter = new RateLimiter(5, 60 * 1000) // 5 attempts per minute

export const load: PageServerLoad = async (event) => {
	const user = event.locals.user
	if (user) redirect(302, '/dashboard')
}

export const actions: Actions = {
	default: async (event) => {
		const form = await event.request.formData()
		const username = form.get('username') as string

		if (!username) {
			return fail(400, { error: 'Username is required.', username })
		}

		const ip = event.getClientAddress()
		if (!dev && login_rate_limiter.is_rate_limited(ip)) {
			return fail(429, {
				error: 'Too many requests. Please try again later.',
				username: username
			})
		}

		const password = form.get('password') as string

		if (!password) {
			return fail(400, { error: 'Password is required.', username })
		}

		const user_query = sql`
		SELECT users.id, password_hash, calendars.id as default_calendar_id
		FROM users
		LEFT JOIN calendars ON calendars.user_id = users.id
		WHERE users.name = ${username} and calendars.is_default_calendar = TRUE`

		const { rows, err } = await query<{
			id: string
			password_hash: string
			default_calendar_id: string | null
		}>(user_query)

		if (err) {
			return fail(500, { error: 'Database error.', username })
		}

		if (!rows.length) {
			return fail(400, { error: 'Invalid credentials.', username })
		}

		const { password_hash, id, default_calendar_id } = rows[0]

		const pw_is_correct = await bcrypt.compare(password!, password_hash)

		if (!pw_is_correct) {
			return fail(400, { error: 'Invalid credentials.', username })
		}

		login_rate_limiter.clear(ip)

		set_auth_cookie(event, { id })

		const login_query = sql`
		UPDATE users
		SET last_login = CURRENT_TIMESTAMP
		WHERE id = ${id}`

		await query(login_query) // ignore errors on purpose

		const redirect_url = default_calendar_id
			? `/calendar/${default_calendar_id}`
			: '/dashboard'

		redirect(302, redirect_url)
	}
}
