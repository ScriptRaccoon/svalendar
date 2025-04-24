import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { query } from '$lib/server/db';

export const load: PageServerLoad = async (event) => {
	const calendar_id = event.params.id;
	return { calendar_id };
};

export const actions: Actions = {
	default: async (event) => {
		const user = event.locals.user;
		if (!user) error(401, 'Unauthorized');

		const form_data = await event.request.formData();
		const title = form_data.get('title') as string;
		const description = form_data.get('description') as string;
		const start_time = form_data.get('start_time') as string;
		const end_time = form_data.get('end_time') as string;
		const location = form_data.get('location') as string;
		const color = form_data.get('color') as string;

		const fields = {
			title,
			description,
			start_time,
			end_time,
			location,
			color
		};

		if (!title || !start_time || !end_time || !color) {
			return fail(400, { error: 'Fill in the required fields.', ...fields });
		}

		const sql = `
        INSERT INTO
            events (title, description, start_time, end_time, location, color, calendar_id)
        VALUES
            (?, ?, ?, ?, ?, ?, ?)
        RETURNING id
        `;

		const calendar_id = event.params.id;
		const args = [title, description, start_time, end_time, location, color, calendar_id];

		const { err } = await query(sql, args);
		if (err) return fail(500, { error: 'Database error.', ...fields });

		redirect(302, `/app/calendar/${calendar_id}`);
	}
};
