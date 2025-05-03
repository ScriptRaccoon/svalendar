<script lang="ts">
	import { enhance } from '$app/forms'
	import { theme } from '$lib/states.svelte'

	let { data, form } = $props()

	let confirm_deletion = $state(false)

	function ask_for_confirmation() {
		confirm_deletion = true
	}

	function cancel_deletion() {
		confirm_deletion = false
	}
</script>

<svelte:head>
	<title>Account</title>
</svelte:head>

<h2>Account</h2>

<section class="card">
	<h3>Account Details</h3>

	<form method="POST" action="?/name" use:enhance>
		<div class="input-group">
			<label for="name">Name</label>
			<input type="text" id="name" name="name" required value={data.name} />
		</div>

		<button class="button" type="submit">Update Name</button>
	</form>

	{#if form?.error && form.action === 'name'}
		<p class="error">{form.error}</p>
	{/if}

	{#if form?.success && form.action === 'name'}
		<p>Name updated successfully.</p>
	{/if}

	<form class="password-form" method="POST" action="?/password" use:enhance>
		<div class="input-group">
			<label for="password">Password</label>
			<input
				type="password"
				name="password"
				id="password"
				required
				autocomplete="off"
			/>
		</div>

		<div class="input-group">
			<label for="confirm_password">Confirm Password</label>
			<input
				type="password"
				name="confirm_password"
				id="confirm_password"
				required
				autocomplete="off"
			/>
		</div>
		<button class="button" type="submit">Update Password</button>
	</form>

	{#if form?.error && form.action === 'password'}
		<p class="error">{form.error}</p>
	{/if}

	{#if form?.success && form.action === 'password'}
		<p>Password updated successfully.</p>
	{/if}
</section>

<section class="card">
	<h3>Appearance</h3>
	<button class="button" onclick={theme.toggle}>Toggle Theme</button>
</section>

<section class="card">
	<h3>My Data</h3>
	<p>
		To download your data in JSON format, follow
		<a href="/app/account/mydata">this link</a>.
	</p>
</section>

<section class="card">
	<h3>Danger Zone</h3>

	<form method="POST" action="?/delete" use:enhance>
		<div>
			{#if confirm_deletion}
				<button class="button danger" type="submit">Delete Account</button>
				<button class="button" type="button" onclick={cancel_deletion}
					>Cancel</button
				>
			{:else}
				<button class="button danger" type="button" onclick={ask_for_confirmation}
					>Delete Account</button
				>
			{/if}
		</div>

		{#if confirm_deletion}
			<p>This action cannot be undone! Are you sure? All data will be lost.</p>
		{/if}
	</form>

	{#if form?.error && form.action === 'delete'}
		<p class="error">{form.error}</p>
	{/if}
</section>

<style>
	.password-form {
		margin-top: 1.5rem;
	}
</style>
