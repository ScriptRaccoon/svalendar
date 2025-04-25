<script lang="ts">
	import EventPreview from '$lib/components/EventPreview.svelte'
	import IconButton from '$lib/components/IconButton.svelte'
	import IconLink from '$lib/components/IconLink.svelte'
	import type { CalendarEvent } from '$lib/server/types'
	import {
		faCaretLeft,
		faCaretRight,
		faCog,
		faPlus
	} from '@fortawesome/free-solid-svg-icons'
	import { format, addDays } from 'date-fns'
	import Fa from 'svelte-fa'

	let { data } = $props()

	const calendar = data.calendar

	let events = $state<CalendarEvent[]>(data.events)
	let today = $state<Date>(data.today)

	let error_message = $state('')

	function increment_day() {
		today = addDays(today, 1)
		update_events()
	}

	function decrement_day() {
		today = addDays(today, -1)
		update_events()
	}

	async function update_events() {
		const today_str = format(today, 'yyyy-MM-dd')
		const tomorrow_str = format(addDays(today, 1), 'yyyy-MM-dd')
		const url = `/api/events/${calendar.id}?start_date=${today_str}&end_date=${tomorrow_str}`
		const res = await fetch(url)
		if (!res.ok) {
			error_message = 'Failed to fetch events from API'
			return
		}
		events = await res.json()
	}
</script>

<header>
	<h1>Calendar {calendar.name}</h1>
	<menu>
		<IconLink
			href="/app/calendar/{calendar.id}/settings"
			aria_label="Settings"
			icon={faCog}
		/>
		<IconLink
			href="/app/calendar/{calendar.id}/event/new"
			aria_label="New Event"
			icon={faPlus}
		/>
	</menu>
</header>

{#if error_message}
	<p class="error">{error_message}</p>
{/if}

<header>
	<h2>{today.toLocaleDateString()}</h2>
	<menu>
		<IconButton
			icon={faCaretLeft}
			aria_label="decrement day"
			onclick={decrement_day}
		/>
		<IconButton
			icon={faCaretRight}
			aria_label="increment day"
			onclick={increment_day}
		/>
	</menu>
</header>

<div class="events">
	{#each events as event, index (event.id)}
		{@const next_start_time =
			index < events.length - 1 ? events[index + 1].start_time : null}

		<EventPreview {event} {next_start_time} />
	{/each}
</div>

<style>
	header {
		display: flex;
		justify-content: space-between;
		align-items: start;
	}

	header menu {
		display: flex;
		gap: 0.5rem;
	}

	.events {
		margin-top: 1rem;
		margin-bottom: 2rem;
	}
</style>
