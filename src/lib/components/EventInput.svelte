<script lang="ts">
	import ColorPicker from './ColorPicker.svelte'

	type Props = {
		title: string
		description: string
		location: string
		start_time: string
		end_time: string
		date: string
		color: string
		readonly: boolean
	}

	let {
		title,
		description,
		location,
		start_time,
		end_time,
		date,
		color: current_color,
		readonly
	}: Props = $props()
</script>

<div class="input-group">
	<label for="title">Title*</label>
	<input type="text" id="title" name="title" value={title} required {readonly} />
</div>

<div class="input-group">
	<label for="description">Description</label>
	<textarea id="description" name="description" {readonly}>{description}</textarea>
</div>

<div class="input-group">
	<label for="date">Date*</label>
	<input type="date" id="date" name="date" value={date} {readonly} />
</div>

<div class="input-group">
	<label for="start_time">Start Time*</label>
	<input
		type="time"
		id="start_time"
		name="start_time"
		value={start_time}
		{readonly}
		required
	/>
</div>

<div class="input-group">
	<label for="end_time">End Time*</label>
	<input
		type="time"
		id="end_time"
		name="end_time"
		value={end_time}
		{readonly}
		required
	/>
</div>

<div class="input-group">
	<label for="location">Location</label>
	<input type="text" id="location" name="location" value={location} {readonly} />
</div>

<ColorPicker label="Color" {current_color} {readonly} />
