<script lang="ts">
	import Header from '$lib/components/Header.svelte'
	import './app.css'

	let { children } = $props()
</script>

<div class="wrapper">
	<Header />
	<main>
		{@render children?.()}
	</main>
</div>

<style>
	.wrapper {
		padding-inline: 0.75rem;
		max-width: 42rem;
		margin-inline: auto;
		margin-bottom: 2rem;
	}
</style>
