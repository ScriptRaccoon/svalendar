import sql from 'sql-template-tag'
import { query } from './db'
import type { Calendar } from './types'

export async function get_permission(calendar_id: number, user_id: number) {
	const permission_query = sql`
    SELECT
        permission_level
    FROM
        calendar_permissions cp
    WHERE
        cp.user_id = ${user_id}
        AND cp.calendar_id = ${calendar_id}`

	const { rows } = await query<{
		permission_level: Calendar['permission_level']
	}>(permission_query)

	if (!rows?.length) return null

	return rows[0].permission_level
}
