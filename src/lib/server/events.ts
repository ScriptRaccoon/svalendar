import { COLOR_IDS } from '$lib/config'
import sql from 'sql-template-tag'
import { datetime_schema } from './schemas'
import { query } from './db'
import type { CalendarEvent, CalendarEventEncrypted, EventTitleEncrypted } from './types'
import { decrypt } from './encryption'

export async function get_validated_event(
	form_data: FormData,
	calendar_id: number,
	event_id: number | null = null
) {
	const title = form_data.get('title') as string
	const description = form_data.get('description') as string
	const start_time = form_data.get('start_time') as string
	const end_time = form_data.get('end_time') as string
	const location = form_data.get('location') as string
	const color = form_data.get('color') as string | null

	const fields = {
		title,
		description,
		start_time,
		end_time,
		location,
		color
	}

	if (!title || !start_time || !end_time || !color) {
		return { status: 400, error_message: 'Fill in the required fields.', fields }
	}

	if (new Date(start_time) >= new Date(end_time)) {
		return {
			status: 400,
			error_message: 'End time must be after start time.',
			fields
		}
	}

	if (!COLOR_IDS.includes(color)) {
		return { status: 400, error_message: 'Invalid color.', fields }
	}

	if (!datetime_schema.safeParse(start_time).success) {
		return { status: 400, error_message: 'Invalid start time.', fields }
	}

	if (!datetime_schema.safeParse(end_time).success) {
		return { status: 400, error_message: 'Invalid end time.', fields }
	}

	const overlap_query = sql`
    SELECT
        title_encrypted, title_iv, title_tag
    FROM
        events
    WHERE
        calendar_id = ${calendar_id}
        AND end_time > ${start_time}
        AND start_time < ${end_time}
		AND (${event_id} IS NULL OR id != ${event_id})
    LIMIT 1
    `

	const { rows: overlap_rows, err: overlap_err } =
		await query<EventTitleEncrypted>(overlap_query)

	if (overlap_err) {
		return { status: 500, error_message: 'Database error.', fields }
	}

	if (overlap_rows.length) {
		const overlap = overlap_rows[0]
		const title_overlap = decrypt({
			data: overlap.title_encrypted,
			iv: overlap.title_iv,
			tag: overlap.title_tag
		})

		return {
			status: 400,
			error_message: `Time overlaps with another event (${title_overlap}).`,
			fields
		}
	}

	return { status: 200, error_message: null, fields }
}

export function decrypt_calendar_event(event: CalendarEventEncrypted): CalendarEvent {
	return {
		id: event.id,
		calendar_id: event.calendar_id,
		title: decrypt({
			data: event.title_encrypted,
			iv: event.title_iv,
			tag: event.title_tag
		}),
		description: decrypt({
			data: event.description_encrypted,
			iv: event.description_iv,
			tag: event.description_tag
		}),
		location: decrypt({
			data: event.location_encrypted,
			iv: event.location_iv,
			tag: event.location_tag
		}),
		start_time: event.start_time,
		end_time: event.end_time,
		color: event.color
	}
}
