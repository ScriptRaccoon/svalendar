import { createClient, LibsqlError } from '@libsql/client';

export const db = createClient({
	url: 'file:database/main.db',
	authToken: ''
});

db.execute('PRAGMA foreign_keys = ON');

export async function query<T>(sql: string, args: any[]) {
	try {
		const { rows } = await db.execute(sql, args);
		return { rows: rows as T[], err: null };
	} catch (err) {
		console.error(err);
		return { rows: null, err: err as LibsqlError };
	}
}
