<script lang="ts">
	import Fa from 'svelte-fa'
	import { type IconDefinition as SolidIcon } from '@fortawesome/free-solid-svg-icons'
	import { type IconDefinition as RegularIcon } from '@fortawesome/free-regular-svg-icons'

	type Props = {
		aria_label: string
		icon: SolidIcon | RegularIcon
		onclick?: () => void
		small?: boolean
	}

	let { aria_label, icon, onclick, small = false }: Props = $props()
</script>

<button aria-label={aria_label} {onclick} class:small>
	<Fa {icon} scale={1.25} />
</button>

<style>
	button {
		background-color: var(--icon-bg-color);
		cursor: pointer;
		border-radius: 50%;
		width: 2rem;
		height: 2rem;
		display: inline-flex;
		justify-content: center;
		align-items: center;
	}

	button.small {
		width: 1.5rem;
		height: 1.5rem;
		font-size: 0.75rem;
	}
</style>
