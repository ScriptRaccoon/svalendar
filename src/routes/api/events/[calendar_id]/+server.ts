import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { query } from '$lib/server/db'
import type { CalendarEvent, CalendarEventEncrypted } from '$lib/server/types'
import { z } from 'zod'
import sql from 'sql-template-tag'
import { decrypt_calendar_event } from '$lib/server/events'
import { get_permission } from '$lib/server/permission'

export const GET: RequestHandler = async (event) => {
	const user = event.locals.user
	if (!user) error(401, 'Unauthorized')

	const calendar_id = Number(event.params.calendar_id)

	const permission_level = await get_permission(calendar_id, user.id)
	if (!permission_level) {
		error(403, 'Permission denied.')
	}

	const start_date = event.url.searchParams.get('start_date')
	const end_date = event.url.searchParams.get('end_date')

	if (!start_date || !end_date) {
		error(400, 'Missing start_date or end_date query parameter')
	}

	if (z.string().date().safeParse(start_date).error) {
		error(400, 'Invalid start_date format')
	}

	if (z.string().date().safeParse(end_date).error) {
		error(400, 'Invalid end_date format')
	}

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
        AND start_date <= ${end_date}
        AND end_date >= ${start_date}
    ORDER BY
        start_time ASC
	`

	const { rows, err } = await query<CalendarEventEncrypted>(events_query)
	if (err) error(500, 'Database error.')

	const events: CalendarEvent[] = rows.map(decrypt_calendar_event)

	return json(events)
}
