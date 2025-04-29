import { error, fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { query } from '$lib/server/db'
import type { Share, Calendar } from '$lib/server/types'
import { COLOR_IDS } from '$lib/config'
import sql from 'sql-template-tag'

export const load: PageServerLoad = async (event) => {
	const user = event.locals.user
	if (!user) error(401, 'Unauthorized')

	const calendar_id = Number(event.params.id)

	const calendars_query = sql`
    SELECT
        c.id,
		c.name,
		c.default_color,
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
		cp.permission_level AS permission_level
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
		const calendar_id = Number(event.params.id)
		const name = form_data.get('name') as string | null
		const color = form_data.get('color') as string | null

		if (!name) return fail(400, { error: 'Name is required.', name })
		if (!color) return fail(400, { error: 'Color is required.', name })

		if (!COLOR_IDS.includes(color)) {
			return fail(400, { error: 'Invalid color.', name })
		}

		const update_query = sql`
        UPDATE calendars
        SET name = ${name}, default_color = ${color}
        WHERE id = ${calendar_id}`

		const { err } = await query(update_query)
		if (err) return fail(500, { error: 'Database error.', name })

		redirect(302, `/app/calendar/${calendar_id}`)
	},
	delete: async (event) => {
		// TODO: check permissions here as well ...
		const user = event.locals.user
		if (!user) error(401, 'Unauthorized')

		const calendar_id = Number(event.params.id)

		const delete_query = sql`
        DELETE FROM calendars
        WHERE id = ${calendar_id}`

		const { err } = await query(delete_query)
		if (err) return fail(500, { error: 'Database error.' })

		redirect(302, '/app/dashboard')
	},

	create_share: async (event) => {
		// TODO: check permissions here as well ...
		const user = event.locals.user
		if (!user) error(401, 'Unauthorized')

		const calendar_id = Number(event.params.id)

		const form_data = await event.request.formData()
		const username = form_data.get('username') as string | null
		if (!username) return fail(400, { error: 'User name is required.' })

		if (user.name === username) {
			return fail(400, { error: 'You cannot share a calendar with yourself.' })
		}

		const permission_level = form_data.get('permission_level') as string | null
		if (!permission_level)
			return fail(400, { error: 'Permission level is required.' })

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
			return fail(500, { error: 'Database error.' })
		}

		if (!rows.length) {
			return fail(400, { error: 'User not found.' })
		}

		return { success: true }
	},

	remove_share: async (event) => {
		// TODO: check permissions here as well ...
		const user = event.locals.user
		if (!user) error(401, 'Unauthorized')

		const calendar_id = Number(event.params.id)
		const form_data = await event.request.formData()

		const invited_user_id = form_data.get('user_id') as string | null
		if (!invited_user_id) {
			return fail(400, { error: 'User ID is required.' })
		}

		const delete_query = sql`
		DELETE FROM calendar_permissions
		WHERE calendar_id = ${calendar_id} AND user_id = ${invited_user_id}
		`

		const { err } = await query(delete_query)
		if (err) {
			return fail(500, { error: 'Database error.' })
		}

		return { success: true }
	}
}
