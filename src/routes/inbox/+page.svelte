<script lang="ts">
	import { enhance } from '$app/forms'
	import AppMenu from '$lib/components/AppMenu.svelte'

	let { data, form } = $props()

	let unread_count = $derived(
		data.notifications.filter((n) => n.status === 'unread').length
	)
</script>

<svelte:head>
	<title>Inbox</title>
</svelte:head>

<header class="app-header">
	<h1>Inbox</h1>
	<AppMenu />
</header>

{#if data.show_archived}
	<a href="/inbox">Unarchived notifications</a>
{:else}
	<a href="/inbox?filter=archived">Archived notifications</a>
{/if}

<!-- TODO: add proper UI + CRUD -->

{#if unread_count > 0}
	<p>You have {unread_count} unread notifications.</p>
{/if}

{#if data.notifications.length > 0}
	{#each data.notifications as notification (notification.id)}
		<div class="box">
			<form method="POST" use:enhance>
				<input type="hidden" name="id" value={notification.id} />
				<pre>{JSON.stringify(notification, null, 4)}</pre>
				<br />
				{#if data.show_archived}
					<button class="button" formaction="?/unarchive">Unarchive</button>
				{:else}
					<button class="button" formaction="?/archive">Archive</button>
				{/if}
			</form>
		</div>
	{/each}
{:else}
	<p>No notifications.</p>
{/if}

{#if form?.error}
	<div class="error">{form.error}</div>
{/if}

<style>
	/* TEMPORARY */
	.box {
		padding-block: 1rem;
		border-bottom: 1px solid var(--helping-line-color);
	}
</style>
