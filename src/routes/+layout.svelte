<script lang="ts">
	import Header from '$lib/components/Header.svelte'
	import './app.css'

	let { children } = $props()
</script>

<div class="wrapper">
	<Header />
	{@render children?.()}
</div>

<style>
	.wrapper {
		padding-inline: 0.75rem;
		max-width: 42rem;
		margin-inline: auto;
	}
</style>
