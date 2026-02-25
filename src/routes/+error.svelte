<script>
	import { page } from '$app/state'
</script>

<svelte:head>
	<title>{page.status} Error</title>
</svelte:head>

<h1>{page.status} Error</h1>

<p>{page.error?.message}</p>

<style>
	h1 {
		margin-top: 1rem;
	}
</style>
