import { redirect } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async (event) => {
	event.cookies.delete('jwt', { path: '/' })
	delete event.locals.user
	redirect(302, '/login')
}
