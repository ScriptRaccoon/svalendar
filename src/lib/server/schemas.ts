import { z } from 'zod'

export const username_schema = z
	.string('Username must be a string.')
	.min(1, 'Username cannot be empty.')
	.max(50, 'Username must be at most 50 characters long.')
	.regex(
		/^[a-zA-Z0-9_ -]*$/,
		'Username can only contain letters, numbers, underscores, spaces, and dashes.'
	)
	.refine((name) => !name.startsWith(' '), 'Username cannot start with a space.')
	.refine((name) => !name.endsWith(' '), 'Username cannot end with a space.')
	.refine((name) => !name.includes('  '), 'Username cannot contain consecutive spaces.')

export const password_schema = z
	.string('Password must be a string.')
	.min(6, 'Password must be at least 6 characters long.')
	.max(50, 'Password must be at most 50 characters long.')
	.regex(/\d/, 'Password must contain at least one number.')
	.regex(/[a-zA-Z]/, 'Password must contain at least one letter.')

export const calendar_name_schema = z
	.string('Calendar name must be a string.')
	.min(1, 'Calendar name cannot be empty.')
	.max(50, 'Calendar name must be at most 50 characters long.')

export const date_schema = z
	.string('Date must be a string.')
	.date('Invalid date format. Expected YYYY-MM-DD.')

export const time_schema = z
	.string('Time must be a string.')
	.regex(/^\d{2}:\d{2}$/, 'Invalid time format. Expected HH:MM.')

export const url_schema = z.url('Invalid URL format.')

export const hour_schema = z.number().int().min(0).max(23)

export const event_title_schema = z
	.string('Event title must be a string.')
	.min(1, 'Event title cannot be empty.')
	.max(100, 'Event title must be at most 100 characters long.')

export const event_description_schema = z
	.string('Event description must be a string.')
	.max(1000, 'Event description must be at most 1000 characters long.')

export const event_location_schema = z
	.string('Event location must be a string.')
	.max(100, 'Event location must be at most 100 characters long.')
