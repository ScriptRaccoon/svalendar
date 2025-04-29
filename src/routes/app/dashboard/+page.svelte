<script lang="ts">
	import { PERMISSION_ICONS } from '$lib/config.js'
	import Fa from 'svelte-fa'

	let { form, data } = $props()
</script>

<h2>Dashboard</h2>

<p>Hey, {data.user?.name}!</p>

<section class="section">
	<h3>List of Calendars</h3>
	<ul class="no-bullets">
		{#each data.calendars as calendar}
			<li>
				<span class="icon-wrapper">
					<Fa icon={PERMISSION_ICONS[calendar.permission_level]} />
				</span>
				<a href="/app/calendar/{calendar.id}">
					{calendar.name}
				</a>
			</li>
		{/each}
	</ul>
</section>

<section class="section">
	<h3>Create Calendar</h3>
	<form action="?/create_calendar" method="POST">
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

<style>
	.icon-wrapper {
		display: inline-block;
		width: 1.25rem;
	}
</style>
