<script lang="ts">
	import Nav from '$lib/components/Nav.svelte'
	import './app.css'

	let { children } = $props()
</script>

<div class="wrapper">
	<Nav />
	{@render children?.()}
</div>

<style>
	.wrapper {
		padding-inline: 0.75rem;
		max-width: 42rem;
		margin-inline: auto;
	}
</style>
