import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { query } from '$lib/server/db'
import type { CalendarEventEncrypted } from '$lib/server/types'
import type { Actions } from './$types'
import { fail } from '@sveltejs/kit'
import { redirect } from '@sveltejs/kit'
import { format } from 'date-fns'
import { encrypt } from '$lib/server/encryption'
import sql from 'sql-template-tag'
import { decrypt_calendar_event, get_validated_event } from '$lib/server/events'
import { get_permission } from '$lib/server/permission'

export const load: PageServerLoad = async (event) => {
	const user = event.locals.user
	if (!user) throw error(401, 'Unauthorized')

	const calendar_id = Number(event.params.id)
	const event_id = Number(event.params.event_id)

	const permission_level = await get_permission(calendar_id, user.id)
	if (!permission_level || permission_level == 'read') {
		throw error(403, 'Permission denied.')
	}

	const event_query = sql`
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
        id = ${event_id}
    `

	const { rows, err } = await query<CalendarEventEncrypted>(event_query)
	if (err) error(500, 'Database error.')
	if (!rows.length) error(404, 'Event not found.')

	const calendar_event = decrypt_calendar_event(rows[0])

	return { calendar_id, event: calendar_event }
}

export const actions: Actions = {
	update: async (event) => {
		const user = event.locals.user
		if (!user) error(401, 'Unauthorized')

		const calendar_id = Number(event.params.id)
		const event_id = Number(event.params.event_id)

		const permission_level = await get_permission(calendar_id, user.id)
		if (!permission_level || permission_level == 'read') {
			throw error(403, 'Permission denied.')
		}

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
                color = ${fields.color}
        WHERE
            id = ${event_id}
		`

		const { err } = await query(events_query)
		if (err) return fail(500, { error: 'Database error.', ...fields })

		const date = format(fields.start_time, 'yyyy-MM-dd')
		redirect(302, `/app/calendar/${calendar_id}/${date}`)
	},

	delete: async (event) => {
		const user = event.locals.user
		if (!user) error(401, 'Unauthorized')

		const calendar_id = Number(event.params.id)
		const event_id = Number(event.params.event_id)

		const permission_level = await get_permission(calendar_id, user.id)
		if (!permission_level || permission_level == 'read') {
			throw error(403, 'Permission denied.')
		}

		const delete_query = sql`
        DELETE FROM events
        WHERE id = ${event_id}`

		const { err } = await query(delete_query)
		if (err) return fail(500, { error: 'Database error.' })

		const form_data = await event.request.formData()
		const start_time = form_data.get('start_time') as string
		const date = format(start_time, 'yyyy-MM-dd')
		redirect(302, `/app/calendar/${calendar_id}/${date}`)
	}
}
