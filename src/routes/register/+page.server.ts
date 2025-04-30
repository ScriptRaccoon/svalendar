import type { Actions } from './$types'
import { fail } from '@sveltejs/kit'
import { get_error_messages } from '$lib/server/utils'
import { query } from '$lib/server/db'
import bcrypt from 'bcryptjs'
import { name_schema, password_schema } from '$lib/server/schemas'
import { DEFAULT_COLOR } from '$lib/config'
import sql from 'sql-template-tag'

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

		const user_query = sql`
			INSERT INTO users (name, password_hash)
			VALUES (${name}, ${password_hash})
			RETURNING id`

		const { rows, err } = await query<{ id: number }>(user_query)

		if (err) {
			if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
				return fail(400, { error: 'User with that name already exists.', name })
			}

			return fail(500, { error: 'Database error.', name })
		}

		if (!rows.length) return fail(500, { error: 'Database error.', name })

		const { id } = rows[0]

		const calendar_query = sql`
			INSERT INTO calendars (name, default_color)
			VALUES ('Default', ${DEFAULT_COLOR})
			RETURNING id as calendar_id`

		const { rows: calendars } = await query<{ calendar_id: number }>(calendar_query)

		if (!calendars?.length) {
			return fail(500, { error: 'Database error.', name })
		}

		const { calendar_id } = calendars[0]

		const owner_query = sql`
			INSERT INTO calendar_permissions (user_id, calendar_id, permission_level, approved_at)
			VALUES (${id}, ${calendar_id}, 'owner', CURRENT_TIMESTAMP)`

		const { err: owner_err } = await query(owner_query)

		if (owner_err) {
			return fail(500, { error: 'Database error.', name })
		}

		return { success: true, name }
	}
}
