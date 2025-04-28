import { error, fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { query } from '$lib/server/db'
import type { CalendarBasic } from '$lib/server/types'
import { DEFAULT_COLOR } from '$lib/config'
import sql from 'sql-template-tag'

export const load: PageServerLoad = async (event) => {
	const user = event.locals.user
	if (!user) error(401, 'Unauthorized')

	const calendars_query = sql`
	SELECT id, name
	FROM calendars
	WHERE user_id = ${user.id}
	ORDER BY name ASC`

	const { rows, err } = await query<CalendarBasic>(calendars_query)

	if (err) error(500, 'Database error.')

	return { calendars: rows }
}

export const actions: Actions = {
	createcalendar: async (event) => {
		const user = event.locals.user
		if (!user) error(401, 'Unauthorized')

		const form_data = await event.request.formData()
		const name = form_data.get('name') as string | null

		if (!name) return fail(400, { error: 'Name is required.', name })

		const insert_query = sql`
        INSERT INTO calendars (name, user_id, default_color)
        VALUES (${name}, ${user.id}, ${DEFAULT_COLOR})
        RETURNING id as calendar_id`

		const { rows, err } = await query<{ calendar_id: number }>(insert_query)

		if (err) return fail(500, { error: 'Database error.', name })

		if (!rows.length) return fail(500, { error: 'Database error.', name })

		const { calendar_id } = rows[0]

		redirect(302, `/app/calendar/${calendar_id}`)
	}
}
