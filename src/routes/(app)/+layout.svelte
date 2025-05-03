<script lang="ts">
	let { children } = $props()
</script>

<div class="wrapper">
	{@render children?.()}
</div>

<style>
	.wrapper {
		padding-inline: 0.75rem;
		max-width: 42rem;
		margin-inline: auto;
		margin-bottom: 2rem;
	}
</style>
