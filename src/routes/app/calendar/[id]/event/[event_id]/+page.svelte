<script lang="ts">
	import EventInput from '$lib/components/EventInput.svelte'
	import IconButton from '$lib/components/IconButton.svelte'
	import { faXmark } from '@fortawesome/free-solid-svg-icons'

	let { data, form } = $props()
	let event = $derived(data.event)
</script>

<header>
	<h2>Edit Event</h2>
	<IconButton
		onclick={() => history.back()}
		aria_label="back to calendar"
		icon={faXmark}
	/>
</header>

<form method="POST" action="?/update">
	<EventInput
		title={event.title}
		description={event.description}
		start_time={event.start_time}
		end_time={event.end_time}
		location={event.location}
		color={event.color}
	/>

	<p>Fields marked with * are required.</p>

	<menu>
		<button class="button" type="submit">Update Event</button>
		<button class="button danger" type="submit" formaction="?/delete"
			>Delete Event</button
		>
	</menu>
</form>

{#if form?.error}
	<p class="error">{form.error}</p>
{/if}

<style>
	header,
	menu {
		display: flex;
		justify-content: space-between;
		align-items: start;
	}
</style>
