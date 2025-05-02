<script lang="ts">
	import { enhance } from '$app/forms'
	import EventInput from '$lib/components/EventInput.svelte'
	import IconLink from '$lib/components/IconLink.svelte'
	import { faXmark } from '@fortawesome/free-solid-svg-icons'
	import { getDate } from 'date-fns'

	let { form, data } = $props()

	let back_url = $derived(
		data.start_time
			? `/app/calendar/${data.calendar_id}/${getDate(data.start_time)}`
			: `/app/calendar/${data.calendar_id}`
	)
</script>

<svelte:head>
	<title>New Event</title>
</svelte:head>

<header>
	<h2>New Event</h2>
	<IconLink href={back_url} aria_label="back to calendar" icon={faXmark} />
</header>

<form method="POST" use:enhance>
	<EventInput
		title={form?.title ?? ''}
		description={form?.description ?? ''}
		start_time={form?.start_time ?? data.start_time ?? ''}
		end_time={form?.end_time ?? data.end_time ?? ''}
		location={form?.location ?? ''}
		color={form?.color ?? data.color ?? ''}
		readonly={false}
	/>

	<p>Fields marked with * are required.</p>

	<button class="button" type="submit">Create Event</button>
</form>

{#if form?.error}
	<p class="error">{form.error}</p>
{/if}

<style>
	header {
		display: flex;
		justify-content: space-between;
		align-items: start;
	}
</style>
