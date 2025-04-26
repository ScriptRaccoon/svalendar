import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { query } from '$lib/server/db'
import type { CalendarEvent, CalendarEventEncrypted } from '$lib/server/types'
import type { Actions } from './$types'
import { fail } from '@sveltejs/kit'
import { redirect } from '@sveltejs/kit'
import { COLOR_IDS } from '$lib/config'
import { datetime_schema } from '$lib/server/schemas'
import { format } from 'date-fns'
import { decrypt_calendar_event } from '$lib/server/utils'
import { encrypt } from '$lib/server/encryption'

export const load: PageServerLoad = async (event) => {
	const user = event.locals.user
	if (!user) throw error(401, 'Unauthorized')

	const calendar_id = event.params.id
	const event_id = event.params.event_id

	const sql = `
    SELECT
        id,
		title_encrypted, title_iv, title_tag,
		description_encrypted, description_iv, description_tag,
		location_encrypted, location_iv, location_tag,
		start_time, end_time, color
    FROM
        events
    WHERE
        id = ? AND calendar_id IN (
            SELECT id FROM calendars WHERE user_id = ?
        )
    `

	const args = [event_id, user.id]

	const { rows, err } = await query<CalendarEventEncrypted>(sql, args)
	if (err) error(500, 'Database error.')
	if (!rows.length) error(404, 'Event not found.')

	const calendar_event = decrypt_calendar_event(rows[0])

	return { calendar_id, event: calendar_event }
}

export const actions: Actions = {
	update: async (event) => {
		const user = event.locals.user
		if (!user) error(401, 'Unauthorized')

		const calendar_id = event.params.id
		const event_id = event.params.event_id

		const form_data = await event.request.formData()
		const title = form_data.get('title') as string
		const description = form_data.get('description') as string
		const start_time = form_data.get('start_time') as string
		const end_time = form_data.get('end_time') as string
		const location = form_data.get('location') as string
		const color = form_data.get('color') as string

		const fields = {
			title,
			description,
			start_time,
			end_time,
			location,
			color
		}

		if (!title || !start_time || !end_time || !color) {
			return fail(400, { error: 'Fill in the required fields.', ...fields })
		}

		if (new Date(start_time) >= new Date(end_time)) {
			return fail(400, { error: 'End time must be after start time.', ...fields })
		}

		if (!COLOR_IDS.includes(color)) {
			return fail(400, { error: 'Invalid color.', ...fields })
		}

		if (!datetime_schema.safeParse(start_time).success) {
			return fail(400, { error: 'Invalid start time.', ...fields })
		}

		if (!datetime_schema.safeParse(end_time).success) {
			return fail(400, { error: 'Invalid end time.', ...fields })
		}

		const encrypted_title_data = encrypt(title)
		const encrypted_description_data = encrypt(description)
		const encrypted_location_data = encrypt(location)

		const sql = `
        UPDATE events
            SET
                title_encrypted = ?,
				title_iv = ?,
				title_tag = ?,
                description_encrypted = ?,
				description_iv = ?,
				description_tag = ?,
                start_time = ?,
                end_time = ?,
                location_encrypted = ?,
				location_iv = ?,
				location_tag = ?,
                color = ?
        WHERE
            id = ?
            AND calendar_id IN (
                SELECT id FROM calendars WHERE user_id = ?
            )
        `

		const args = [
			encrypted_title_data.data,
			encrypted_title_data.iv,
			encrypted_title_data.tag,
			encrypted_description_data.data,
			encrypted_description_data.iv,
			encrypted_description_data.tag,
			start_time,
			end_time,
			encrypted_location_data.data,
			encrypted_location_data.iv,
			encrypted_location_data.tag,
			color,
			event_id,
			user.id
		]

		const { err } = await query(sql, args)
		if (err) return fail(500, { error: 'Database error.', ...fields })

		const date = format(start_time, 'yyyy-MM-dd')
		redirect(302, `/app/calendar/${calendar_id}/${date}`)
	},

	delete: async (event) => {
		const user = event.locals.user
		if (!user) error(401, 'Unauthorized')
		const calendar_id = event.params.id
		const event_id = event.params.event_id

		const sql = `
        DELETE FROM
            events
        WHERE
            id = ?
            AND calendar_id IN (
                SELECT id FROM calendars WHERE user_id = ?
            )
        `
		const args = [event_id, user.id]
		const { err } = await query(sql, args)
		if (err) return fail(500, { error: 'Database error.' })

		const form_data = await event.request.formData()
		const start_time = form_data.get('start_time') as string
		const date = format(start_time, 'yyyy-MM-dd')
		redirect(302, `/app/calendar/${calendar_id}/${date}`)
	}
}
