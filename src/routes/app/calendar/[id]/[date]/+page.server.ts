import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { query } from '$lib/server/db'
import type { CalendarBasic, CalendarEvent } from '$lib/server/types'

import { format, addDays } from 'date-fns'
import sql from 'sql-template-tag'

export const load: PageServerLoad = async (event) => {
	const user = event.locals.user
	if (!user) error(401, 'Unauthorized')

	const calendar_id = event.params.id

	const today = event.params.date

	const calendars_query = sql`
	SELECT id, name, default_color
	FROM calendars
	WHERE id = ${calendar_id} AND user_id = ${user.id}`

	const { rows: calendars, err } = await query<CalendarBasic>(calendars_query)
	if (err) error(500, 'Database error.')
	if (!calendars.length) error(404, 'Calendar not found.')

	const url = `/api/events/${calendar_id}?start_date=${today}&end_date=${today}`

	const res = await event.fetch(url)
	if (!res.ok) error(500, 'Failed to fetch events from API')

	const events: CalendarEvent[] = await res.json()

	return { calendar: calendars[0], events, today }
}
