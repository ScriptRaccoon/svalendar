<script>
	import { page } from '$app/state'
</script>

<svelte:head>
	<title>{page.status} Error</title>
</svelte:head>

<h2>{page.status} Error</h2>

<p>{page.error?.message}</p>
