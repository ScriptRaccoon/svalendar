import type { ZodError } from 'zod'

export function format_error(error: ZodError): string {
	return error.errors.map((err) => err.message).join(' ')
}
