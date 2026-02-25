import { COLOR_IDS, MINIMAL_EVENT_DURATION } from '$lib/server/config'
import sql from 'sql-template-tag'
import {
	date_schema,
	time_schema,
	url_schema,
	event_title_schema,
	event_description_schema,
	event_location_schema
} from './schemas'
import { query } from './db'
import type {
	CalendarEvent,
	CalendarEventEncrypted,
	CalendarTemplate,
	CalendarTemplateEncrypted,
	EventParticipant
} from './types'
import { decrypt } from './encryption'
import { format_error } from '$lib/server/utils'

/**
 * Retrieves the event from the form data and validates it.
 */
export async function get_validated_event(
	form: FormData,
	calendar_id: string | null = null, // null for templates
	event_id: string | null = null // null for new events
) {
	const title = form.get('title') as string
	const description = form.get('description') as string
	const start_time = form.get('start_time') as string
	const end_time = form.get('end_time') as string
	const date = form.get('date') as string
	const location = form.get('location') as string
	const color = form.get('color') as string | null
	const link = form.get('link') as string

	const fields = {
		title,
		description,
		start_time,
		end_time,
		date,
		location,
		color,
		link
	}

	if (!title || !start_time || !end_time || (calendar_id && !date) || !color) {
		return { status: 400, error_message: 'Fill in the required fields.', fields }
	}

	const title_validation = event_title_schema.safeParse(title)
	if (!title_validation.success) {
		return {
			status: 400,
			error_message: format_error(title_validation.error),
			fields
		}
	}

	const description_validation = event_description_schema.safeParse(description)
	if (!description_validation.success) {
		return {
			status: 400,
			error_message: format_error(description_validation.error),
			fields
		}
	}

	const date_validation = date_schema.safeParse(date)
	if (calendar_id && !date_validation.success) {
		return {
			status: 400,
			error_message: format_error(date_validation.error),
			fields
		}
	}

	const start_time_validation = time_schema.safeParse(start_time)
	if (!start_time_validation.success) {
		return {
			status: 400,
			error_message: format_error(start_time_validation.error),
			fields
		}
	}

	const end_time_validation = time_schema.safeParse(end_time)
	if (!end_time_validation.success) {
		return {
			status: 400,
			error_message: format_error(end_time_validation.error),
			fields
		}
	}

	const location_validation = event_location_schema.safeParse(location)
	if (!location_validation.success) {
		return {
			status: 400,
			error_message: format_error(location_validation.error),
			fields
		}
	}

	if (start_time >= end_time) {
		return {
			status: 400,
			error_message: 'Start time must be before end time.',
			fields
		}
	}

	const start_time_date = new Date(`${date}T${start_time}`)
	const end_time_date = new Date(`${date}T${end_time}`)
	const duration = end_time_date.getTime() - start_time_date.getTime()

	if (duration < MINIMAL_EVENT_DURATION * 60 * 1000) {
		return {
			status: 400,
			error_message: `Event must be at least ${MINIMAL_EVENT_DURATION} minutes long.`,
			fields
		}
	}

	if (!COLOR_IDS.includes(color)) {
		return { status: 400, error_message: 'Invalid color.', fields }
	}

	const link_validation = url_schema.safeParse(link)
	if (link && !link_validation.success) {
		return {
			status: 400,
			error_message: format_error(link_validation.error),
			fields
		}
	}

	if (!calendar_id) {
		return { status: 200, error_message: null, fields }
	}

	const overlap_query = sql`
    SELECT
        title_encrypted
    FROM
        event_visibilities v
	INNER JOIN
		events e ON e.id = v.event_id
    WHERE
        v.calendar_id = ${calendar_id}
		AND event_date = ${date}
        AND end_time > ${start_time}
        AND start_time < ${end_time}
		AND (${event_id} IS NULL OR e.id != ${event_id})
    LIMIT 1
    `

	const { rows: overlap_rows, err: overlap_err } = await query<{
		title_encrypted: string
	}>(overlap_query)

	if (overlap_err) {
		return { status: 500, error_message: 'Database error.', fields }
	}

	if (overlap_rows.length) {
		const overlap = overlap_rows[0]
		const title_overlap = decrypt(overlap.title_encrypted)

		return {
			status: 400,
			error_message: `Time overlaps with another event (${title_overlap}).`,
			fields
		}
	}

	return { status: 200, error_message: null, fields }
}

/**
 * Auxiliary type to unify events and templates
 */
type CalendarEntry<T> = {
	title: string
	description: string
	location: string
} & T

/**
 * Auxiliary type to unify events and templates (encrypted)
 */
type CalendarEntryEncrypted<T> = {
	title_encrypted: string
	description_encrypted: string
	location_encrypted: string
} & T

/**
 * Decrypts title, description and location of an entry.
 */
function decrypt_calender_entry<T>(entry: CalendarEntryEncrypted<T>): CalendarEntry<T> {
	const { title_encrypted, description_encrypted, location_encrypted, ...rest } = entry

	const title = decrypt(title_encrypted)
	const description = decrypt(description_encrypted)
	const location = decrypt(location_encrypted)

	return {
		title,
		description,
		location,
		...(rest as T)
	}
}

/**
 * Decrypts a calendar event.
 */
export function decrypt_calendar_event(event: CalendarEventEncrypted): CalendarEvent {
	return decrypt_calender_entry(event)
}

/**
 * Decrypts a calendar template.
 */
export function decrypt_event_template(
	template: CalendarTemplateEncrypted
): CalendarTemplate {
	return decrypt_calender_entry(template)
}

/**
 * Retrieves the role of a user in an event.
 */
export async function get_role(
	user_id: string,
	event_id: string
): Promise<EventParticipant['role'] | null> {
	const role_query = sql`
	SELECT role FROM event_participants
	WHERE event_id = ${event_id} AND user_id = ${user_id}`

	const { rows } = await query<{ role: EventParticipant['role'] }>(role_query)

	return rows?.length ? rows[0].role : null
}
