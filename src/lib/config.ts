import { faCalendar, faEye, faPenToSquare } from '@fortawesome/free-regular-svg-icons'

export const EVENT_COLORS = [
	{ id: 'red', value: 'hsl(0deg, 70%, 40%)' },
	{ id: 'orange', value: 'hsl(35deg, 100%, 45%)' },
	{ id: 'olive', value: 'hsl(70deg, 100%, 30%)' },
	{ id: 'green', value: 'hsl(120deg, 100%, 30%)' },
	{ id: 'teal', value: 'hsl(160deg, 95%, 35%)' },
	{ id: 'blue', value: 'hsl(200deg, 80%, 40%)' },
	{ id: 'indigo', value: 'hsl(240deg, 80%, 30%)' },
	{ id: 'violet', value: 'hsl(280deg, 80%, 40%)' },
	{ id: 'pink', value: 'hsl(320deg, 80%, 40%)' }
] as const satisfies readonly {
	id: string
	value: string
}[]

export const EVENTS_COLORS_DICTIONARY = Object.fromEntries(
	EVENT_COLORS.map((color) => [color.id, color.value])
) as Record<string, string>

export const COLOR_IDS = EVENT_COLORS.map((color) => color.id) as [string, ...string[]]

export const DEFAULT_COLOR = 'blue'

export const MINIMAL_EVENT_DURATION = 10 // in minutes
