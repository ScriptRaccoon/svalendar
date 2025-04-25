<script lang="ts">
	import EventInput from '$lib/components/EventInput.svelte';
	import IconLink from '$lib/components/IconLink.svelte';
	import { faXmark } from '@fortawesome/free-solid-svg-icons';

	let { form, data } = $props();
</script>

<header>
	<h1>New Event</h1>
	<IconLink href="/app/calendar/{data.calendar_id}" aria_label="back to calendar" icon={faXmark} />
</header>

<form method="POST">
	<EventInput
		title={form?.title ?? ''}
		description={form?.description ?? ''}
		start_time={form?.start_time ?? ''}
		end_time={form?.end_time ?? ''}
		location={form?.location ?? ''}
		color={form?.color ?? ''}
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
