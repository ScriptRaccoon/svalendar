import { redirect } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { remove_auth_cookie } from '$lib/server/auth'

export const GET: RequestHandler = async (event) => {
	remove_auth_cookie(event)
	redirect(302, '/login')
}
