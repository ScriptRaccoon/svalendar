import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { query } from '$lib/server/db';

export const actions: Actions = {
	createcalendar: async (event) => {
		const user = event.locals.user;
		if (!user) error(401, 'Unauthorized');

		const form_data = await event.request.formData();
		const name = form_data.get('name') as string | null;
		const color = form_data.get('color') as string | null;

		if (!name) return fail(400, { error: 'Name is required.', name, color });
		if (!color) return fail(400, { error: 'Color is required.', name, color });

		const sql = `
        INSERT INTO
            calendars (name, color, user_id)
        VALUES
            (?, ?, ?)
        RETURNING id as calendar_id
        `;

		const args = [name!, color!, user.id];

		const { rows, err } = await query<{ calendar_id: number }>(sql, args);

		if (err) return fail(500, { error: 'Database error.', name, color });

		if (!rows.length) return fail(500, { error: 'Database error.', name, color });

		const { calendar_id } = rows[0];

		redirect(302, `/app/calendar/${calendar_id}`);
	}
};
