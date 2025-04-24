<script lang="ts">
	let { form, data } = $props();
</script>

<h1>Dashboard</h1>

<p>Hey, {data.user?.name}!</p>

<h2>Create New Calendar</h2>
<form action="?/createcalendar" method="POST">
	<div>
		<label for="name">Name</label>
		<input type="text" id="name" name="name" required />
	</div>

	<div>
		<label for="color">Color</label>
		<input type="color" id="color" name="color" required />
	</div>

	<button>Create Calendar</button>
</form>

{#if form?.error}
	<p>{form.error}</p>
{/if}
