import { z, ZodError } from 'zod'

export const name_schema = z
	.string({
		required_error: 'Name is required.',
		invalid_type_error: 'Name must be a string.'
	})
	.min(1, {
		message: 'Name cannot be empty.'
	})
	.max(50, {
		message: 'Name must be at most 50 characters long.'
	})
	.regex(/^[a-zA-Z0-9_-]+$/, {
		message: 'Name can only contain letters, numbers, underscores, and dashes.'
	})

export const password_schema = z
	.string({
		required_error: 'Password is required.',
		invalid_type_error: 'Password must be a string.'
	})
	.min(6, {
		message: 'Password must be at least 6 characters long.'
	})
	.max(50, {
		message: 'Password must be at most 50 characters long.'
	})
	.regex(/\d/, {
		message: 'Password must contain at least one number.'
	})
	.regex(/[a-zA-Z]/, {
		message: 'Password must contain at least one letter.'
	})

export const date_schema = z
	.string({
		required_error: 'Date is required.',
		invalid_type_error: 'Date must be a string.'
	})
	.date('Invalid date format. Expected YYYY-MM-DD.')

export const time_schema = z
	.string({
		required_error: 'Time is required.',
		invalid_type_error: 'Time must be a string.'
	})
	.regex(/^\d{2}:\d{2}$/, {
		message: 'Invalid time format. Expected HH:MM.'
	})

export const url_schema = z
	.string({
		required_error: 'URL is required.',
		invalid_type_error: 'URL must be a string.'
	})
	.url('Invalid URL format.')

export const hour_schema = z.number().int().min(0).max(23)

export function get_error_messages(error: ZodError): string {
	return error.errors.map((err) => err.message).join(' ')
}
