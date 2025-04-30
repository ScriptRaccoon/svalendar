<script lang="ts">
	import IconButton from '$lib/components/IconButton.svelte'
	import { PERMISSION_ICONS } from '$lib/config.js'
	import { faCheckCircle } from '@fortawesome/free-regular-svg-icons'
	import { faXmark } from '@fortawesome/free-solid-svg-icons'
	import Fa from 'svelte-fa'

	let { form, data } = $props()
</script>

<h2>Dashboard</h2>

<p>Hey, {data.user?.name}!</p>

{#if data.pending_shares.length}
	<section class="section">
		<h3>Pending Share Offers</h3>
		<ul class="list">
			{#each data.pending_shares as calendar}
				<li>
					<div class="share">
						<span>{calendar.name}</span>
						<menu>
							<form action="?/reject_share" method="POST">
								<input
									type="hidden"
									name="calendar_id"
									value={calendar.id}
								/>
								<IconButton
									small={true}
									aria_label="reject share"
									icon={faXmark}
								/>
							</form>
							<form action="?/accept_share" method="POST">
								<input
									type="hidden"
									name="calendar_id"
									value={calendar.id}
								/>
								<IconButton
									small={true}
									aria_label="accept share"
									icon={faCheckCircle}
								/>
							</form>
						</menu>
					</div>
				</li>
			{/each}
		</ul>
	</section>
{/if}

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

	.share {
		display: flex;
		justify-content: space-between;

		menu {
			display: flex;
			gap: 0.5rem;
		}
	}
</style>
