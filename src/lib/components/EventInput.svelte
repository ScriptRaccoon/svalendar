<script lang="ts">
	import { EVENT_COLORS } from '$lib/config'

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

<div class="colors-container">
	<span class="label">Color*</span>
	<div class="colors">
		{#each EVENT_COLORS as color (color.id)}
			<input
				id="c_{color.id}"
				type="radio"
				name="color"
				value={color.id}
				checked={color.id === current_color}
			/>
			<label
				class="color"
				style:--color={color.value}
				for="c_{color.id}"
				aria-label={color.id}
			></label>
		{/each}
	</div>
</div>

<style>
	input[type='radio'] {
		position: absolute;
		left: -100vw;
	}

	input[type='radio']:checked + .color {
		outline: 2px solid var(--outline-color);
		outline-offset: 2px;
	}

	input[type='radio']:focus-visible + .color {
		outline: 2px solid var(--font-color);
		outline-offset: 2px;
	}

	.colors-container {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 1rem;
		margin-bottom: 1rem;

		.label {
			color: var(--secondary-font-color);
		}
	}

	.colors {
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
		max-width: 26rem;
		gap: 0.25rem;
	}

	.color {
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 50%;
		background-color: var(--color);
		cursor: pointer;
	}
</style>
