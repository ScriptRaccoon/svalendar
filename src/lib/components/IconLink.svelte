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
		counter?: number | null
	}

	let {
		href,
		aria_label,
		icon,
		scale = 1.125,
		preload = 'hover',
		counter
	}: Props = $props()
</script>

<a {href} aria-label={aria_label} data-sveltekit-preload-data={preload}>
	<Fa {icon} {scale} />
	{#if counter && counter > 0}
		{#if counter < 10}
			<span>{counter}</span>
		{:else}
			<span>9+</span>
		{/if}
	{/if}
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
		position: relative;
	}

	span {
		position: absolute;
		top: -0.2rem;
		left: -0.2rem;
		font-size: 0.825rem;
		background-color: var(--primary-color);
		color: #fff;
		width: 1.25rem;
		height: 1.25rem;
		padding-inline: 0.25rem;
		overflow: hidden;
		border-radius: 100vw;
		line-height: 1.25rem;
		text-align: center;
	}
</style>
