<script lang="ts">
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

<header>
	<h1>Settings</h1>
	<IconLink
		href="/app/calendar/{calendar.id}"
		aria_label="back to calendar"
		icon={faXmark}
	/>
</header>

<section class="section">
	<h2>Rename</h2>

	<form method="POST" action="?/rename">
		<div class="input-group">
			<label for="name">Name</label>
			<input type="text" id="name" name="name" required value={calendar.name} />
		</div>

		<button class="button">Rename</button>
	</form>
</section>

<section class="section">
	<h2>Default</h2>

	{#if calendar.is_default}
		<p>
			This is your default calendar. This means it will be shown by default after
			login. The default calendar also cannot be deleted.
		</p>
	{:else}
		<p>
			Currently this is not your default calendar. This means it will not be shown
			by default after login, but it is available in the dashbard.
		</p>

		<form method="POST" action="?/setdefault">
			<button class="button">Set as Default</button>
		</form>
	{/if}
</section>

{#if !calendar.is_default}
	<section class="section">
		<h2>Danger Zone</h2>

		<form method="POST" action="?/delete">
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
	</section>
{/if}

{#if form?.error}
	<p>{form.error}</p>
{/if}

<style>
	header {
		display: flex;
		justify-content: space-between;
		align-items: start;
	}
</style>
