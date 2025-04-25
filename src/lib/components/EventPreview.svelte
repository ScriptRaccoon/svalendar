<script lang="ts">
	import { page } from '$app/state';
	import { EVENTS_COLORS_DICTIONARY } from '$lib/config';
	import type { CalendarEvent } from '$lib/server/types';
	import { format, differenceInMinutes } from 'date-fns';

	type Props = {
		event: CalendarEvent;
		next_start_time: string | null;
	};

	let { event, next_start_time }: Props = $props();

	let length_in_minutes = $derived(differenceInMinutes(event.end_time, event.start_time));

	let minutes_to_next = $derived(
		next_start_time ? differenceInMinutes(next_start_time, event.end_time) : 0
	);
</script>

<a
	class="event"
	href={`${page.url.pathname}/event/${event.id}`}
	style="--color: {EVENTS_COLORS_DICTIONARY[event.color]}; --mins: {length_in_minutes}"
>
	<div class="title">
		{event.title}
	</div>
	<div class="time">
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

	.title {
		font-weight: bold;
	}

	.spacer {
		height: calc(0.1rem * var(--mins));
	}
</style>
