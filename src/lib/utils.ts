import type { ZodError } from 'zod'

export function add_days(date: string | Date, days: number): string {
	const date_obj = new Date(date)
	date_obj.setDate(date_obj.getDate() + days)
	return date_obj.toLocaleDateString('en-CA')
}

export function get_hours(time: string) {
	const [hour, minute] = time.split(':').map(Number)
	return hour + minute / 60
}

export function get_hours_diff(start_time: string, end_time: string) {
	return get_hours(end_time) - get_hours(start_time)
}

export function format_error(error: ZodError): string {
	return error.errors.map((err) => err.message).join(' ')
}
