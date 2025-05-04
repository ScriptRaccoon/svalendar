<script lang="ts">
	import { afterNavigate } from '$app/navigation'
	import EventPreview from '$lib/components/EventPreview.svelte'
	import IconLink from '$lib/components/IconLink.svelte'
	import type { Calendar, CalendarEvent } from '$lib/server/types'
	import { faCalendar } from '@fortawesome/free-regular-svg-icons'
	import {
		faCaretLeft,
		faCaretRight,
		faCog,
		faList,
		faPlus
	} from '@fortawesome/free-solid-svg-icons'
	import { format, addDays } from 'date-fns'
	import Fa from 'svelte-fa'

	let { data } = $props()

	let calendar = $derived<Calendar>(data.calendar)
	let events = $derived<CalendarEvent[]>(data.events)
	let today = $derived<string>(data.today)
	let tomorrow = $derived(format(addDays(today, 1), 'yyyy-MM-dd'))
	let yesterday = $derived(format(addDays(today, -1), 'yyyy-MM-dd'))

	const TIME_SLOT_HEIGHT = 70 // in pixels

	function get_hours(time: string) {
		const [hour, minute] = time.split(':').map(Number)
		return hour + minute / 60
	}

	function get_hours_diff(start_time: string, end_time: string) {
		const [start_hour, start_minute] = start_time.split(':').map(Number)
		const [end_hour, end_minute] = end_time.split(':').map(Number)
		return end_hour - start_hour + (end_minute - start_minute) / 60
	}

	const new_event_url = (start_hour: number) => {
		const start_time = `${start_hour.toString().padStart(2, '0')}:00`
		const end_time =
			start_hour === 23
				? '23:59'
				: `${(start_hour + 1).toString().padStart(2, '0')}:00`

		return (
			`/app/calendar/${calendar.id}/event/new` +
			`?start_time=${start_time}` +
			`&end_time=${end_time}` +
			`&date=${today}` +
			`&color=${calendar.default_color}`
		)
	}

	afterNavigate(() => {
		window.scrollTo({
			top: TIME_SLOT_HEIGHT * calendar.default_start_hour
		})
	})
</script>

<svelte:head>
	<title>Calendar {calendar.name}</title>
</svelte:head>

<div class="sticky">
	<header class="app-header">
		<h1>
			<Fa icon={faCalendar} />
			<span class="calendar_name">{calendar.name}</span>
		</h1>

		<menu class="menu">
			<IconLink href="/app/dashboard" icon={faList} aria_label="Dashboard" />

			<IconLink
				href="/app/calendar/{calendar.id}/settings"
				aria_label="Settings"
				icon={faCog}
				scale={1}
			/>

			<IconLink
				href={new_event_url(calendar.default_start_hour)}
				aria_label="New Event"
				icon={faPlus}
			/>
		</menu>
	</header>

	<header class="app-header">
		<h2 class="no-margin">
			{format(today, 'EEEE, dd MMMM yyyy')}
		</h2>
		<menu class="menu">
			<IconLink
				href="/app/calendar/{calendar.id}/{yesterday}"
				icon={faCaretLeft}
				aria_label="yesterday"
			/>
			<IconLink
				href="/app/calendar/{calendar.id}/{tomorrow}"
				icon={faCaretRight}
				aria_label="tomorrow"
			/>
		</menu>
	</header>
</div>

<div class="day" style:--unit="{TIME_SLOT_HEIGHT}px">
	{#each { length: 24 } as _, hour}
		<a
			class="hour-block"
			href={new_event_url(hour)}
			aria-label="create new event for hour {hour}"
		>
			<span class="time secondary">{hour.toString().padStart(2, '0') + ':00'}</span>
		</a>
	{/each}
	{#each events as event (event.id)}
		{@const hours_diff = get_hours_diff(event.start_time, event.end_time)}
		<div
			class="positioner"
			style:--hours-start={get_hours(event.start_time)}
			style:--hours-diff={hours_diff}
		>
			<EventPreview {event} {hours_diff} calendar_id={calendar.id} />
		</div>
	{/each}
</div>

<style>
	.sticky {
		position: sticky;
		top: 0;
		z-index: 10;
		background-color: var(--bg-color);
	}

	.calendar_name {
		margin-left: 0.4rem;
	}

	.day {
		position: relative;
	}

	.hour-block {
		display: block;
		text-decoration: none;
		height: var(--unit);
		position: relative;
		border-top: 1px solid var(--helping-line-color);

		.time {
			position: absolute;
			top: 0;
			left: 0;
			font-size: 0.875rem;
		}
	}

	.positioner {
		top: calc(var(--hours-start) * var(--unit));
		height: max(2.5rem, calc(var(--hours-diff) * var(--unit)));
		translate: 0 1px;
		overflow: hidden;
		right: 0;
		left: 3rem;
		position: absolute;
	}
</style>
