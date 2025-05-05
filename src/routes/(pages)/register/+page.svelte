<script lang="ts">
	import { enhance } from '$app/forms'

	let { form } = $props()
</script>

<svelte:head>
	<title>Register</title>
</svelte:head>

<h2 class="large">Register</h2>

<p class="secondary">
	Please choose a username and secure password to create an account. If you already have
	an account, you can
	<a href="/login">login</a> instead.
</p>

<form method="POST" use:enhance>
	<div class="input-group">
		<label for="name">Username</label>
		<input type="text" id="name" name="name" required value={form?.name} />
	</div>

	<div class="input-group">
		<label for="password">Password</label>
		<input
			type="password"
			id="password"
			name="password"
			required
			autocomplete="off"
		/>
	</div>

	<div class="input-group">
		<label for="confirm_password">Confirm Password</label>
		<input
			type="password"
			id="confirm_password"
			name="confirm_password"
			required
			autocomplete="off"
		/>
	</div>

	<button class="button">Submit</button>
</form>

{#if form?.error}
	<div class="error">{form.error}</div>
{/if}

{#if form?.success}
	<div class="message">
		Your account has been created. You can now <a href="/login">login</a>.
	</div>
{/if}
