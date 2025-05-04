import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { query } from '$lib/server/db'
import sql from 'sql-template-tag'

export const load: PageServerLoad = async (event) => {
	const user = event.locals.user
	if (!user) return

	const default_calendar_query = sql`
	SELECT id AS default_calendar_id
	FROM calendars
	WHERE user_id = ${user.id} AND is_default_calendar = TRUE
	LIMIT 1`

	const { rows } = await query<{ default_calendar_id: string }>(default_calendar_query)

	if (!rows?.length) {
		return redirect(302, '/app/dashboard')
	}

	const default_calendar_id = rows[0].default_calendar_id

	redirect(302, `/app/calendar/${default_calendar_id}`)
}
