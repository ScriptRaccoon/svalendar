<script lang="ts">
	import Fa from 'svelte-fa';
	import { type IconDefinition as Icon1 } from '@fortawesome/free-solid-svg-icons';
	import { type IconDefinition as Icon2 } from '@fortawesome/free-regular-svg-icons';

	type Props = {
		href: string;
		aria_label: string;
		icon: Icon1 | Icon2;
	};

	let { href, aria_label, icon }: Props = $props();
</script>

<a {href} aria-label={aria_label}>
	<Fa {icon} scale={1.25} />
</a>

<style>
	a {
		background-color: #eee;
		border-radius: 50%;
		width: 2rem;
		height: 2rem;
		display: inline-flex;
		justify-content: center;
		align-items: center;
		color: var(--secondary-font-color);
	}
</style>
