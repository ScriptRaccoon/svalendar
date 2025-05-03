<script lang="ts">
	import Fa from 'svelte-fa'
	import { type IconDefinition as IconSolid } from '@fortawesome/free-solid-svg-icons'
	import { type IconDefinition as IconRegular } from '@fortawesome/free-regular-svg-icons'

	type Props = {
		href: string
		aria_label: string
		icon: IconSolid | IconRegular
		scale?: number
		preload?: 'hover' | 'tap' | 'off'
	}

	let { href, aria_label, icon, scale = 1.125, preload = 'hover' }: Props = $props()
</script>

<a {href} aria-label={aria_label} data-sveltekit-preload-data={preload}>
	<Fa {icon} {scale} />
</a>

<style>
	a {
		text-decoration: none;
		background-color: var(--icon-bg-color);
		border-radius: 50%;
		width: 2rem;
		height: 2rem;
		display: inline-flex;
		justify-content: center;
		align-items: center;
	}
</style>
