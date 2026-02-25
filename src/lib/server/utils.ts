import type { ZodError } from 'zod'

export function format_error(error: ZodError): string {
	return error.issues.map((err) => err.message).join(' ')
}
