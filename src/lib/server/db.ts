import { DB_AUTH_TOKEN, DB_URL } from '$env/static/private'
import { createClient, LibsqlError } from '@libsql/client'
import type { Sql } from 'sql-template-tag'

const db = createClient({
	url: DB_URL,
	authToken: DB_AUTH_TOKEN
})

db.execute('PRAGMA foreign_keys = ON')

/**
 * Small wrapper around db.execute to handle errors,
 * use sql templates, and specify the type of the result.
 */
export async function query<T>(query: Sql) {
	try {
		const { rows } = await db.execute(query.sql, query.values as any[])
		return { rows: rows as T[], err: null }
	} catch (err) {
		console.error(err)
		return { rows: null, err: err as LibsqlError }
	}
}

/**
 * Small wrapper around db.batch to handle errors
 * and use sql templates, and specify the type of the result.
 */
export async function batch<T extends any[][]>(queries: Sql[]) {
	try {
		const results = await db.batch(
			queries.map((query) => ({
				sql: query.sql,
				args: query.values as any[]
			}))
		)
		return { results: results.map(({ rows }) => rows) as T, err: null }
	} catch (err) {
		console.error(err)
		return { results: null, err: err as LibsqlError }
	}
}
