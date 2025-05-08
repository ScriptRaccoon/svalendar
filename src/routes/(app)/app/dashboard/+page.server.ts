import { error, fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { query } from '$lib/server/db'
import type { Calendar } from '$lib/server/types'
import { DEFAULT_COLOR } from '$lib/config'
import sql from 'sql-template-tag'
import { snowflake } from '$lib/server/snowflake'
import { calendar_name_schema, get_error_messages } from '$lib/server/schemas'

export const load: PageServerLoad = async (event) => {
	const user = event.locals.user
	if (!user) error(401, 'Unauthorized')

	const users_query = sql`
	SELECT name FROM users WHERE id = ${user.id}`

	const { rows: users } = await query<{ name: string }>(users_query)

	if (!users?.length) error(404, 'User not found.')

	const { name } = users[0]

	const calendars_query = sql`
	SELECT
		id,
		name,
		is_default_calendar
	FROM
		calendars
	WHERE
		user_id = ${user.id}
	ORDER BY
		name ASC
	`

	const { rows: calendars, err } =
		await query<Pick<Calendar, 'id' | 'name' | 'is_default_calendar'>>(
			calendars_query
		)

	if (err) error(500, 'Database error.')

	return { name, calendars }
}

export const actions: Actions = {
	create_calendar: async (event) => {
		const user = event.locals.user
		if (!user) error(401, 'Unauthorized')

		const form_data = await event.request.formData()
		const name = form_data.get('name') as string

		const name_validation = calendar_name_schema.safeParse(name)

		if (!name_validation.success) {
			return fail(400, {
				action: 'create',
				error: get_error_messages(name_validation.error),
				name
			})
		}

		const calendar_id = await snowflake.generate()

		const insert_query = sql`
		INSERT INTO calendars (id, name, user_id, default_color)
		VALUES (${calendar_id}, ${name}, ${user.id}, ${DEFAULT_COLOR})`

		const { err } = await query(insert_query)

		if (err) {
			return fail(500, { action: 'create', error: 'Database error.', name })
		}

		redirect(302, `/app/calendar/${calendar_id}`)
	}
}
