<script lang="ts">
	import { enhance } from '$app/forms'

	let { form } = $props()
</script>

<svelte:head>
	<title>Login</title>
</svelte:head>

<h2>Login</h2>

<form method="POST" use:enhance>
	<div class="input-group">
		<label for="name">Name</label>
		<input type="text" id="name" name="name" required value={form?.name} />
	</div>

	<div class="input-group">
		<label for="password">Password</label>
		<input type="password" id="password" name="password" required />
	</div>

	<button class="button">Submit</button>
</form>

{#if form?.error}
	<p class="error">{form.error}</p>
{/if}
