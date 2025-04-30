<script lang="ts">
	import Fa from 'svelte-fa'
	import { type IconDefinition as SolidIcon } from '@fortawesome/free-solid-svg-icons'
	import { type IconDefinition as RegularIcon } from '@fortawesome/free-regular-svg-icons'

	type Props = {
		href: string
		aria_label: string
		icon: SolidIcon | RegularIcon
		scale?: number
	}

	let { href, aria_label, icon, scale = 1.25 }: Props = $props()
</script>

<a {href} aria-label={aria_label}>
	<Fa {icon} {scale} />
</a>

<style>
	a {
		background-color: var(--icon-bg-color);
		border-radius: 50%;
		width: 2rem;
		height: 2rem;
		display: inline-flex;
		justify-content: center;
		align-items: center;
	}
</style>
