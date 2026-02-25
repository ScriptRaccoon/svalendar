import type { UserLocals } from '$lib/server/types'

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user?: UserLocals
		}
		interface PageData {
			user?: UserLocals
			number_unread_notifications?: number | null
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {}
