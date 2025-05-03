import { error, fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { query } from '$lib/server/db'
import type { Share, Calendar } from '$lib/server/types'
import { COLOR_IDS } from '$lib/config'
import sql from 'sql-template-tag'
import { hour_schema } from '$lib/server/schemas'

export const load: PageServerLoad = async (event) => {
	const user = event.locals.user
	if (!user) error(401, 'Unauthorized')

	const calendar_id = event.params.id

	const calendars_query = sql`
    SELECT
        c.id,
		c.name,
		c.default_color,
		c.default_start_hour,
		cp.permission_level
    FROM
		calendar_permissions cp
	INNER JOIN
		calendars c ON c.id = cp.calendar_id
    WHERE
        c.id = ${calendar_id} AND cp.user_id = ${user.id}
    `

	const { rows, err } = await query<Calendar>(calendars_query)

	if (err) error(500, 'Database error.')
	if (!rows.length) error(404, 'Calendar not found.')

	const calendar = rows[0]

	if (calendar.permission_level !== 'owner') {
		error(403, 'Permission denied.')
	}

	const shares_query = sql`
	SELECT
		c.name AS calendar_name,
		c.id AS calendar_id,
		u.name AS user_name,
		u.id AS user_id,
		cp.permission_level,
		cp.approved_at
	FROM
		calendar_permissions cp
	INNER JOIN
		calendars c ON c.id = cp.calendar_id
	INNER JOIN
		users u ON u.id = cp.user_id
	WHERE
		c.id = ${calendar_id}
		AND cp.user_id != ${user.id}
	`

	const { rows: shares, err: shares_err } = await query<Share>(shares_query)
	if (shares_err) error(500, 'Database error.')

	return { calendar, shares }
}

export const actions: Actions = {
	edit: async (event) => {
		// TODO: check permissions here as well ...
		const user = event.locals.user
		if (!user) error(401, 'Unauthorized')

		const form_data = await event.request.formData()
		const calendar_id = event.params.id
		const name = form_data.get('name') as string | null
		const default_color = form_data.get('color') as string | null
		const default_start_hour = Number(form_data.get('default_start_hour'))

		if (!name) return fail(400, { action: 'edit', error: 'Name is required.' })

		if (!hour_schema.safeParse(default_start_hour).success) {
			return fail(400, {
				action: 'edit',
				error: 'Invalid Start Hour'
			})
		}

		if (!default_color)
			return fail(400, { action: 'edit', error: 'Default Color is required.' })

		if (!COLOR_IDS.includes(default_color)) {
			return fail(400, { action: 'edit', error: 'Invalid color.' })
		}

		const update_query = sql`
        UPDATE
			calendars
        SET
			name = ${name},
			default_color = ${default_color},
			default_start_hour = ${default_start_hour}
        WHERE 
			id = ${calendar_id}`

		const { err } = await query(update_query)
		if (err) return fail(500, { action: 'edit', error: 'Database error.' })

		return { action: 'edit', success: true }
	},

	delete: async (event) => {
		// TODO: check permissions here as well ...
		const user = event.locals.user
		if (!user) error(401, 'Unauthorized')

		const calendar_id = event.params.id

		const delete_query = sql`
        DELETE FROM calendars
        WHERE id = ${calendar_id}`

		const { err } = await query(delete_query)
		if (err) return fail(500, { action: 'delete', error: 'Database error.' })

		redirect(302, '/app/dashboard')
	},

	share: async (event) => {
		// TODO: check permissions here as well ...
		const user = event.locals.user
		if (!user) error(401, 'Unauthorized')

		const username_query = sql`SELECT name FROM users WHERE id = ${user.id}`
		const { rows: user_rows } = await query<{ name: string }>(username_query)
		if (!user_rows?.length) error(404, 'User not found.')
		const my_username = user_rows[0].name

		const calendar_id = event.params.id

		const form_data = await event.request.formData()
		const username = form_data.get('username') as string | null
		if (!username)
			return fail(400, { action: 'share', error: 'User name is required.' })

		if (username === my_username) {
			return fail(400, {
				action: 'share',
				error: 'You cannot share a calendar with yourself.'
			})
		}

		const permission_level = form_data.get('permission_level') as string | null
		if (!permission_level)
			return fail(400, {
				action: 'share',
				error: 'Permission level is required.'
			})

		const share_query = sql`
		INSERT INTO
			calendar_permissions (calendar_id, user_id, permission_level)
		SELECT
			${calendar_id}, u.id, ${permission_level}
		FROM
			users u
		WHERE
			u.name = ${username} AND u.id != ${user.id}
		ON CONFLICT(calendar_id, user_id) DO UPDATE
		SET permission_level = ${permission_level}
		RETURNING calendar_permissions.id
		`

		const { err, rows } = await query<{ id: number }>(share_query)
		if (err) {
			return fail(500, { action: 'share', error: 'Database error.' })
		}

		if (!rows.length) {
			return fail(400, { action: 'share', error: 'User not found.' })
		}

		return { action: 'share', success: true }
	},

	unshare: async (event) => {
		// TODO: check permissions here as well ...
		const user = event.locals.user
		if (!user) error(401, 'Unauthorized')

		const calendar_id = event.params.id
		const form_data = await event.request.formData()

		const invited_user_id = form_data.get('user_id') as string | null
		if (!invited_user_id) {
			return fail(400, { action: 'unshare', error: 'User ID is required.' })
		}

		const delete_query = sql`
		DELETE FROM calendar_permissions
		WHERE calendar_id = ${calendar_id} AND user_id = ${invited_user_id}
		`

		const { err } = await query(delete_query)
		if (err) {
			return fail(500, { action: 'unshare', error: 'Database error.' })
		}

		return { action: 'unshare', success: true }
	},

	set_default: async (event) => {
		// TODO: check permissions here as well ...
		const user = event.locals.user
		if (!user) error(401, 'Unauthorized')

		const calendar_id = event.params.id

		const default_query = sql`
		UPDATE users
		SET default_calendar_id = ${calendar_id}
		WHERE id = ${user.id}`

		const { err } = await query(default_query)
		if (err) {
			return fail(500, { action: 'set_default', error: 'Database error.' })
		}

		return { action: 'set_default', success: true }
	}
}
