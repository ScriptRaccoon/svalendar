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

export type EventParticipant = {
	id: string
	name: string
	role: 'attendee' | 'organizer'
	status: 'pending' | 'accepted' | 'declined'
}

export type CalendarEvent = {
	id: string
	status: EventParticipant['status']
	title: string
	description: string
	location: string
	start_time: string
	end_time: string
	event_date: string
	color: string
	link: string
}

export type CalendarEventEncrypted = {
	id: string
	status: EventParticipant['status']
	title_encrypted: string
	description_encrypted: string
	location_encrypted: string
	start_time: string
	end_time: string
	event_date: string
	color: string
	link_encrypted: string
}

export type CalendarTemplate = Omit<CalendarEvent, 'status' | 'event_date'>

export type CalendarTemplateEncrypted = Omit<
	CalendarEventEncrypted,
	'status' | 'event_date'
>

export type Color = {
	readonly id: string
	readonly value: string
}

export type Arrayed<T extends readonly unknown[]> = {
	[K in keyof T]: T[K][]
}
