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
				type="radio"
				name="color"
				class="color"
				value={color.id}
				checked={color.id === current_color}
				style:--color={color.value}
				disabled={readonly}
			/>
		{/each}
	</div>
</div>

<style>
	.colors-container {
		display: grid;
		grid-template-columns: auto 1fr;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.colors {
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
	}

	.color {
		--size: 1.3rem;
		appearance: none;
		width: var(--size);
		height: var(--size);
		border-radius: 50%;
		background-color: var(--color);
		cursor: pointer;

		&:checked {
			outline: 2px solid var(--outline-color);
			outline-offset: 2px;
		}

		&:focus-visible {
			outline: 2px solid var(--font-color);
			outline-offset: 2px;
		}
	}

	@media (min-width: 600px) {
		.colors {
			max-width: 26rem;
			gap: 1rem;
			justify-content: start;
		}
		.color {
			--size: 1.75rem;
		}
	}
</style>
