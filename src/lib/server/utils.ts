import type { ZodError } from 'zod'
import type { CalendarEvent, CalendarEventEncrypted } from './types'
import { decrypt } from './encryption'

export function get_error_messages(error: ZodError): string {
	return error.errors.map((err) => err.message).join(' ')
}

export function decrypt_calendar_event(event: CalendarEventEncrypted): CalendarEvent {
	return {
		id: event.id,
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
