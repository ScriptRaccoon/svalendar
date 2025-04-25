<script lang="ts">
	let { data, form } = $props();
	let event = $derived(data.event);
</script>

<h1>Edit Event</h1>

<a href="/app/calendar/{data.calendar_id}">Back to calendar</a>

<form method="POST" action="?/update">
	<div>
		<label for="title">Title*</label>
		<input type="text" id="title" name="title" value={event.title} required />
	</div>
	<div>
		<label for="description">Description</label>
		<textarea id="description" name="description">{event.description}</textarea>
	</div>
	<div>
		<label for="start_time">Start Time*</label>
		<input
			type="datetime-local"
			id="start_time"
			name="start_time"
			value={event.start_time}
			required
		/>
	</div>
	<div>
		<label for="end_time">End Time*</label>
		<input type="datetime-local" id="end_time" name="end_time" value={event.end_time} required />
	</div>
	<div>
		<label for="location">Location</label>
		<input type="text" id="location" name="location" value={event.location} />
	</div>
	<div>
		<label for="color">Color*</label>
		<input type="color" id="color" name="color" value={event.color} required />
	</div>

	<button type="submit">Update Event</button>
</form>

<p>Fields marked with * are required.</p>

<form method="POST" action="?/delete">
	<button type="submit">Delete Event</button>
</form>

{#if form?.error}
	<p>{form.error}</p>
{/if}
