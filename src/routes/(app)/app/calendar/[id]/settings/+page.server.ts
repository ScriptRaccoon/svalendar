import { error, fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { query } from '$lib/server/db'
import type { Calendar } from '$lib/server/types'
import { COLOR_IDS } from '$lib/config'
import sql from 'sql-template-tag'
import { calendar_name_schema, hour_schema } from '$lib/server/schemas'
import { format_error } from '$lib/utils'

export const load: PageServerLoad = async (event) => {
	const user = event.locals.user
	if (!user) error(401, 'Unauthorized')

	const calendar_id = event.params.id

	const calendars_query = sql`
	SELECT
		id,
		name,
		default_color,
		default_start_hour,
		is_default_calendar
	FROM
		calendars
	WHERE
		id = ${calendar_id}
		AND user_id = ${user.id}
	`

	const { rows, err } = await query<Calendar>(calendars_query)

	if (err) error(500, 'Database error.')
	if (!rows.length) error(404, 'Calendar not found.')

	const calendar = rows[0]

	return { calendar }
}

export const actions: Actions = {
	edit: async (event) => {
		const user = event.locals.user
		if (!user) error(401, 'Unauthorized')

		const form_data = await event.request.formData()
		const calendar_id = event.params.id
		const name = form_data.get('name') as string
		const default_color = form_data.get('color') as string
		const default_start_hour = Number(form_data.get('default_start_hour'))

		const name_validation = calendar_name_schema.safeParse(name)

		if (!name_validation.success) {
			return fail(400, {
				action: 'edit',
				error: format_error(name_validation.error)
			})
		}

		if (!hour_schema.safeParse(default_start_hour).success) {
			return fail(400, {
				action: 'edit',
				error: 'Invalid Start Hour'
			})
		}

		if (!default_color)
			return fail(400, { action: 'edit', error: 'Default Color is required.' })

		if (!COLOR_IDS.includes(default_color)) {
			return fail(400, { action: 'edit', error: 'Invalid color.' })
		}

		const update_query = sql`
        UPDATE
			calendars
        SET
			name = ${name},
			default_color = ${default_color},
			default_start_hour = ${default_start_hour}
        WHERE 
			id = ${calendar_id} AND user_id = ${user.id}`

		const { err } = await query(update_query)
		if (err) return fail(500, { action: 'edit', error: 'Database error.' })

		return { action: 'edit', success: true }
	},

	delete: async (event) => {
		const user = event.locals.user
		if (!user) error(401, 'Unauthorized')

		const calendar_id = event.params.id

		const delete_query = sql`
        DELETE FROM
			calendars
        WHERE
			id = ${calendar_id}
			AND user_id = ${user.id}
			AND is_default_calendar = FALSE`

		const { err } = await query(delete_query)
		if (err) return fail(500, { action: 'delete', error: 'Database error.' })

		redirect(302, '/app/dashboard')
	}
}
