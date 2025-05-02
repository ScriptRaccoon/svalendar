import { COLOR_IDS } from '$lib/config'
import sql from 'sql-template-tag'
import { datetime_schema } from './schemas'
import { query } from './db'
import type { CalendarEvent, CalendarEventEncrypted, EventTitleEncrypted } from './types'
import { decrypt } from './encryption'

export async function get_validated_event(
	form_data: FormData,
	calendar_id: string,
	event_id: string | null = null // is null for new events
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

	if (!datetime_schema.safeParse(start_time).success) {
		return { status: 400, error_message: 'Invalid start time.', fields }
	}

	if (!datetime_schema.safeParse(end_time).success) {
		return { status: 400, error_message: 'Invalid end time.', fields }
	}

	if (!COLOR_IDS.includes(color)) {
		return { status: 400, error_message: 'Invalid color.', fields }
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
	const { id, calendar_id, start_time, end_time, start_date, end_date, color } = event

	const title = decrypt({
		data: event.title_encrypted,
		iv: event.title_iv,
		tag: event.title_tag
	})

	const description = decrypt({
		data: event.description_encrypted,
		iv: event.description_iv,
		tag: event.description_tag
	})

	const location = decrypt({
		data: event.location_encrypted,
		iv: event.location_iv,
		tag: event.location_tag
	})

	return {
		id,
		calendar_id,
		start_time,
		end_time,
		start_date,
		end_date,
		color,
		title,
		description,
		location
	}
}
