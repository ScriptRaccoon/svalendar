import { createClient, LibsqlError } from '@libsql/client';

export const db = createClient({
	url: 'file:database/main.db',
	authToken: ''
});

export async function query<T>(sql: string, args: any[]) {
	try {
		const { rows } = await db.execute(sql, args);
		return { rows: rows as T[], err: null };
	} catch (err) {
		return { rows: null, err: err as LibsqlError };
	}
}
