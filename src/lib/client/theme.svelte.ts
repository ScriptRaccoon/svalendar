import { browser } from '$app/environment'

type Theme = 'light' | 'dark'

const initial_theme: Theme =
	browser && localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'

export const theme = $state<{ value: Theme }>({ value: initial_theme })

export function toggle_theme() {
	if (!browser) return
	const new_theme = theme.value === 'dark' ? 'light' : 'dark'
	theme.value = new_theme
	localStorage.setItem('theme', new_theme)
	document.documentElement.setAttribute('data-theme', new_theme)
}
