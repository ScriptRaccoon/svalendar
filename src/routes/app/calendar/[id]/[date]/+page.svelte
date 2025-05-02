<script lang="ts">
	import EventPreview from '$lib/components/EventPreview.svelte'
	import IconLink from '$lib/components/IconLink.svelte'
	import type { Calendar, CalendarEvent } from '$lib/server/types'
	import {
		faCaretLeft,
		faCaretRight,
		faCog,
		faPlus
	} from '@fortawesome/free-solid-svg-icons'
	import { format, addDays, getHours, getMinutes, differenceInMinutes } from 'date-fns'

	let { data } = $props()

	let calendar = $derived<Calendar>(data.calendar)
	let events = $derived<CalendarEvent[]>(data.events)
	let today = $derived<string>(data.today)
	let tomorrow = $derived(format(addDays(today, 1), 'yyyy-MM-dd'))
	let yesterday = $derived(format(addDays(today, -1), 'yyyy-MM-dd'))

	function get_hours(datetime: string) {
		return getHours(datetime) + getMinutes(datetime) / 60
	}
</script>

<svelte:head>
	<title>Calendar {calendar.name}</title>
</svelte:head>

<header>
	<h2>Calendar {calendar.name}</h2>

	<menu>
		{#if calendar.permission_level === 'owner'}
			<IconLink
				href="/app/calendar/{calendar.id}/settings"
				aria_label="Settings"
				icon={faCog}
				scale={1}
			/>
		{/if}
		{#if calendar.permission_level === 'owner' || calendar.permission_level === 'write'}
			<IconLink
				href="/app/calendar/{calendar.id}/event/new?date={today}&color={calendar.default_color}"
				aria_label="New Event"
				icon={faPlus}
			/>
		{/if}
	</menu>
</header>

{#if calendar.permission_level !== 'owner'}
	<p class="rights">You have {calendar.permission_level} rights for this calendar.</p>
{/if}

<header>
	<h3>{new Date(today).toLocaleDateString()}</h3>
	{#if events.length === 0}
		<span class="no-events">No events for this day</span>
	{/if}
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

<div class="day">
	{#each { length: 24 } as _, hour}
		<div class="hour-block">
			<span class="time">{hour.toString().padStart(2, '0') + ':00'}</span>
		</div>
	{/each}
	{#each events as event (event.id)}
		<div
			class="positioner"
			style:--hours-start={get_hours(event.start_time)}
			style:--hours-diff={(1 / 60) *
				differenceInMinutes(event.end_time, event.start_time)}
		>
			<EventPreview {event} />
		</div>
	{/each}
</div>

<style>
	header {
		display: flex;
		justify-content: space-between;
		align-items: start;
		gap: 1rem;
	}

	header menu {
		display: flex;
		gap: 0.5rem;
		margin-left: auto;
	}

	.rights {
		margin-top: -0.75rem;
		color: var(--secondary-font-color);
	}

	.day {
		margin-top: 1rem;
		--unit: 6rem;
		position: relative;
	}

	.hour-block {
		height: var(--unit);
		position: relative;
		border-top: 1px solid var(--helping-line-color);

		.time {
			position: absolute;
			top: 0;
			left: 0;
			font-size: 0.875rem;
			color: var(--secondary-font-color);
		}
	}

	.positioner {
		top: calc(var(--hours-start) * var(--unit));
		height: max(4rem, calc(var(--hours-diff) * var(--unit)));
		translate: 0 1px;
		overflow: hidden;
		right: 0;
		left: 3rem;
		position: absolute;
	}

	.no-events {
		color: var(--secondary-font-color);
	}
</style>
