<script lang="ts">
	import { enhance } from '$app/forms'
	import IconButton from '$lib/components/IconButton.svelte'
	import { PERMISSION_ICONS } from '$lib/config'
	import { faCheckCircle } from '@fortawesome/free-regular-svg-icons'
	import { faXmark } from '@fortawesome/free-solid-svg-icons'
	import Fa from 'svelte-fa'

	let { form, data } = $props()
</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>

<h2>Dashboard</h2>

<p>Hey, {data.name}!</p>

{#if data.pending_shares.length}
	<section class="card">
		<h3>Pending Share Offers</h3>
		<ul class="list no-bullets">
			{#each data.pending_shares as calendar}
				<li>
					<div class="share">
						<div>
							<span class="icon-wrapper">
								<Fa icon={PERMISSION_ICONS[calendar.permission_level]} />
							</span>
							<span>{calendar.name}</span>
						</div>

						<menu>
							<form action="?/reject_share" method="POST" use:enhance>
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
							<form action="?/accept_share" method="POST" use:enhance>
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
		{#if form?.action === 'share' && form?.error}
			<p class="error">{form.error}</p>
		{/if}
	</section>
{/if}

<section class="card">
	<h3>Calendars</h3>
	<ul class="list no-bullets">
		{#each data.calendars as calendar}
			<li>
				<div class="item">
					<div>
						<span class="icon-wrapper">
							<Fa icon={PERMISSION_ICONS[calendar.permission_level]} />
						</span>
						<a href="/app/calendar/{calendar.id}">
							{calendar.name}
						</a>
						{#if data.default_calendar_id === calendar.id}
							<span class="secondary">(default)</span>
						{/if}
					</div>
					{#if calendar.revokable}
						<form action="?/revoke_access" method="POST" use:enhance>
							<input type="hidden" name="calendar_id" value={calendar.id} />
							<IconButton
								small={true}
								aria_label="revoke access"
								icon={faXmark}
							/>
						</form>
					{/if}
				</div>
			</li>
		{/each}
	</ul>
	{#if form?.action === 'revoke' && form?.error}
		<p class="error">{form.error}</p>
	{/if}
</section>

<section class="card">
	<h3>Create Calendar</h3>
	<form action="?/create_calendar" method="POST" use:enhance>
		<div class="input-group">
			<label for="name">Name</label>
			<input type="text" id="name" name="name" required />
		</div>

		<button class="button">Create</button>
	</form>

	{#if form?.action === 'create' && form?.error}
		<p class="error">{form.error}</p>
	{/if}
</section>

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

	.item {
		display: flex;
		justify-content: space-between;
	}
</style>
