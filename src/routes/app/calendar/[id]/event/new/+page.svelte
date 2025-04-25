<script lang="ts">
	import IconLink from '$lib/components/IconLink.svelte';
	import { faXmark } from '@fortawesome/free-solid-svg-icons';

	let { form, data } = $props();
</script>

<header>
	<h1>New Event</h1>
	<IconLink href="/app/calendar/{data.calendar_id}" aria_label="back to calendar" icon={faXmark} />
</header>

<form method="POST">
	<div>
		<label for="title">Title*</label>
		<input type="text" id="title" name="title" value={form?.title} required />
	</div>
	<div>
		<label for="description">Description</label>
		<textarea id="description" name="description">{form?.description}</textarea>
	</div>
	<div>
		<label for="start_time">Start Time*</label>
		<input
			type="datetime-local"
			id="start_time"
			name="start_time"
			value={form?.start_time}
			required
		/>
	</div>
	<div>
		<label for="end_time">End Time*</label>
		<input type="datetime-local" id="end_time" name="end_time" value={form?.end_time} required />
	</div>
	<div>
		<label for="location">Location</label>
		<input type="text" id="location" name="location" value={form?.location} />
	</div>
	<div>
		<label for="color">Color*</label>
		<input type="color" id="color" name="color" value={form?.color} required />
	</div>

	<button type="submit">Create Event</button>
</form>

<p>Fields marked with * are required.</p>

{#if form?.error}
	<p>{form.error}</p>
{/if}

<style>
	header {
		display: flex;
		justify-content: space-between;
		align-items: start;
	}
</style>
