import { error, fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { name_schema, password_schema } from '$lib/server/schemas'
import { batch, query } from '$lib/server/db'
import bcrypt from 'bcryptjs'
import sql from 'sql-template-tag'
import { get_error_messages } from '$lib/server/schemas'
import { decrypt } from '$lib/server/encryption'

export const load: PageServerLoad = async (event) => {
	const user = event.locals.user
	if (!user) throw error(401, 'Unauthorized')

	const username_query = sql`SELECT name FROM users WHERE id = ${user.id}`

	const blocked_users_query = sql`
	SELECT id, name
	FROM users
	INNER JOIN blocked_users ON users.id = blocked_users.blocked_user_id
	WHERE blocked_users.user_id = ${user.id}`

	const templates_query = sql`
	SELECT id, title_encrypted, title_iv, title_tag
	FROM templates
	WHERE user_id = ${user.id}
	ORDER BY created_at DESC
	`

	const { results, err } = await batch<
		[
			{ name: string }[],
			{ id: string; name: string }[],
			{
				id: string
				title_encrypted: string
				title_iv: string
				title_tag: string
			}[]
		]
	>([username_query, blocked_users_query, templates_query])

	if (err) error(500, 'Database error.')

	const [users, blocked_users, encrypted_templates] = results

	if (!users.length) error(404, 'User not found.')

	const { name } = users[0]

	const templates = encrypted_templates.map((template) => ({
		id: template.id,
		title: decrypt({
			data: template.title_encrypted,
			iv: template.title_iv,
			tag: template.title_tag
		})
	}))

	return { name, blocked_users, templates }
}

export const actions: Actions = {
	name: async (event) => {
		const user = event.locals.user
		if (!user) error(401, 'Unauthorized')

		const form_data = await event.request.formData()

		const name = form_data.get('name') as string

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

		const password = form_data.get('password') as string
		const confirm_password = form_data.get('confirm_password') as string

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

		const blocked_username = form_data.get('blocked_username') as string
		if (!blocked_username) {
			return fail(400, { action: 'block', error: 'No username provided' })
		}

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

		const blocked_user_id = form_data.get('blocked_user_id') as string
		if (!blocked_user_id) {
			return fail(400, { action: 'block', error: 'No user id provided' })
		}

		const unblock_query = sql`
		DELETE FROM blocked_users
		WHERE user_id = ${user.id} AND blocked_user_id = ${blocked_user_id}`

		const { err } = await query(unblock_query)

		if (err) return fail(500, { action: 'block', error: 'Database error.' })

		return { action: 'block', success: true }
	},

	remove_template: async (event) => {
		const user = event.locals.user
		if (!user) error(401, 'Unauthorized')

		const form_data = await event.request.formData()
		const template_id = form_data.get('template_id') as string

		if (!template_id) {
			return fail(400, { action: 'template', error: 'No template id provided' })
		}

		const remove_template_query = sql`
		DELETE FROM templates
		WHERE id = ${template_id} AND user_id = ${user.id}`

		const { err } = await query(remove_template_query)
		if (err) return fail(500, { action: 'template', error: 'Database error.' })

		return { action: 'template', success: true }
	}
}
