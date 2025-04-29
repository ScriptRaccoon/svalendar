<script lang="ts">
	import { EVENTS_COLORS_DICTIONARY } from '$lib/config'
	import type { CalendarEvent } from '$lib/server/types'
	import { faClockFour } from '@fortawesome/free-regular-svg-icons'
	import { faLocationDot } from '@fortawesome/free-solid-svg-icons'
	import { format, differenceInMinutes } from 'date-fns'
	import Fa from 'svelte-fa'

	type Props = {
		event: CalendarEvent
		next_start_time: string | null
		calendar_id: number
	}

	let { event, next_start_time, calendar_id }: Props = $props()

	let length_in_minutes = $derived(
		differenceInMinutes(event.end_time, event.start_time)
	)

	let minutes_to_next = $derived(
		next_start_time ? differenceInMinutes(next_start_time, event.end_time) : 0
	)
</script>

<a
	class="event"
	href={`/app/calendar/${calendar_id}/event/${event.id}`}
	style="--color: {EVENTS_COLORS_DICTIONARY[event.color]}; --mins: {length_in_minutes}"
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
	<div class="time">
		<Fa icon={faClockFour} />
		{format(event.start_time, 'HH:mm')} &ndash;
		{format(event.end_time, 'HH:mm')}
	</div>
</a>

{#if minutes_to_next > 0}
	<div class="spacer" style="--mins: {minutes_to_next}"></div>
{/if}

<style>
	.event {
		display: block;
		text-decoration: none;
		background-color: var(--color);
		color: white;
		padding: 0.5rem;
		border-radius: 0.25rem;
		min-height: calc(0.1rem * var(--mins));
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.title {
		font-weight: bold;
	}

	.location {
		font-size: 0.825rem;
	}

	.spacer {
		height: calc(0.1rem * var(--mins));
	}
</style>
