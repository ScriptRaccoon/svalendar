<script lang="ts">
	let { form } = $props()
</script>

<h1>Login</h1>

<form method="POST">
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
