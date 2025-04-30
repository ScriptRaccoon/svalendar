import type { Actions } from './$types'
import { fail } from '@sveltejs/kit'
import { get_error_messages } from '$lib/server/utils'
import { db } from '$lib/server/db'
import bcrypt from 'bcryptjs'
import { name_schema, password_schema } from '$lib/server/schemas'
import { DEFAULT_COLOR } from '$lib/config'
import sql from 'sql-template-tag'
import { LibsqlError } from '@libsql/client'

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

		const tx = await db.transaction('write')

		try {
			const user_query = sql`
			INSERT INTO users (name, password_hash)
			VALUES (${name}, ${password_hash})
			RETURNING id`

			const { rows: users } = await tx.execute({
				sql: user_query.sql,
				args: user_query.values as any[]
			})

			if (!users.length) throw new Error('User not created.')

			const user_id = users[0].id as number

			const calendar_query = sql`
			INSERT INTO calendars (name, default_color)
			VALUES ('Default', ${DEFAULT_COLOR})
			RETURNING id as calendar_id`

			const { rows: calendars } = await tx.execute({
				sql: calendar_query.sql,
				args: calendar_query.values as any[]
			})

			if (!calendars?.length) throw new Error('Calendar not created.')

			const calendar_id = calendars[0].calendar_id as string

			const owner_query = sql`
			INSERT INTO calendar_permissions
			(user_id, calendar_id, permission_level, approved_at, revokable)
			VALUES (${user_id}, ${calendar_id}, 'owner', CURRENT_TIMESTAMP, FALSE)`

			await tx.execute({
				sql: owner_query.sql,
				args: owner_query.values as any[]
			})

			const default_calendar_query = sql`
			UPDATE users
			SET default_calendar_id = ${calendar_id}
			WHERE id = ${user_id}`

			await tx.execute({
				sql: default_calendar_query.sql,
				args: default_calendar_query.values as any[]
			})

			await tx.commit()
			tx.close()

			return { success: true, name }
		} catch (err) {
			console.error('transaction failed', err)
			tx.close()

			if (err instanceof LibsqlError && err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
				return fail(400, {
					error: 'User with that name already exists.',
					name
				})
			}

			return fail(500, { error: 'Database error.', name })
		}
	}
}
