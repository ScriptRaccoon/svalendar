// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			name?: string;
		}
		interface PageData {
			name?: string;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
