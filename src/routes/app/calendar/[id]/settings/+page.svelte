<script lang="ts">
	let { data, form } = $props();
	let calendar = $derived(data.calendar);
</script>

<h1>Calendar Settings</h1>

<a href="/app/calendar/{calendar.id}">Back to the calendar</a>

{#if form?.error}
	<p>{form.error}</p>
{/if}

<h2>Rename</h2>

<form method="POST" action="?/rename">
	<div>
		<label for="name">Name</label>
		<input type="text" id="name" name="name" required value={calendar.name} />
	</div>

	<button>Submit</button>
</form>

<h2>Default</h2>

{#if calendar.is_default}
	<p>This is your default calendar.</p>
{:else}
	<p>Currently this is not your default calendar.</p>
	<form method="POST" action="?/setdefault">
		<button>Set as Default</button>
	</form>
{/if}

<h2>Delete</h2>

{#if calendar.is_default}
	<p>The default calendar cannot be deleted.</p>
{:else}
	<form method="POST" action="?/delete">
		<button>Delete</button>
		<p>Warning: This cannot be undone!</p>
	</form>
{/if}

<h2>Backup</h2>

<!-- TODO -->
