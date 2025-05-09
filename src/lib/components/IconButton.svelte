<script lang="ts">
	import Fa from 'svelte-fa'
	import { type IconDefinition as IconSolid } from '@fortawesome/free-solid-svg-icons'
	import { type IconDefinition as IconRegular } from '@fortawesome/free-regular-svg-icons'

	type Props = {
		aria_label: string
		icon: IconSolid | IconRegular
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
		border-radius: 50%;
		width: 2rem;
		height: 2rem;
		display: inline-flex;
		justify-content: center;
		align-items: center;

		&.small {
			width: 1.4rem;
			height: 1.4rem;
			font-size: 0.75rem;
		}
	}
</style>
