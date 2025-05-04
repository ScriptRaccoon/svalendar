import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { batch, query } from '$lib/server/db'
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
	},

	add_participant: async (event) => {
		const user = event.locals.user
		if (!user) error(401, 'Unauthorized')

		const event_id = event.params.event_id

		const form_data = await event.request.formData()
		const participant_name = form_data.get('participant_name') as string | null

		// TODO: show specific errors to the new form

		if (!participant_name) {
			return fail(400, { error: 'Participant name is required.' })
		}

		const user_query = sql`
		SELECT id as participant_id from users WHERE name = ${participant_name}
		`

		const { rows: user_rows, err: err_user } = await query<{
			participant_id: string
		}>(user_query)
		if (err_user) {
			return fail(500, { error: 'Database error.' })
		}

		if (!user_rows.length) {
			return fail(404, { error: 'User not found.' })
		}

		const { participant_id } = user_rows[0]

		const insert_query = sql`
		INSERT INTO event_participants (event_id, user_id, role, status)
		VALUES (${event_id}, ${participant_id}, 'attendee', 'pending')`

		const visibility_query = sql`
		INSERT INTO event_visibilities (event_id, calendar_id)
		SELECT ${event_id}, c.id
		FROM calendars c
		WHERE c.user_id = ${participant_id} AND c.is_default_calendar = TRUE
		`

		const { err } = await batch([insert_query, visibility_query])

		if (err) {
			const is_invited = err.code === 'SQLITE_CONSTRAINT_PRIMARYKEY'
			return is_invited
				? fail(400, { error: 'User is already invited.' })
				: fail(500, { error: 'Database error.' })
		}

		return { success: true }
	}
}
