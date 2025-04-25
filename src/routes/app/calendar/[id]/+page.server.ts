import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { query } from '$lib/server/db'
import type { CalendarBasic, CalendarEvent } from '$lib/server/types'

import { format, addDays } from 'date-fns'

export const load: PageServerLoad = async (event) => {
	const today = new Date()
	const tomorrow = addDays(today, 1)
	const today_date_str = format(today, 'yyyy-MM-dd')
	const tomorrow_date_str = format(tomorrow, 'yyyy-MM-dd')

	const user = event.locals.user
	if (!user) error(401, 'Unauthorized')

	const calendar_id = event.params.id

	const sql =
		'SELECT id, name, default_color FROM calendars WHERE id = ? AND user_id = ?'
	const args = [calendar_id, user.id]

	const { rows: calendars, err: err_calendars } = await query<CalendarBasic>(sql, args)

	if (err_calendars) error(500, 'Database error.')

	if (!calendars.length) error(404, 'Calendar not found.')

	const url = `/api/events/${calendar_id}?start_date=${today_date_str}&end_date=${tomorrow_date_str}`
	const res = await event.fetch(url)

	if (!res.ok) error(500, 'Failed to fetch events from API')

	const events: CalendarEvent[] = await res.json()

	return { calendar: calendars[0], events, today }
}
