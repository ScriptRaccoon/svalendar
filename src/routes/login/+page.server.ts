import type { Actions } from './$types'
import { fail, redirect } from '@sveltejs/kit'
import { query } from '$lib/server/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '$env/static/private'
import { RateLimiter } from '$lib/server/rate-limiter'

const login_rate_limiter = new RateLimiter(5, 60 * 1000) // 5 attempts per minute

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

		const { rows, err } = await query<{ id: number; password_hash: string }>(
			'SELECT id, password_hash FROM users WHERE name = ?',
			[name]
		)
		if (err) {
			return fail(500, { error: 'Database error.', name })
		}

		if (!rows.length) {
			return fail(400, { error: 'Invalid name or password.', name })
		}

		const { password_hash, id } = rows[0]

		const is_correct = await bcrypt.compare(password!, password_hash)
		if (!is_correct) {
			return fail(400, { error: 'Invalid name or password.', name })
		}

		login_rate_limiter.clear(ip)

		const token = jwt.sign({ id, name }, JWT_SECRET)

		event.cookies.set('jwt', token, {
			httpOnly: true,
			maxAge: 60 * 60 * 24 * 7, // 1 week
			path: '/',
			secure: true
		})

		await query(`UPDATE users SET last_login = datetime('now') WHERE name = ?`, [
			name
		])

		redirect(302, '/app/calendar')
	}
}
