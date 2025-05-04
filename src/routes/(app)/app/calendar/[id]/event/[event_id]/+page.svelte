<script lang="ts">
	import { enhance } from '$app/forms'
	import { goto } from '$app/navigation'
	import EventInput from '$lib/components/EventInput.svelte'
	import IconLink from '$lib/components/IconLink.svelte'
	import { faXmark } from '@fortawesome/free-solid-svg-icons'

	let { data, form } = $props()
	let event = $derived(data.event)
</script>

<svelte:head>
	<title>Edit Event</title>
</svelte:head>

<header class="app-header">
	<h1>Edit Event</h1>
	<menu class="menu">
		<IconLink
			href={`/app/calendar/${event.calendar_id}/${event.event_date}`}
			aria_label="back to calendar"
			icon={faXmark}
		/>
	</menu>
</header>

<form method="POST" action="?/update" use:enhance>
	<EventInput
		title={form?.title ?? event.title}
		description={form?.description ?? event.description}
		start_time={form?.start_time ?? event.start_time}
		end_time={form?.end_time ?? event.end_time}
		date={form?.date ?? event.event_date}
		location={form?.location ?? event.location}
		color={form?.color ?? event.color}
		readonly={false}
	/>

	<menu>
		<button class="button danger" type="submit" formaction="?/delete">
			Delete Event
		</button>
		<button
			class="button"
			type="button"
			onclick={() => goto(`/app/calendar/${event.calendar_id}/${event.event_date}`)}
		>
			Cancel
		</button>
		<button class="button" type="submit">Save</button>
	</menu>
</form>

{#if form?.error}
	<p class="error">{form.error}</p>
{/if}

<style>
	menu {
		display: flex;
		justify-content: space-between;
		gap: 1rem;

		.button.danger {
			margin-right: auto;
		}
	}
</style>
