import { error, fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { name_schema, password_schema } from '$lib/server/schemas'
import { batch, query } from '$lib/server/db'
import bcrypt from 'bcryptjs'
import sql from 'sql-template-tag'
import { get_error_messages } from '$lib/server/schemas'

export const load: PageServerLoad = async (event) => {
	const user = event.locals.user
	if (!user) throw error(401, 'Unauthorized')

	const username_query = sql`SELECT name FROM users WHERE id = ${user.id}`

	const blocked_users_query = sql`
	SELECT id, name
	FROM users
	INNER JOIN blocked_users ON users.id = blocked_users.blocked_user_id
	WHERE blocked_users.user_id = ${user.id}`

	const { results, err } = await batch<
		[{ name: string }[], { id: string; name: string }[]]
	>([username_query, blocked_users_query])

	if (err) error(500, 'Database error.')

	const [users, blocked_users] = results

	if (!users.length) error(404, 'User not found.')

	const { name } = users[0]

	return { name, blocked_users }
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
	},

	block: async (event) => {
		const user = event.locals.user
		if (!user) error(401, 'Unauthorized')

		const form_data = await event.request.formData()

		const blocked_username = form_data.get('blocked_username') as string | null
		if (!blocked_username) {
			return fail(400, { action: 'block', error: 'No username provided' })
		}

		console.info('block ...', blocked_username)

		const block_query = sql`
		INSERT INTO
			blocked_users (user_id, blocked_user_id)
		SELECT
			${user.id}, id
		FROM
			users
		WHERE
			name = ${blocked_username}
		RETURNING blocked_users.blocked_user_id`

		const { rows: users, err } = await query<{ blocked_user_id: string }>(block_query)

		if (err) {
			const is_same_user = err.code === 'SQLITE_CONSTRAINT_CHECK'
			if (is_same_user) {
				return fail(400, { action: 'block', error: 'You cannot block yourself.' })
			}
			const is_already_blocked = err.code === 'SQLITE_CONSTRAINT_PRIMARYKEY'
			if (is_already_blocked) {
				return fail(400, { action: 'block', error: 'User already blocked.' })
			}
			fail(500, { action: 'block', error: 'Database error.' })
		}

		if (!users?.length) {
			return fail(400, { action: 'block', error: 'User not found' })
		}

		return { action: 'block', success: true }
	},

	unblock: async (event) => {
		const user = event.locals.user
		if (!user) error(401, 'Unauthorized')

		const form_data = await event.request.formData()

		const blocked_user_id = form_data.get('blocked_user_id') as string | null
		if (!blocked_user_id) {
			return fail(400, { action: 'block', error: 'No user id provided' })
		}

		const unblock_query = sql`
		DELETE FROM blocked_users
		WHERE user_id = ${user.id} AND blocked_user_id = ${blocked_user_id}`

		const { err } = await query(unblock_query)

		if (err) return fail(500, { action: 'block', error: 'Database error.' })

		return { action: 'block', success: true }
	}
}
