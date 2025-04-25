<script lang="ts">
	import { page } from '$app/state'

	let { form } = $props()

	let confirm_deletion = $state(false)

	function ask_for_confirmation() {
		confirm_deletion = true
	}

	function cancel_deletion() {
		confirm_deletion = false
	}
</script>

<h2>Account</h2>

<section class="section">
	<h3>Account Details</h3>

	<form method="POST" action="?/name" class="mb2">
		<div class="input-group">
			<label for="name">Name</label>
			<input
				type="text"
				id="name"
				name="name"
				required
				value={form?.name ?? page.data.user?.name}
			/>
		</div>

		<button class="button" type="submit">Update Name</button>
	</form>

	<form method="POST" action="?/password">
		<div class="input-group">
			<label for="password">Password</label>
			<input type="password" name="password" id="password" required />
		</div>

		<div class="input-group">
			<label for="confirm_password">Confirm Password</label>
			<input
				type="password"
				name="confirm_password"
				id="confirm_password"
				required
			/>
		</div>
		<button class="button" type="submit">Update Password</button>
	</form>
</section>

<section class="section">
	<h3>Danger Zone</h3>

	<form method="POST" action="?/delete">
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
</section>

{#if form?.error}
	<p class="error">{form.error}</p>
{/if}

{#if form?.message}
	<p>{form.message}</p>
{/if}
