<script>
	import { page } from '$app/state'
	import AppMenu from '$lib/components/AppMenu.svelte'
</script>

<svelte:head>
	<title>{page.status} Error</title>
</svelte:head>

<header class="app-header">
	<h1>{page.status} Error</h1>
	<AppMenu />
</header>

<p>{page.error?.message}</p>
