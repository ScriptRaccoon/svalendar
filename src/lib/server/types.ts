export type UserLocals = {
	id: string
}

export type Calendar = {
	id: string
	name: string
	default_color: string
	default_start_hour: number
	is_default_calendar: number // 0 or 1
}

export type CalendarEvent = {
	id: string
	title: string
	description: string
	location: string
	start_time: string
	end_time: string
	event_date: string
	color: string
}

export type CalendarEventEncrypted = {
	id: string
	title_encrypted: string
	title_iv: string
	title_tag: string
	description_encrypted: string
	description_iv: string
	description_tag: string
	location_encrypted: string
	location_iv: string
	location_tag: string
	start_time: string
	end_time: string
	event_date: string
	color: string
}

export type EventTitleEncrypted = Pick<
	CalendarEventEncrypted,
	'title_encrypted' | 'title_iv' | 'title_tag'
>
