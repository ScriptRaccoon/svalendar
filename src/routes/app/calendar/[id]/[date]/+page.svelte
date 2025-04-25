<script lang="ts">
	import EventPreview from '$lib/components/EventPreview.svelte'
	import IconLink from '$lib/components/IconLink.svelte'
	import type { CalendarEvent } from '$lib/server/types'
	import {
		faCaretLeft,
		faCaretRight,
		faCog,
		faPlus
	} from '@fortawesome/free-solid-svg-icons'
	import { format, addDays } from 'date-fns'

	let { data } = $props()

	const calendar = data.calendar

	let events = $derived<CalendarEvent[]>(data.events)
	let today = $derived<string>(data.today)
	let tomorrow = $derived(format(addDays(today, 1), 'yyyy-MM-dd'))
	let yesterday = $derived(format(addDays(today, -1), 'yyyy-MM-dd'))
</script>

<header>
	<h2>Calendar {calendar.name}</h2>
	<menu>
		<IconLink
			href="/app/calendar/{calendar.id}/settings"
			aria_label="Settings"
			icon={faCog}
		/>
		<IconLink
			href="/app/calendar/{calendar.id}/event/new?date={today}&color={calendar.default_color}"
			aria_label="New Event"
			icon={faPlus}
		/>
	</menu>
</header>

<header>
	<h3>{new Date(today).toLocaleDateString()}</h3>
	<menu>
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

{#if events.length > 0}
	<div class="events">
		{#each events as event, index (event.id)}
			{@const next_start_time =
				index < events.length - 1 ? events[index + 1].start_time : null}

			<EventPreview {event} {next_start_time} calendar_id={calendar.id} />
		{/each}
	</div>
{:else}
	<p>No events for this date.</p>
{/if}

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
