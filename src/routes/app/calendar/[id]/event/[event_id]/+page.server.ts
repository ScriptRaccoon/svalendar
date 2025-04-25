import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { query } from '$lib/server/db'
import type { CalendarEvent } from '$lib/server/types'
import type { Actions } from './$types'
import { fail } from '@sveltejs/kit'
import { redirect } from '@sveltejs/kit'
import { add_seconds } from '$lib/server/utils'
import { COLOR_IDS } from '$lib/config'
import { date_schema } from '$lib/server/schemas'
import { format } from 'date-fns'

export const load: PageServerLoad = async (event) => {
	const user = event.locals.user
	if (!user) throw error(401, 'Unauthorized')

	const calendar_id = event.params.id
	const event_id = event.params.event_id

	const sql = `
    SELECT
        id, title, description, start_time, end_time, location, color
    FROM
        events
    WHERE
        id = ? AND calendar_id IN (
            SELECT id FROM calendars WHERE user_id = ?
        )
    `

	const args = [event_id, user.id]

	const { rows, err } = await query<CalendarEvent>(sql, args)
	if (err) error(500, 'Database error.')
	if (!rows.length) error(404, 'Event not found.')
	return { calendar_id, event: rows[0] }
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
		const start_time = add_seconds(form_data.get('start_time') as string)
		const end_time = add_seconds(form_data.get('end_time') as string)
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

		if (!date_schema.safeParse(start_time).success) {
			return fail(400, { error: 'Invalid start time.', ...fields })
		}

		if (!date_schema.safeParse(end_time).success) {
			return fail(400, { error: 'Invalid end time.', ...fields })
		}

		const sql = `
        UPDATE events
            SET
                title = ?,
                description = ?,
                start_time = ?,
                end_time = ?,
                location = ?,
                color = ?
        WHERE
            id = ?
            AND calendar_id IN (
                SELECT id FROM calendars WHERE user_id = ?
            )
        `

		const args = [
			title,
			description || null,
			start_time,
			end_time,
			location || null,
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
		const start_time = add_seconds(form_data.get('start_time') as string)
		const date = format(start_time, 'yyyy-MM-dd')
		redirect(302, `/app/calendar/${calendar_id}/${date}`)
	}
}
