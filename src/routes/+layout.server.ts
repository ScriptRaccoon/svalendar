import { get_number_unread_notifications } from '$lib/server/utils'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async (event) => {
	const user = event.locals.user

	const number_unread_notifications = user
		? await get_number_unread_notifications(user.id)
		: null

	return { user, number_unread_notifications }
}
