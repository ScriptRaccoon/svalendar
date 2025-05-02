import { DB_AUTH_TOKEN, DB_URL } from '$env/static/private'
import { createClient, LibsqlError, type Transaction } from '@libsql/client'
import type { Sql } from 'sql-template-tag'

export const db = createClient({
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
 * Small wrapper around tx.execute to use sql templates,
 * and specify the type of the result.
 * We don't handle errors, since it's used in a transaction.
 */
export async function tx_query<T = unknown>(tx: Transaction, query: Sql): Promise<T[]> {
	const { rows } = await tx.execute({ sql: query.sql, args: query.values as any[] })
	return rows as T[]
}
