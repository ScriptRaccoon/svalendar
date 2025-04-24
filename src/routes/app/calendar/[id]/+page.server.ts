import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { query } from '$lib/server/db';

export const load: PageServerLoad = async (event) => {
	const user = event.locals.user;
	if (!user) error(401, 'Unauthorized');

	const calendar_id = event.params.id;

	const sql = `
    SELECT
        name, color
    FROM
        calendars
    WHERE
        id = ? AND user_id = ?
    `;

	const args = [calendar_id, user.id];

	const { rows, err } = await query<{ name: string; color: string }>(sql, args);

	if (err) {
		error(500, 'Database error.');
	}

	if (!rows.length) {
		error(404, 'Calendar not found.');
	}

	const { name, color } = rows[0];
	return {
		calendar: {
			id: calendar_id,
			name,
			color
		}
	};
};
