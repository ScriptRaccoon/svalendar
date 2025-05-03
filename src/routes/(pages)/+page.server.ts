import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { query } from '$lib/server/db'
import sql from 'sql-template-tag'

export const load: PageServerLoad = async (event) => {
	const user = event.locals.user
	if (!user) return

	const default_calendar_query = sql`
	SELECT default_calendar_id FROM users WHERE id = ${user.id}
	`

	const { rows } = await query<{ default_calendar_id: string | null }>(
		default_calendar_query
	)

	if (!rows?.length) redirect(302, '/app/dashboard')

	const default_calendar_id = rows[0].default_calendar_id
	return default_calendar_id
		? redirect(302, `/app/calendar/${default_calendar_id}`)
		: redirect(302, '/app/dashboard')
}
