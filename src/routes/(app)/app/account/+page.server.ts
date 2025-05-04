import { error, fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { name_schema, password_schema } from '$lib/server/schemas'
import { query } from '$lib/server/db'
import bcrypt from 'bcryptjs'
import sql from 'sql-template-tag'
import { get_error_messages } from '$lib/server/schemas'

export const load: PageServerLoad = async (event) => {
	const user = event.locals.user
	if (!user) throw error(401, 'Unauthorized')

	const username_query = sql`SELECT name FROM users WHERE id = ${user.id}`
	const { rows } = await query<{ name: string }>(username_query)
	if (!rows?.length) error(404, 'User not found.')
	return { name: rows[0].name }
}

export const actions: Actions = {
	name: async (event) => {
		const user = event.locals.user
		if (!user) error(401, 'Unauthorized')

		const form_data = await event.request.formData()

		const name = form_data.get('name') as string | null

		const name_validation = name_schema.safeParse(name)

		if (name_validation.error) {
			return fail(400, {
				action: 'name',
				error: get_error_messages(name_validation.error)
			})
		}

		const name_query = sql`
		UPDATE users
		SET name = ${name}
		WHERE id = ${user.id}`

		const { err } = await query(name_query)

		if (err) {
			if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
				return fail(400, {
					action: 'name',
					error: 'User with that name already exists.'
				})
			}

			return fail(500, { action: 'name', error: 'Database error.' })
		}

		return { action: 'name', success: true }
	},
	password: async (event) => {
		const user = event.locals.user
		if (!user) error(401, 'Unauthorized')

		const form_data = await event.request.formData()

		const password = form_data.get('password') as string | null
		const confirm_password = form_data.get('confirm_password') as string | null

		const password_validation = password_schema.safeParse(password)
		if (password_validation.error) {
			return fail(400, {
				action: 'password',
				error: get_error_messages(password_validation.error)
			})
		}
		if (password !== confirm_password) {
			return fail(400, { action: 'password', error: 'Passwords do not match' })
		}

		const password_hash = await bcrypt.hash(password!, 10)

		const password_query = sql`
		UPDATE users
		SET password_hash = ${password_hash}
		WHERE id = ${user.id}`

		const { err } = await query(password_query)

		if (err) return fail(500, { action: 'password', error: 'Database error.' })

		return { action: 'password', success: true }
	},

	delete: async (event) => {
		const user = event.locals.user
		if (!user) error(401, 'Unauthorized')

		event.cookies.delete('jwt', { path: '/' })
		delete event.locals.user

		const delete_user_query = sql`
		DELETE FROM users
		WHERE id = ${user.id}`

		const { err } = await query(delete_user_query)
		if (err) return fail(500, { action: 'delete', error: 'Database error.' })

		redirect(302, '/')
	}
}
