import type { Actions } from './$types'
import { fail } from '@sveltejs/kit'
import { batch } from '$lib/server/db'
import bcrypt from 'bcryptjs'
import { username_schema, password_schema } from '$lib/server/schemas'
import { DEFAULT_COLOR_ID } from '$lib/server/config'
import sql from 'sql-template-tag'
import { generate_id } from '$lib/server/snowflake'
import { format_error } from '$lib/server/utils'

export const actions: Actions = {
	default: async (event) => {
		const form = await event.request.formData()
		const username = form.get('username') as string
		const password = form.get('password') as string
		const confirm_password = form.get('confirm_password') as string

		const username_validation = username_schema.safeParse(username)

		if (username_validation.error) {
			return fail(400, {
				error: format_error(username_validation.error),
				username
			})
		}

		const password_validation = password_schema.safeParse(password)

		if (password_validation.error) {
			return fail(400, {
				error: format_error(password_validation.error),
				username
			})
		}

		if (password !== confirm_password) {
			return fail(400, { error: 'Passwords do not match.', username })
		}

		const password_hash = await bcrypt.hash(password, 10)

		const user_id = await generate_id()
		const calendar_id = await generate_id()

		const user_query = sql`
		INSERT INTO users (id, name, password_hash)
		VALUES (${user_id}, ${username}, ${password_hash})`

		const calendar_query = sql`
		INSERT INTO calendars
			(id, name, user_id, default_color, is_default_calendar)
		VALUES
			(${calendar_id}, 'Default', ${user_id}, ${DEFAULT_COLOR_ID}, TRUE)`

		const { err } = await batch([user_query, calendar_query])

		if (err) {
			const name_is_taken = err.code === 'SQLITE_CONSTRAINT_UNIQUE'
			return name_is_taken
				? fail(400, {
						error: 'User with that name already exists.',
						username
					})
				: fail(500, { error: 'Database error.', username })
		}

		return { success: true, username }
	}
}
