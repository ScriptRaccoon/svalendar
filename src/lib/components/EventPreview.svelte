<script lang="ts">
	import { EVENTS_COLORS_DICTIONARY } from '$lib/config'
	import type { CalendarEvent } from '$lib/server/types'
	import { faClockFour } from '@fortawesome/free-regular-svg-icons'
	import { faLocationDot } from '@fortawesome/free-solid-svg-icons'
	import Fa from 'svelte-fa'

	type Props = {
		event: CalendarEvent
		hours_diff: number
		calendar_id: string
	}

	let { event, hours_diff, calendar_id }: Props = $props()
</script>

<a
	class="event"
	href="/app/calendar/{calendar_id}/event/{event.id}"
	style:--color={EVENTS_COLORS_DICTIONARY[event.color]}
>
	<div class="header">
		<div class="title">
			{event.title}
		</div>
		{#if event.location}
			<div class="location">
				<Fa icon={faLocationDot} />
				{event.location}
			</div>
		{/if}
	</div>
	{#if hours_diff >= 1}
		<div class="time">
			<Fa icon={faClockFour} />
			{event.start_time} &ndash;
			{event.end_time}
		</div>
	{/if}
</a>

<style>
	.event {
		display: block;
		text-decoration: none;
		background-color: var(--color);
		color: white;
		padding: 0.5rem;
		border-radius: 0.25rem;
		height: 100%;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;

		.title {
			font-weight: bold;
		}

		.location {
			font-size: 0.825rem;
		}
	}
</style>
