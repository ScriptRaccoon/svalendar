import { createClient, LibsqlError } from '@libsql/client'
import type { Sql } from 'sql-template-tag'

export const db = createClient({
	url: 'file:database/main.db',
	authToken: ''
})

db.execute('PRAGMA foreign_keys = ON')

export async function query<T>(query: Sql) {
	try {
		const { rows } = await db.execute(query.sql, query.values as any[])
		return { rows: rows as T[], err: null }
	} catch (err) {
		console.error(err)
		return { rows: null, err: err as LibsqlError }
	}
}
