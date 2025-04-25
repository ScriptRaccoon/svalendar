<script lang="ts">
	let { form, data } = $props();
</script>

<h1>Dashboard</h1>

<p>Hey, {data.user?.name}!</p>

<section class="section">
	<h2>List of Calendars</h2>
	<ul class="no-bullets">
		{#each data.calendars as calendar}
			<li>
				<a href="/app/calendar/{calendar.id}">
					{calendar.name}
				</a>
			</li>
		{/each}
	</ul>
</section>

<section class="section">
	<h2>Create Calendar</h2>
	<form action="?/createcalendar" method="POST">
		<div class="input-group">
			<label for="name">Name</label>
			<input type="text" id="name" name="name" required />
		</div>

		<button class="button">Create</button>
	</form>
</section>

{#if form?.error}
	<p>{form.error}</p>
{/if}
