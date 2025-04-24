import { z } from 'zod';
import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { get_error_messages } from '$lib/server/utils';
import { db, query } from '$lib/server/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '$env/static/private';

export const actions: Actions = {
	default: async (event) => {
		const form_data = await event.request.formData();
		const name = form_data.get('name') as string | null;
		const password = form_data.get('password') as string | null;
		if (!name) {
			return fail(400, { error: 'Name is required.', name });
		}

		const { rows, err } = await query<{ password_hash: string }>(
			'SELECT password_hash FROM users WHERE name = ?',
			[name]
		);
		if (err) {
			return fail(500, { error: 'Database error.', name });
		}

		const is_valid = rows.length > 0 && (await bcrypt.compare(password!, rows[0].password_hash));
		if (!is_valid) {
			return fail(400, { error: 'Invalid name or password.', name });
		}

		const token = jwt.sign({ name }, JWT_SECRET);

		event.cookies.set('jwt', token, {
			httpOnly: true,
			maxAge: 60 * 60 * 24 * 7, // 1 week
			path: '/',
			secure: true
		});

		await query(`UPDATE users SET last_login = datetime('now') WHERE name = ?`, [name]);

		redirect(302, '/app');
	}
};
