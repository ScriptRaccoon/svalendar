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
	import { format, addDays } from 'date-fns'

	let { data } = $props()

	let calendar = $derived<Calendar>(data.calendar)
	let events = $derived<CalendarEvent[]>(data.events)
	let today = $derived<string>(data.today)
	let tomorrow = $derived(format(addDays(today, 1), 'yyyy-MM-dd'))
	let yesterday = $derived(format(addDays(today, -1), 'yyyy-MM-dd'))

	function get_hours(time: string) {
		const [hour, minute] = time.split(':').map(Number)
		return hour + minute / 60
	}

	function get_hours_diff(start_time: string, end_time: string) {
		const [start_hour, start_minute] = start_time.split(':').map(Number)
		const [end_hour, end_minute] = end_time.split(':').map(Number)
		return end_hour - start_hour + (end_minute - start_minute) / 60
	}

	const new_event_url = (hour: number) => {
		return (
			`/app/calendar/${calendar.id}/event/new` +
			`?start_time=${hour.toString().padStart(2, '0')}:00` +
			`&end_time=${(hour + 1).toString().padStart(2, '0')}:00` +
			`&date=${today}` +
			`&color=${calendar.default_color}`
		)
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
			<IconLink href={new_event_url(9)} aria_label="New Event" icon={faPlus} />
		{/if}
	</menu>

	{#if calendar.permission_level !== 'owner'}
		<p class="permissions secondary">
			You have {calendar.permission_level} permissions for this calendar.
		</p>
	{/if}
</header>

<header class="day-header">
	<h3>
		{format(today, 'EEEE, dd MMMM yyyy')}
	</h3>
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
		{#if calendar.permission_level === 'owner' || calendar.permission_level === 'write'}
			<a
				class="hour-block"
				href={new_event_url(hour)}
				aria-label="create new event for hour {hour}"
			>
				<span class="time secondary"
					>{hour.toString().padStart(2, '0') + ':00'}</span
				>
			</a>
		{:else}
			<div class="hour-block">
				<span class="time secondary"
					>{hour.toString().padStart(2, '0') + ':00'}</span
				>
			</div>
		{/if}
	{/each}
	{#each events as event (event.id)}
		<div
			class="positioner"
			style:--hours-start={get_hours(event.start_time)}
			style:--hours-diff={get_hours_diff(event.start_time, event.end_time)}
		>
			<EventPreview {event} />
		</div>
	{/each}
</div>

<style>
	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	header menu {
		display: flex;
		gap: 0.5rem;
	}

	header h2,
	header h3 {
		margin: 0;
	}

	.day-header {
		padding-block: 1rem;
	}

	.permissions {
		margin-top: -0.75rem;
	}

	.day {
		--unit: 6rem;
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
		height: max(4rem, calc(var(--hours-diff) * var(--unit)));
		translate: 0 1px;
		overflow: hidden;
		right: 0;
		left: 3rem;
		position: absolute;
	}
</style>
