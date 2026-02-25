import { redirect } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async (event) => {
	const calendar_id = event.params.id
	const today = new Date().toLocaleDateString('en-CA')
	redirect(302, `/calendar/${calendar_id}/${today}`)
}
