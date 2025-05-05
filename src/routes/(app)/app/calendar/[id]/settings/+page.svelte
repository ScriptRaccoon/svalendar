<script lang="ts">
	import { enhance } from '$app/forms'
	import ColorPicker from '$lib/components/ColorPicker.svelte'
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

<header class="app-header">
	<h1>Calendar Settings</h1>
	<menu class="menu">
		<IconLink
			href={`/app/calendar/${calendar.id}`}
			aria_label="back to calendar"
			icon={faXmark}
		/>
	</menu>
</header>

<section class="card">
	<h2>Appearance</h2>

	<!-- don't work with use:enhance since it is buggy -->
	<form method="POST" action="?/edit">
		<div class="input-group">
			<label for="name">Name</label>
			<input type="text" id="name" name="name" required value={calendar.name} />
		</div>

		<div class="input-group">
			<label for="default_start_hour">Default Start Hour*</label>
			<input
				type="number"
				name="default_start_hour"
				id="default_start_hour"
				required
				value={calendar.default_start_hour}
			/>
		</div>

		<p>
			*The default start hour determines the default hour at which a new event
			starts unless otherwise specified. Also, the calendar will be scrolled to this
			hour when opened.
		</p>

		<ColorPicker
			label="Default Color"
			current_color={calendar.default_color}
			readonly={false}
		/>

		<button class="button">Update</button>
	</form>

	{#if form?.error && form.action === 'edit'}
		<div class="error">{form.error}</div>
	{/if}

	{#if form?.success && form.action === 'edit'}
		<div class="message">Calendar updated successfully.</div>
	{/if}
</section>

{#if calendar.is_default_calendar}
	<section class="card">
		<h2>Default Calendar</h2>
		<p>
			This is your default calendar. This means that it cannot be deleted, that it
			is opened by default after login, and that all events shared with your account
			will be added to this calendar.
		</p>
	</section>
{/if}

{#if !calendar.is_default_calendar}
	<section class="card">
		<h2>Danger Zone</h2>

		<form method="POST" action="?/delete" use:enhance>
			{#if confirm_deletion}
				<button type="submit" class="button danger">Delete</button>
				<button type="button" class="button" onclick={cancel_deletion}
					>Cancel</button
				>
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
			<div class="error">{form.error}</div>
		{/if}
	</section>
{/if}
