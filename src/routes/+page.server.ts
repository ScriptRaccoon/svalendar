import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async (event) => {
	const user = event.locals.user
	if (user) redirect(302, '/app/calendar')
}
