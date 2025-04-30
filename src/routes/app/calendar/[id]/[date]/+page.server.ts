import type { PageServerLoad } from './$types'
import { error } from '@sveltejs/kit'
import { query } from '$lib/server/db'
import sql from 'sql-template-tag'
import { decrypt_calendar_event } from '$lib/server/events'
import type { Calendar, CalendarEvent, CalendarEventEncrypted } from '$lib/server/types'

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

	const { rows: calendars, err: err_calendars } = await query<Calendar>(calendars_query)

	if (err_calendars) error(500, 'Database error.')
	if (!calendars.length) error(404, 'Calendar not found.')

	const calendar = calendars[0]

	const events_query = sql`
	SELECT
		id, calendar_id,
		title_encrypted, title_iv, title_tag,
		description_encrypted, description_iv, description_tag,
		location_encrypted, location_iv, location_tag,
		start_time, end_time,
		start_date, end_date,
		color
	FROM
		events
	WHERE
		calendar_id = ${calendar_id}
		AND start_date <= ${today}
		AND end_date >= ${today}
	ORDER BY
		start_time ASC
	`

	const { rows, err: err_events } = await query<CalendarEventEncrypted>(events_query)
	if (err_events) error(500, 'Database error.')

	const events: CalendarEvent[] = rows.map(decrypt_calendar_event)

	return { calendar, events, today }
}
