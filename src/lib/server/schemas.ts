import { z } from 'zod';

export const password_schema = z
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

export const date_schema = z.string().datetime({ local: true });
