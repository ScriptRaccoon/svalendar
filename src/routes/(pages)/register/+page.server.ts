import type { Actions } from './$types'
import { fail } from '@sveltejs/kit'
import { db } from '$lib/server/db'
import bcrypt from 'bcryptjs'
import { name_schema, password_schema } from '$lib/server/schemas'
import { DEFAULT_COLOR } from '$lib/config'
import sql from 'sql-template-tag'
import { LibsqlError } from '@libsql/client'
import { snowflake } from '$lib/server/snowflake'
import { get_error_messages } from '$lib/server/schemas'

export const actions: Actions = {
	default: async (event) => {
		const form_data = await event.request.formData()
		const name = form_data.get('name') as string | null
		const password = form_data.get('password') as string | null
		const confirm_password = form_data.get('confirm_password') as string | null

		const name_validation = name_schema.safeParse(name)

		if (name_validation.error) {
			return fail(400, {
				error: get_error_messages(name_validation.error),
				name
			})
		}

		const password_validation = password_schema.safeParse(password)

		if (password_validation.error) {
			return fail(400, {
				error: get_error_messages(password_validation.error),
				name
			})
		}

		if (password !== confirm_password) {
			return fail(400, { error: 'Passwords do not match.', name })
		}

		const password_hash = await bcrypt.hash(password!, 10)

		try {
			const user_id = await snowflake.generate()
			const calendar_id = await snowflake.generate()

			const user_query = sql`
			INSERT INTO users (id, name, password_hash)
			VALUES (${user_id}, ${name}, ${password_hash})`

			const calendar_query = sql`
			INSERT INTO calendars
				(id, name, user_id, default_color, is_default_calendar)
			VALUES
				(${calendar_id}, 'Default', ${user_id}, ${DEFAULT_COLOR}, TRUE)`

			await db.batch([
				{ sql: user_query.sql, args: user_query.values as any[] },
				{ sql: calendar_query.sql, args: calendar_query.values as any[] }
			])

			return { success: true, name }
		} catch (err) {
			console.error(err)
			const name_is_taken =
				err instanceof LibsqlError && err.code === 'SQLITE_CONSTRAINT_UNIQUE'
			return name_is_taken
				? fail(400, { error: 'User with that name already exists.', name })
				: fail(500, { error: 'Database error.', name })
		}
	}
}
