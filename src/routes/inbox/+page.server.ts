import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import sql from 'sql-template-tag'
import { query } from '$lib/server/db'
import type { Notification } from '$lib/server/types'

export const load: PageServerLoad = async (event) => {
	const user = event.locals.user
	if (!user) error(401, 'Unauthorized')

	const notifications_query = sql`
    SELECT id, sender_id, type, status, message, created_at, event_id
    FROM notifications
    WHERE recipient_id = ${user.id}
	ORDER BY created_at DESC
    `

	const { err, rows: notifications } = await query<Notification>(notifications_query)
	if (err) error(500, 'Database error')

	return { notifications }
}
