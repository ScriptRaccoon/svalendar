<script lang="ts">
	import AppMenu from '$lib/components/AppMenu.svelte'

	let { data } = $props()
</script>

<svelte:head>
	<title>Inbox</title>
</svelte:head>

<header class="app-header">
	<h1>Inbox</h1>
	<AppMenu />
</header>

<!-- TODO: add proper UI + CRUD -->

<pre>{JSON.stringify(data.notifications, null, 4)}</pre>
