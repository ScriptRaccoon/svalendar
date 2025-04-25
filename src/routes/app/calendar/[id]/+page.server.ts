import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

import { format } from 'date-fns'

export const load: PageServerLoad = async (event) => {
	const calendar_id = event.params.id
	const today = format(new Date(), 'yyyy-MM-dd')
	redirect(302, `/app/calendar/${calendar_id}/${today}`)
}
