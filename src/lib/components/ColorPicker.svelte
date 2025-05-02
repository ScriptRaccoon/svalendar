<script lang="ts">
	import { EVENT_COLORS } from '$lib/config'

	type Props = {
		current_color: string | null
		label: string
		readonly: boolean
	}

	let { label, current_color, readonly }: Props = $props()
</script>

<div class="colors-container">
	<span class="secondary">{label}</span>
	<div class="colors">
		{#each EVENT_COLORS as color (color.id)}
			<input
				id="c_{color.id}"
				type="radio"
				name="color"
				value={color.id}
				checked={color.id === current_color}
				disabled={readonly}
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
