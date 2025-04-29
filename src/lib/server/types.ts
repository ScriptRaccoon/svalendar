export type UserLocals = {
	id: number
	name: string
}

type PermissionLevel = 'read' | 'write' | 'owner'

export type Calendar = {
	id: number
	name: string
	default_color: string
	permission_level: PermissionLevel
}

export type Share = {
	calendar_name: string
	calendar_id: number
	user_name: string
	user_id: number
	permission_level: PermissionLevel
}

export type CalendarEvent = {
	id: number
	calendar_id: number
	title: string
	description: string
	location: string
	start_time: string
	end_time: string
	start_date: string
	end_date: string
	color: string
}

export type CalendarEventEncrypted = {
	id: number
	calendar_id: number
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
	start_date: string
	end_date: string
	color: string
}

export type EventTitleEncrypted = Pick<
	CalendarEventEncrypted,
	'title_encrypted' | 'title_iv' | 'title_tag'
>
