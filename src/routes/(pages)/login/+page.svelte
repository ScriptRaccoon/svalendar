<script lang="ts">
	import { enhance } from '$app/forms'

	let { form } = $props()
</script>

<svelte:head>
	<title>Login</title>
</svelte:head>

<h2 class="large">Login</h2>

<p class="secondary">
	Please enter your credentials to log in. If you don't have an account yet,
	<a href="/register">register</a> first.
</p>

<form method="POST" use:enhance>
	<div class="input-group">
		<label for="username">Username</label>
		<input type="text" id="username" name="username" value={form?.username} />
	</div>

	<div class="input-group">
		<label for="password">Password</label>
		<input type="password" id="password" name="password" required autocomplete="on" />
	</div>

	<button class="button">Submit</button>
</form>

{#if form?.error}
	<div class="error">{form.error}</div>
{/if}
