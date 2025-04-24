<script lang="ts">
	let { data } = $props();
</script>

<h1>Calendar Settings</h1>

<a href="/app/calendar/{data.calendar.id}">Back to the calendar</a>

<h2>Rename</h2>

<form method="POST" action="?/rename">
	<div>
		<label for="name">Name</label>
		<input type="text" id="name" name="name" required value={data.calendar.name} />
	</div>

	<button>Submit</button>
</form>

<h2>Delete</h2>

<form method="POST" action="?/delete">
	<button>Delete</button>
	<p>Warning: This cannot be undone!</p>
</form>

<h2>Backup</h2>

<!-- TODO -->
