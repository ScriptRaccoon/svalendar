import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import sql from 'sql-template-tag'
import { query } from '$lib/server/db'
import type { CalendarEventEncrypted } from '$lib/server/types'
import type { CalendarEvent } from '$lib/server/types'
import { decrypt_calendar_event } from '$lib/server/events'

export const GET: RequestHandler = async (event) => {
	const user = event.locals.user
	if (!user) error(401, 'Unauthorized')

	const user_query = sql`
    SELECT name, created_at, last_login, default_calendar_id
    FROM users
    WHERE id = ${user.id}
    `

	const { rows: users, err: err_users } = await query(user_query)
	if (err_users) error(500, 'Database error.')

	const calendars_query = sql`
    SELECT c.id, c.name, c.default_color, c.created_at, cp.permission_level
    FROM calendar_permissions cp
    INNER JOIN calendars c ON c.id = cp.calendar_id
    WHERE cp.user_id = ${user.id}
    `

	const { rows: calendars, err: err_calendars } = await query(calendars_query)
	if (err_calendars) error(500, 'Database error.')

	const events_query = sql`
    SELECT
        e.id, e.calendar_id,
        title_encrypted, title_iv, title_tag,
        description_encrypted, description_iv, description_tag,
        location_encrypted, location_iv, location_tag,
        start_time, end_time, event_date, color
    FROM
        events e
    INNER JOIN calendars c ON c.id = e.calendar_id
    INNER JOIN calendar_permissions cp ON cp.calendar_id = c.id
    WHERE
        cp.user_id = ${user.id}
    ORDER BY
        e.start_time ASC
    `

	const { rows, err: err_events } = await query<CalendarEventEncrypted>(events_query)
	if (err_events) error(500, 'Database error.')

	const events: CalendarEvent[] = rows.map(decrypt_calendar_event)

	return json({
		meta: {
			title: 'Data Export',
			created_at: new Date().toISOString()
		},
		user: users[0],
		calendars,
		events
	})
}
