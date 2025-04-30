export type UserLocals = {
	id: number
}

export type PermissionLevel = 'read' | 'write' | 'owner'

export type Calendar = {
	id: string
	name: string
	default_color: string
	permission_level: PermissionLevel
}

export type Share = {
	calendar_name: string
	calendar_id: string
	user_name: string
	user_id: number
	permission_level: PermissionLevel
	approved_at: string | null
}

export type CalendarEvent = {
	id: string
	calendar_id: string
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
	id: string
	calendar_id: string
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
