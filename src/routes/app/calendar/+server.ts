import { error, redirect } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { query } from '$lib/server/db'
import sql from 'sql-template-tag'

export const GET: RequestHandler = async (event) => {
	const user = event.locals.user
	if (!user) error(401, 'Unauthorized')

	const calendar_query = sql`
    SELECT default_calendar_id as default_id
    FROM users
    WHERE id = ${user.id}`

	const { rows } = await query<{ default_id: number }>(calendar_query)
	if (!rows?.length) redirect(302, '/app/dashboard')

	const { default_id } = rows[0]
	redirect(302, `/app/calendar/${default_id}`)
}
