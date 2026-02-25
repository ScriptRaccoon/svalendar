import sql from 'sql-template-tag'
import type { ZodError } from 'zod'
import { query } from './db'

export function format_error(error: ZodError): string {
	return error.issues.map((err) => err.message).join(' ')
}

export async function get_number_unread_notifications(
	recipient_id: string
): Promise<number | null> {
	const unread_query = sql`
	SELECT COUNT(*) as counter FROM notifications
	WHERE recipient_id = ${recipient_id} AND status = 'unread'`

	const { rows } = await query<{ counter: number }>(unread_query)

	if (!rows?.length) return null

	return rows[0].counter
}
