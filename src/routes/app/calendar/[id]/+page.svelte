<script lang="ts">
	import type { CalendarEvent } from '$lib/server/types';
	import { format, addDays } from 'date-fns'; // ???

	let { data } = $props();

	const calendar = data.calendar;

	let events = $state<CalendarEvent[]>(data.events);
	let today = $state<Date>(data.today);

	let error_message = $state('');

	function increment_day() {
		today = addDays(today, 1);
		update_events();
	}

	function decrement_day() {
		today = addDays(today, -1);
		update_events();
	}

	async function update_events() {
		const today_str = format(today, 'yyyy-MM-dd');
		const tomorrow_str = format(addDays(today, 1), 'yyyy-MM-dd');
		const url = `/api/events/${calendar.id}?start_date=${today_str}&end_date=${tomorrow_str}`;
		const res = await fetch(url);
		if (!res.ok) {
			error_message = 'Failed to fetch events from API';
			return;
		}
		events = await res.json();
	}
</script>

<h1>Calendar {calendar.name}</h1>

{#if error_message}
	<p>
		{error_message}
	</p>
{/if}

<a href="/app/calendar/{calendar.id}/settings">Settings</a>
<br />
<a href="/app/calendar/{calendar.id}/event/new">New Event</a>

<h2>Today, {today.toLocaleDateString()}</h2>

<menu>
	<button onclick={decrement_day}><strong>-</strong></button>
	<button onclick={increment_day}><strong>+</strong></button>
</menu>

{#each events as event (event.id)}
	<!-- TODO: proper styling etc. -->
	<div>
		{event.title} ({event.start_time} &ndash; {event.end_time})
		<a href="/app/calendar/{calendar.id}/event/{event.id}">Edit</a>
	</div>
{/each}
