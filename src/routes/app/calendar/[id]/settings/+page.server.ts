import { error, fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { query } from '$lib/server/db'
import type { Calendar } from '$lib/server/types'
import { COLOR_IDS } from '$lib/config'

export const load: PageServerLoad = async (event) => {
	const user = event.locals.user
	if (!user) error(401, 'Unauthorized')

	const calendar_id = event.params.id

	const sql = `
    SELECT
        calendars.id,
		calendars.name,
		calendars.default_color,
		users.default_calendar_id = calendars.id AS is_default
    FROM
        calendars
	INNER JOIN
		users ON calendars.user_id = users.id
    WHERE
        calendars.id = ? AND user_id = ?
    `

	const args = [calendar_id, user.id]
	const { rows, err } = await query<Calendar>(sql, args)

	if (err) error(500, 'Database error.')
	if (!rows.length) error(404, 'Calendar not found.')

	return { calendar: rows[0] }
}

export const actions: Actions = {
	edit: async (event) => {
		const user = event.locals.user
		if (!user) error(401, 'Unauthorized')

		const form_data = await event.request.formData()
		const calendar_id = event.params.id
		const name = form_data.get('name') as string | null
		const color = form_data.get('color') as string | null

		if (!name) return fail(400, { error: 'Name is required.', name })
		if (!color) return fail(400, { error: 'Color is required.', name })

		if (!COLOR_IDS.includes(color)) {
			return fail(400, { error: 'Invalid color.', name })
		}

		const sql = `
        UPDATE
            calendars
        SET
            name = ?, default_color = ?
        WHERE
            id = ? AND user_id = ?
        `

		const args = [name, color, calendar_id, user.id]

		const { err } = await query(sql, args)
		if (err) return fail(500, { error: 'Database error.', name })

		redirect(302, `/app/calendar/${calendar_id}`)
	},
	delete: async (event) => {
		const user = event.locals.user
		if (!user) error(401, 'Unauthorized')

		const calendar_id = event.params.id

		const sql = `
        DELETE FROM
            calendars
        WHERE
            id = ? AND user_id = ?
        `

		const args = [calendar_id, user.id]

		const { err } = await query(sql, args)
		if (err) return fail(500, { error: 'Database error.' })

		redirect(302, '/app/dashboard')
	},

	setdefault: async (event) => {
		const user = event.locals.user
		if (!user) error(401, 'Unauthorized')

		const calendar_id = event.params.id

		const sql = `
		UPDATE
			users
		SET
			default_calendar_id = ?
		WHERE
			id = ?
		`

		const args = [calendar_id, user.id]

		const { err } = await query(sql, args)
		if (err) return fail(500, { error: 'Database error.' })

		redirect(302, `/app/calendar/${calendar_id}`)
	}
}
