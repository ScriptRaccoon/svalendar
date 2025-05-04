import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { query } from '$lib/server/db'
import type { EventParticipant, CalendarEventEncrypted } from '$lib/server/types'
import type { Actions } from './$types'
import { fail } from '@sveltejs/kit'
import { redirect } from '@sveltejs/kit'
import { encrypt } from '$lib/server/encryption'
import sql from 'sql-template-tag'
import { decrypt_calendar_event, get_validated_event } from '$lib/server/events'

export const load: PageServerLoad = async (event) => {
	const user = event.locals.user
	if (!user) throw error(401, 'Unauthorized')

	const calendar_id = event.params.id
	const event_id = event.params.event_id

	const event_query = sql`
    SELECT
        e.id,
		title_encrypted, title_iv, title_tag,
		description_encrypted, description_iv, description_tag,
		location_encrypted, location_iv, location_tag,
		start_time, end_time, event_date, color
    FROM
        event_visibilities v
	INNER JOIN
		events e ON e.id = v.event_id
	WHERE
		v.calendar_id = ${calendar_id}
		AND v.event_id = ${event_id}
    `

	const { rows: rows_calendars, err: err_calendars } =
		await query<CalendarEventEncrypted>(event_query)
	if (err_calendars) error(500, 'Database error.')
	if (!rows_calendars.length) error(404, 'Event not found.')

	const calendar_event = decrypt_calendar_event(rows_calendars[0])

	const participants_query = sql`
	SELECT u.id, u.name, p.role, p.status
	FROM event_participants p
	INNER JOIN users u ON u.id = p.user_id
	WHERE p.event_id = ${event_id}`

	const { rows: participants, err: err_participants } =
		await query<EventParticipant>(participants_query)

	if (err_participants) error(500, 'Database error.')

	return { calendar_id, event: calendar_event, participants }
}

export const actions: Actions = {
	update: async (event) => {
		const user = event.locals.user
		if (!user) error(401, 'Unauthorized')

		const calendar_id = event.params.id
		const event_id = event.params.event_id

		const form_data = await event.request.formData()

		const { status, fields, error_message } = await get_validated_event(
			form_data,
			calendar_id,
			event_id
		)

		if (error_message) {
			return fail(status, { error: error_message, ...fields })
		}

		const encrypted_title = encrypt(fields.title)
		const encrypted_description = encrypt(fields.description)
		const encrypted_location = encrypt(fields.location)

		const events_query = sql`
        UPDATE events
            SET
                title_encrypted = ${encrypted_title.data},
				title_iv = ${encrypted_title.iv},
				title_tag = ${encrypted_title.tag},
                description_encrypted = ${encrypted_description.data},
				description_iv = ${encrypted_description.iv},
				description_tag = ${encrypted_description.tag},
                location_encrypted = ${encrypted_location.data},
				location_iv = ${encrypted_location.iv},
				location_tag = ${encrypted_location.tag},
                start_time = ${fields.start_time},
                end_time = ${fields.end_time},
				event_date = ${fields.date},
                color = ${fields.color}
        WHERE
            id = ${event_id}
		`

		const { err } = await query(events_query)
		if (err) return fail(500, { error: 'Database error.', ...fields })

		redirect(302, `/app/calendar/${calendar_id}/${fields.date}`)
	},

	delete: async (event) => {
		const user = event.locals.user
		if (!user) error(401, 'Unauthorized')

		const calendar_id = event.params.id
		const event_id = event.params.event_id

		const delete_query = sql`
        DELETE FROM events
        WHERE id = ${event_id}`

		const { err } = await query(delete_query)
		if (err) return fail(500, { error: 'Database error.' })

		const form_data = await event.request.formData()
		const date = form_data.get('date')

		redirect(302, `/app/calendar/${calendar_id}/${date}`)
	}
}
