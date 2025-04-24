import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { password_schema } from '$lib/server/schemas';
import { get_error_messages } from '$lib/server/utils';
import { query } from '$lib/server/db';
import bcrypt from 'bcryptjs';

export const actions: Actions = {
	name: async (event) => {
		const user = event.locals.user;
		if (!user) error(401, 'Unauthorized');

		const form_data = await event.request.formData();

		const name = form_data.get('name') as string | null;

		if (!name) return fail(400, { name: 'Name is required.' });

		const sql = `UPDATE users SET name = ? WHERE id = ?`;
		const args = [name, user.id];

		const { err } = await query(sql, args);

		if (err) {
			if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
				return fail(400, { error: 'User with that name already exists.', name });
			}

			return fail(500, { error: 'Database error.', name });
		}

		if (event.locals.user) {
			event.locals.user.name = name;
		}

		return { name, message: 'Name updated successfully.' };
	},
	password: async (event) => {
		const user = event.locals.user;
		if (!user) error(401, 'Unauthorized');

		const form_data = await event.request.formData();

		const password = form_data.get('password') as string | null;
		const confirm_password = form_data.get('confirm_password') as string | null;

		const password_validation = password_schema.safeParse(password);
		if (password_validation.error) {
			return fail(400, { error: get_error_messages(password_validation.error) });
		}
		if (password !== confirm_password) {
			return fail(400, { error: 'Passwords do not match' });
		}

		const password_hash = await bcrypt.hash(password!, 10);

		const sql = `UPDATE users SET password_hash = ? WHERE id = ?`;
		const args = [password_hash, user.id];

		const { err } = await query(sql, args);

		if (err) return fail(500, { error: 'Database error.' });

		return { message: 'Password updated successfully.' };
	},

	delete: async (event) => {
		const user = event.locals.user;
		if (!user) error(401, 'Unauthorized');

		event.cookies.delete('jwt', { path: '/' });
		delete event.locals.user;

		const sql = `DELETE FROM users WHERE id = ?`;
		const args = [user.id];

		const { err } = await query(sql, args);
		if (err) return fail(500, { error: 'Database error.' });

		redirect(302, '/');
	}
};
