import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { query } from '$lib/server/db'
import sql from 'sql-template-tag'

export const load: PageServerLoad = async (event) => {
	const user = event.locals.user
	if (!user) return

	const default_calendar_query = sql`
	SELECT id
	FROM calendars
	WHERE user_id = ${user.id} AND is_default_calendar = TRUE
	LIMIT 1`

	const { rows } = await query<{ id: string }>(default_calendar_query)

	if (!rows?.length) redirect(302, '/dashboard')

	const { id } = rows[0]
	redirect(302, `/calendar/${id}`)
}
