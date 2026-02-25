import { error, fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import sql from 'sql-template-tag'
import { batch, query } from '$lib/server/db'
import type { Notification } from '$lib/server/types'

export const load: PageServerLoad = async (event) => {
	const user = event.locals.user
	if (!user) error(401, 'Unauthorized')

	const show_archived = event.url.searchParams.get('filter') === 'archived'

	const notifications_query_archived = sql`
    SELECT id, sender_id, type, status, message, created_at, event_id
    FROM notifications
    WHERE recipient_id = ${user.id} AND status = 'archived'
	ORDER BY created_at DESC`

	const notification_query_unarchived = sql`
    SELECT id, sender_id, type, status, message, created_at, event_id
    FROM notifications
    WHERE recipient_id = ${user.id} AND status != 'archived'
	ORDER BY created_at DESC`

	const notifications_query = show_archived
		? notifications_query_archived
		: notification_query_unarchived

	const mark_read_query = sql`
	UPDATE notifications SET status = 'read'
	WHERE status = 'unread' AND recipient_id = ${user.id}`

	const { err, results } = await batch<[Notification, never]>([
		notifications_query,
		mark_read_query
	])
	if (err) error(500, 'Database error')

	const [notifications] = results

	return { show_archived, notifications, number_unread_notifications: 0 }
}

export const actions: Actions = {
	archive: async (event) => {
		const user = event.locals.user
		if (!user) error(401, 'Unauthorized')

		const form = await event.request.formData()
		const id = form.get('id') as string

		const archive_sql = sql`
		UPDATE notifications
		SET status = 'archived'
		WHERE id = ${id} AND recipient_id = ${user.id}`

		const { err } = await query(archive_sql)
		if (err) return fail(500, { error: 'Database error' })
	},

	unarchive: async (event) => {
		const user = event.locals.user
		if (!user) error(401, 'Unauthorized')

		const form = await event.request.formData()
		const id = form.get('id') as string

		const unarchive_sql = sql`
		UPDATE notifications
		SET status = 'read'
		WHERE id = ${id} AND recipient_id = ${user.id}`

		const { err } = await query(unarchive_sql)
		if (err) return fail(500, { error: 'Database error' })
	}
}
