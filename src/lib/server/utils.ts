import type { ZodError } from 'zod'

export function get_error_messages(error: ZodError): string {
	return error.errors.map((err) => err.message).join(' ')
}
