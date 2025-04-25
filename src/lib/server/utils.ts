import type { ZodError } from 'zod';

export function get_error_messages(error: ZodError): string {
	return error.errors.map((err) => err.message).join(' ');
}

export function add_seconds(datestr: string): string {
	if (datestr.length === 19) return datestr;
	return `${datestr}:00`;
}
