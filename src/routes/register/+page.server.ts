import { z } from 'zod';
import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { get_error_messages } from '$lib/server/utils';
import { db, query } from '$lib/server/db';
import bcrypt from 'bcryptjs';

const password_schema = z
	.string()
	.min(6, {
		message: 'Password must be at least 6 characters long.'
	})
	.max(50, {
		message: 'Password must be at most 50 characters long.'
	})
	.regex(/\d/, {
		message: 'Password must contain at least one number.'
	})
	.regex(/[a-zA-Z]/, {
		message: 'Password must contain at least one letter.'
	});

export const actions: Actions = {
	default: async (event) => {
		const form_data = await event.request.formData();
		const name = form_data.get('name') as string | null;
		const password = form_data.get('password') as string | null;
		const confirm_password = form_data.get('confirm_password') as string | null;

		const password_validation = password_schema.safeParse(password);

		if (password_validation.error) {
			return fail(400, { error: get_error_messages(password_validation.error), name });
		}

		if (password !== confirm_password) {
			return fail(400, { error: 'Passwords do not match.', name });
		}

		const password_hash = await bcrypt.hash(password!, 10);

		const { err } = await query('INSERT INTO users (name, password_hash) VALUES (?, ?)', [
			name!,
			password_hash
		]);

		if (err) {
			console.error(err);
			if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
				return fail(400, { error: 'User with that name already exists.', name });
			}

			return fail(500, { error: 'Database error.', name });
		}

		return { success: true, name };
	}
};
