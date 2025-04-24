<script lang="ts">
	let { form, data } = $props();
</script>

<h1>Dashboard</h1>

<p>Hey, {data.user?.name}!</p>

{#if data.calendars.length > 0}
	<h2>List of Calendars</h2>
	<ul>
		{#each data.calendars as calendar}
			<li>
				<a href="/app/calendar/{calendar.id}">
					{calendar.name}
				</a>
			</li>
		{/each}
	</ul>
{/if}

<h2>Create New Calendar</h2>
<form action="?/createcalendar" method="POST">
	<div>
		<label for="name">Name</label>
		<input type="text" id="name" name="name" required />
	</div>

	<button>Create Calendar</button>
</form>

{#if form?.error}
	<p>{form.error}</p>
{/if}
