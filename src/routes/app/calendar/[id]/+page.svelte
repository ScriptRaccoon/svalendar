<script lang="ts">
	let { data } = $props();
	let calendar = $derived(data.calendar);
	let events = $derived(data.events);
</script>

<h1>Calendar {calendar.name}</h1>

<a href="/app/calendar/{calendar.id}/settings">Settings</a>
<br />
<a href="/app/calendar/{calendar.id}/event/new">New Event</a>

{#each events as event (event.id)}
	<!-- TODO: proper styling etc. -->
	<div>
		{event.title} ({event.start_time} &ndash; {event.end_time})
		<a href="/app/calendar/{calendar.id}/event/{event.id}">Edit</a>
	</div>
{/each}
