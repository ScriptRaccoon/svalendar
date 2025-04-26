export type UserLocals = {
	id: number
	name: string
}

export type CalendarBasic = { id: number; name: string; default_color: string }

export type Calendar = CalendarBasic & { is_default: number }

export type CalendarEvent = {
	id: number
	title: string
	description: string
	start_time: string
	end_time: string
	location: string
	color: string
}

export type CalendarEventEncrypted = {
	id: number
	title_encrypted: string
	title_iv: string
	title_tag: string
	description_encrypted: string
	description_iv: string
	description_tag: string
	start_time: string
	end_time: string
	location_encrypted: string
	location_iv: string
	location_tag: string
	color: string
}

export type EventTitleEncrypted = Pick<
	CalendarEventEncrypted,
	'title_encrypted' | 'title_iv' | 'title_tag'
>
