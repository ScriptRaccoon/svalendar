import { z, ZodError } from 'zod'

export const name_schema = z
	.string()
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
	.string()
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

// don't use Zod's .datetime() because that expects seconds
export const datetime_schema = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, {
	message: 'Invalid datetime format (expected YYYY-MM-DDTHH:MM)'
})

export function get_error_messages(error: ZodError): string {
	return error.errors.map((err) => err.message).join(' ')
}
