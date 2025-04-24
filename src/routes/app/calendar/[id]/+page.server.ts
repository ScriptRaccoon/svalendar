import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { query } from '$lib/server/db';
import type { Calendar, CalendarEvent } from '$lib/server/types';

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

	const { rows: calendars, err: err_calendars } = await query<Calendar>(sql, args);

	if (err_calendars) error(500, 'Database error.');

	if (!calendars.length) error(404, 'Calendar not found.');

	const sql_events = `
    SELECT
        id, title, description, start_time, end_time, location, color
    FROM
        events
    WHERE
        calendar_id = ?
    `;

	const { rows: events, err: err_events } = await query<CalendarEvent>(sql_events, [calendar_id]);

	if (err_events) error(500, 'Database error.');

	return { calendar: calendars[0], events };
};
