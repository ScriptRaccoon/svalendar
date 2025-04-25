import { error, redirect } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { query } from '$lib/server/db'

export const GET: RequestHandler = async (event) => {
	const user = event.locals.user
	if (!user) error(401, 'Unauthorized')
	const sql = `
    SELECT
        default_calendar_id as default_id
    FROM
        users
    WHERE
        id = ?
    `
	const { rows } = await query<{ default_id: number }>(sql, [user.id])
	if (!rows?.length) redirect(302, '/app/dashboard')
	const { default_id } = rows[0]
	redirect(302, `/app/calendar/${default_id}`)
}
