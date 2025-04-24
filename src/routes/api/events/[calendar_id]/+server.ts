import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './[date]/$types';
import { query } from '$lib/server/db';
import type { CalendarEvent } from '$lib/server/types';
import { z } from 'zod';

export const GET: RequestHandler = async (event) => {
	const user = event.locals.user;
	if (!user) error(401, 'Unauthorized');

	const calendar_id = event.params.calendar_id;

	const start_date = event.url.searchParams.get('start_date');
	const end_date = event.url.searchParams.get('end_date');

	if (!start_date || !end_date) {
		error(400, 'Missing start_date or end_date query parameter');
	}

	if (z.string().date().safeParse(start_date).error) {
		error(400, 'Invalid start_date format');
	}

	if (z.string().date().safeParse(end_date).error) {
		error(400, 'Invalid end_date format');
	}

	const sql = `
    SELECT
        id, title, description, start_time, end_time, location, color
    FROM
        events
    WHERE
        calendar_id = ?
        AND start_time <= ?
        AND end_time >= ?
    ORDER BY
        start_time ASC
    `;

	const args = [calendar_id, end_date, start_date];

	const { rows: events, err } = await query<CalendarEvent>(sql, args);
	if (err) error(500, 'Database error.');

	return json(events);
};
