<script lang="ts">
	import { enhance } from '$app/forms'
	import EventInput from '$lib/components/EventInput.svelte'
	import IconLink from '$lib/components/IconLink.svelte'
	import { faXmark } from '@fortawesome/free-solid-svg-icons'

	let { form, data } = $props()

	let back_url = $derived(
		data.date
			? `/app/calendar/${data.calendar_id}/${data.date}`
			: `/app/calendar/${data.calendar_id}`
	)
</script>

<svelte:head>
	<title>New Event</title>
</svelte:head>

<header class="app-header">
	<h1>New Event</h1>
	<menu class="menu">
		<IconLink href={back_url} aria_label="back to calendar" icon={faXmark} />
	</menu>
</header>

<form method="POST" use:enhance>
	<EventInput
		title={form?.title ?? ''}
		description={form?.description ?? ''}
		start_time={form?.start_time ?? data.start_time ?? ''}
		end_time={form?.end_time ?? data.end_time ?? ''}
		date={form?.date ?? data.date ?? ''}
		location={form?.location ?? ''}
		color={form?.color ?? data.color ?? ''}
		readonly={false}
	/>

	<button class="button" type="submit">Create Event</button>
</form>

{#if form?.error}
	<p class="error">{form.error}</p>
{/if}
