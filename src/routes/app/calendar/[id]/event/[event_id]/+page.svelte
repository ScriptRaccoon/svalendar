<script lang="ts">
	import { enhance } from '$app/forms'
	import EventInput from '$lib/components/EventInput.svelte'
	import IconLink from '$lib/components/IconLink.svelte'
	import { faXmark } from '@fortawesome/free-solid-svg-icons'

	let { data, form } = $props()
	let event = $derived(data.event)

	let title = $derived(
		data.permission_level === 'read' ? 'Event Details' : 'Edit Event'
	)
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<header>
	<h2>{title}</h2>
	<IconLink
		href={`/app/calendar/${event.calendar_id}/${event.start_date}`}
		aria_label="back to calendar"
		icon={faXmark}
	/>
</header>

<form method="POST" action="?/update" use:enhance>
	<EventInput
		title={form?.title ?? event.title}
		description={form?.description ?? event.description}
		start_time={form?.start_time ?? event.start_time}
		end_time={form?.end_time ?? event.end_time}
		location={form?.location ?? event.location}
		color={form?.color ?? event.color}
		readonly={data.permission_level === 'read'}
	/>

	{#if data.permission_level !== 'read'}
		<p>Fields marked with * are required.</p>

		<menu>
			<button class="button" type="submit">Update Event</button>
			<button class="button danger" type="submit" formaction="?/delete"
				>Delete Event</button
			>
		</menu>
	{/if}
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
