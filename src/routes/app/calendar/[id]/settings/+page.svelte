<script lang="ts">
	import { enhance } from '$app/forms'
	import ColorPicker from '$lib/components/ColorPicker.svelte'
	import IconButton from '$lib/components/IconButton.svelte'
	import IconLink from '$lib/components/IconLink.svelte'
	import { faXmark } from '@fortawesome/free-solid-svg-icons'

	let { data, form } = $props()
	let calendar = $derived(data.calendar)
	let confirm_deletion = $state(false)

	function ask_for_confirmation() {
		confirm_deletion = true
	}

	function cancel_deletion() {
		confirm_deletion = false
	}
</script>

<svelte:head>
	<title>Calendar Settings</title>
</svelte:head>

<header>
	<h2>Calendar Settings</h2>
	<IconLink
		href={`/app/calendar/${calendar.id}`}
		aria_label="back to calendar"
		icon={faXmark}
	/>
</header>

<section class="card">
	<h3>Appearance</h3>

	<!-- don't work with use:enhance since it is buggy -->
	<form method="POST" action="?/edit">
		<div class="input-group">
			<label for="name">Name</label>
			<input type="text" id="name" name="name" required value={calendar.name} />
		</div>

		<ColorPicker
			label="Default Color"
			current_color={calendar.default_color}
			readonly={false}
		/>

		<button class="button">Update</button>
	</form>

	{#if form?.error && form.action === 'edit'}
		<p class="error">{form.error}</p>
	{/if}

	{#if form?.success && form.action === 'edit'}
		<p>Calendar updated successfully.</p>
	{/if}
</section>

<section class="card">
	<h3>Default Calendar</h3>
	<p>Set a calendar as default so that it is selected by default when you log in.</p>
	<form method="POST" action="?/set_default" use:enhance>
		<button class="button">Set Default</button>
	</form>

	{#if form?.error && form.action === 'set_default'}
		<p class="error">{form.error}</p>
	{/if}

	{#if form?.success && form.action === 'set_default'}
		<p>Calendar has been set as default.</p>
	{/if}
</section>

<section class="card">
	<h3>Sharing</h3>
	<p>Share your calendar with other users to collaborate.</p>
	<form action="?/share" method="POST" use:enhance>
		<div class="input-group">
			<label for="username">User name</label>
			<input type="text" id="username" name="username" required />
		</div>
		<div class="input-group">
			<label for="permission_level">Permission level</label>
			<select name="permission_level" id="permission_level">
				<option value="read">Read</option>
				<option value="write">Write</option>
				<option value="owner">Owner</option>
			</select>
		</div>
		<button class="button">Share</button>
	</form>

	{#if form?.error && form.action === 'share'}
		<p class="error">{form.error}</p>
	{/if}

	{#if data.shares.length > 0}
		<p>The calendar is shared with:</p>
		<ul class="list">
			{#each data.shares as share}
				<li>
					<div class="share">
						{share.user_name} ({share.permission_level} access)
						{#if !share.approved_at}
							&ndash; Pending
						{/if}
						<form action="?/unshare" method="POST" use:enhance>
							<input type="hidden" name="user_id" value={share.user_id} />
							<IconButton
								aria_label="remove share"
								icon={faXmark}
								small={true}
							/>
						</form>
					</div>
				</li>
			{/each}
		</ul>

		{#if form?.error && form.action === 'unshare'}
			<p class="error">{form.error}</p>
		{/if}
	{/if}
</section>

<section class="card">
	<h3>Danger Zone</h3>

	<form method="POST" action="?/delete" use:enhance>
		{#if confirm_deletion}
			<button type="submit" class="button danger">Delete</button>
			<button type="button" class="button" onclick={cancel_deletion}>Cancel</button>
		{:else}
			<button type="button" class="button danger" onclick={ask_for_confirmation}
				>Delete</button
			>
		{/if}
		{#if confirm_deletion}
			<p>
				Are you sure? All the data inside the calendar will be deleted
				permanently.
			</p>
		{/if}
	</form>

	{#if form?.error && form.action === 'delete'}
		<p class="error">{form.error}</p>
	{/if}
</section>

<style>
	header {
		display: flex;
		justify-content: space-between;
		align-items: start;
	}

	.share {
		display: flex;
		justify-content: space-between;
	}
</style>
