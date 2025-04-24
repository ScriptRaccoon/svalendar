import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { query } from '$lib/server/db';
import type { CalendarBasic } from '$lib/server/types';

export const load: PageServerLoad = async (event) => {
	const user = event.locals.user;
	if (!user) error(401, 'Unauthorized');

	const calendar_id = event.params.id;

	const sql = `
    SELECT
        id, name
    FROM
        calendars
    WHERE
        id = ? AND user_id = ?
    `;

	const args = [calendar_id, user.id];

	const { rows, err } = await query<CalendarBasic>(sql, args);

	if (err) {
		error(500, 'Database error.');
	}

	if (!rows.length) {
		error(404, 'Calendar not found.');
	}

	return {
		calendar: rows[0]
	};
};
