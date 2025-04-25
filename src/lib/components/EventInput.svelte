<script lang="ts">
	import ColorPicker from './ColorPicker.svelte'

	type Props = {
		title: string
		description: string
		start_time: string
		end_time: string
		location: string
		color: string
	}

	let {
		title,
		description,
		start_time,
		end_time,
		location,
		color: current_color
	}: Props = $props()
</script>

<div class="input-group">
	<label for="title">Title*</label>
	<input type="text" id="title" name="title" value={title} required />
</div>

<div class="input-group">
	<label for="description">Description</label>
	<textarea id="description" name="description">{description}</textarea>
</div>

<div class="input-group">
	<label for="start_time">Start Time*</label>
	<input
		type="datetime-local"
		id="start_time"
		name="start_time"
		value={start_time}
		required
	/>
</div>

<div class="input-group">
	<label for="end_time">End Time*</label>
	<input
		type="datetime-local"
		id="end_time"
		name="end_time"
		value={end_time}
		required
	/>
</div>

<div class="input-group">
	<label for="location">Location</label>
	<input type="text" id="location" name="location" value={location} />
</div>

<ColorPicker label="Color*" {current_color} />
