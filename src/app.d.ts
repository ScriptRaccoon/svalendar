import type { UserLocals } from '$lib/server/types'

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user?: UserLocals
		}
		interface PageData {
			user?: UserLocals
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {}
