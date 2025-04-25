<script lang="ts">
	import { faXmark } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';

	type Props = {
		href: string;
		aria_label: string;
	};

	let { href, aria_label }: Props = $props();
</script>

<a {href} aria-label={aria_label}>
	<Fa icon={faXmark} scale={1.25} />
</a>

<style>
	a {
		background-color: #eee;
		border-radius: 50%;
		width: 2rem;
		height: 2rem;
		display: flex;
		justify-content: center;
		align-items: center;
		color: var(--secondary-font-color);
	}
</style>
