<script lang="ts">
	import { enhance } from '$app/forms'
	import AppMenu from '$lib/components/AppMenu.svelte'
	import { faCalendar } from '@fortawesome/free-regular-svg-icons'
	import Fa from 'svelte-fa'

	let { form, data } = $props()
</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>

<header class="app-header">
	<h1>Dashboard</h1>
	<AppMenu />
</header>

<p>Hey, {data.name}!</p>

<section class="card">
	<h2>Calendars</h2>
	<ul class="list no-bullets">
		{#each data.calendars as calendar}
			<li>
				<div class="item">
					<div>
						<span class="icon-wrapper">
							<Fa icon={faCalendar} />
						</span>
						<a href="/app/calendar/{calendar.id}">
							{calendar.name}
						</a>
						{#if calendar.is_default_calendar}
							<span class="secondary">(default)</span>
						{/if}
					</div>
				</div>
			</li>
		{/each}
	</ul>
</section>

<section class="card">
	<h2>Create Calendar</h2>
	<form action="?/create_calendar" method="POST" use:enhance>
		<div class="input-group">
			<label for="name">Name</label>
			<input type="text" id="name" name="name" required />
		</div>

		<button class="button">Create</button>
	</form>

	{#if form?.action === 'create' && form?.error}
		<div class="error">{form.error}</div>
	{/if}
</section>

<style>
	.icon-wrapper {
		display: inline-block;
		width: 1.25rem;
	}

	.item {
		display: flex;
		justify-content: space-between;
	}
</style>
