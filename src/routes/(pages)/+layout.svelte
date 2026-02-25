<script lang="ts">
	import Header from '$lib/components/Header.svelte'

	let { children } = $props()
</script>

<div class="wrapper">
	<Header />
	<main>
		{@render children()}
	</main>
</div>
