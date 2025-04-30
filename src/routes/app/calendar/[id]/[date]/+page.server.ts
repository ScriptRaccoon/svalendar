import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { query } from '$lib/server/db'
import type { Calendar, CalendarEvent } from '$lib/server/types'
import sql from 'sql-template-tag'

export const load: PageServerLoad = async (event) => {
	const user = event.locals.user
	if (!user) error(401, 'Unauthorized')

	const calendar_id = Number(event.params.id)
	const today = event.params.date

	const calendars_query = sql`
	SELECT
		c.id, c.name, c.default_color, cp.permission_level
	FROM
		calendar_permissions cp
	INNER JOIN
		calendars c ON c.id = cp.calendar_id
	WHERE
		cp.approved_at IS NOT NULL
		AND c.id = ${calendar_id}
		AND cp.user_id = ${user.id}`

	const { rows: calendars, err } = await query<Calendar>(calendars_query)

	if (err) error(500, 'Database error.')
	if (!calendars.length) error(404, 'Calendar not found.')

	const calendar = calendars[0]

	const url = `/api/events/${calendar_id}?start_date=${today}&end_date=${today}`

	const res = await event.fetch(url)
	if (!res.ok) error(500, 'Failed to fetch events from API')

	const events: CalendarEvent[] = await res.json()

	return { calendar, events, today }
}
