import { error, fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { db, query } from '$lib/server/db'
import type { Calendar } from '$lib/server/types'
import { DEFAULT_COLOR } from '$lib/config'
import sql from 'sql-template-tag'

export const load: PageServerLoad = async (event) => {
	const user = event.locals.user
	if (!user) error(401, 'Unauthorized')

	const users_query = sql`
	SELECT name, default_calendar_id FROM users WHERE id = ${user.id}
	`

	const { rows: users } = await query<{
		name: string
		default_calendar_id: number | null
	}>(users_query)

	if (!users?.length) {
		error(404, 'User not found.')
	}

	const { default_calendar_id, name } = users[0]

	const calendars_query = sql`
	SELECT
		c.id,
		c.name,
		cp.permission_level,
		cp.approved_at,
		cp.revokable
	FROM
		calendar_permissions AS cp
	INNER JOIN
		calendars c ON c.id = cp.calendar_id
	WHERE
		cp.user_id = ${user.id}
	ORDER BY
		name ASC
	`

	const { rows, err } = await query<
		Calendar & { approved_at: string | null; revokable: number }
	>(calendars_query)

	if (err) error(500, 'Database error.')

	const calendars = rows.filter((calendar) => calendar.approved_at)
	const pending_shares = rows.filter((calendar) => !calendar.approved_at)

	return { calendars, pending_shares, name, default_calendar_id }
}

export const actions: Actions = {
	create_calendar: async (event) => {
		const user = event.locals.user
		if (!user) error(401, 'Unauthorized')

		const form_data = await event.request.formData()
		const name = form_data.get('name') as string | null

		if (!name) return fail(400, { error: 'Name is required.', name })

		const tx = await db.transaction('write')
		let calendar_id: number

		try {
			const insert_query = sql`
			INSERT INTO calendars (name, default_color)
			VALUES (${name}, ${DEFAULT_COLOR})
			RETURNING id`

			const { rows } = await tx.execute({
				sql: insert_query.sql,
				args: insert_query.values as any[]
			})

			if (!rows.length) throw new Error('Calendar not created.')

			calendar_id = rows[0].id as number

			const owner_query = sql`
			INSERT INTO calendar_permissions
			(calendar_id, user_id, permission_level, approved_at, revokable)
			VALUES (${calendar_id}, ${user.id}, 'owner', CURRENT_TIMESTAMP, FALSE)`

			await tx.execute({
				sql: owner_query.sql,
				args: owner_query.values as any[]
			})

			await tx.commit()
			tx.close()
		} catch (err) {
			console.error('transaction failed', err)
			tx.close()
			error(500, 'Database error.')
		}

		if (calendar_id) redirect(302, `/app/calendar/${calendar_id}`)
	},

	accept_share: async (event) => {
		const user = event.locals.user
		if (!user) error(401, 'Unauthorized')

		const form_data = await event.request.formData()
		const calendar_id = Number(form_data.get('calendar_id'))

		if (!calendar_id) return fail(400, { error: 'Calendar ID is required.' })

		const accept_query = sql`
		UPDATE calendar_permissions
		SET approved_at = CURRENT_TIMESTAMP
		WHERE calendar_id = ${calendar_id}
		AND user_id = ${user.id}
		AND approved_at IS NULL`

		const { err } = await query(accept_query)
		if (err) return fail(500, { error: 'Database error.' })

		return { success: true }
	},

	reject_share: async (event) => {
		const user = event.locals.user
		if (!user) error(401, 'Unauthorized')

		const form_data = await event.request.formData()
		const calendar_id = Number(form_data.get('calendar_id'))

		if (!calendar_id) return fail(400, { error: 'Calendar ID is required.' })

		const reject_query = sql`
		DELETE FROM calendar_permissions
		WHERE calendar_id = ${calendar_id}
		AND user_id = ${user.id}
		AND approved_at IS NULL`

		const { err } = await query(reject_query)
		if (err) return fail(500, { error: 'Database error.' })

		return { success: true }
	},

	revoke_access: async (event) => {
		const user = event.locals.user
		if (!user) error(401, 'Unauthorized')

		const form_data = await event.request.formData()
		const calendar_id = Number(form_data.get('calendar_id'))

		if (!calendar_id) return fail(400, { error: 'Calendar ID is required.' })

		const revoke_query = sql`
		DELETE FROM calendar_permissions
		WHERE calendar_id = ${calendar_id}
		AND user_id = ${user.id}
		AND approved_at IS NOT NULL
		AND revokable = TRUE`

		const { err } = await query(revoke_query)
		if (err) return fail(500, { error: 'Database error.' })

		return { success: true }
	}
}
