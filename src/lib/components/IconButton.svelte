<script lang="ts">
	import Fa from 'svelte-fa'
	import { type IconDefinition as Icon1 } from '@fortawesome/free-solid-svg-icons'
	import { type IconDefinition as Icon2 } from '@fortawesome/free-regular-svg-icons'

	type Props = {
		aria_label: string
		icon: Icon1 | Icon2
		onclick: () => void
	}

	let { aria_label, icon, onclick }: Props = $props()
</script>

<button aria-label={aria_label} {onclick}>
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
</style>
