<script lang="ts">
	let { form } = $props();
</script>

<h1>Login</h1>

<form method="POST">
	<div>
		<label for="name">Name</label>
		<input type="text" id="name" name="name" required value={form?.name} />
	</div>

	<div>
		<label for="password">Password</label>
		<input type="password" id="password" name="password" required />
	</div>

	<button>Submit</button>
</form>

{#if form?.error}
	<p>{form.error}</p>
{/if}
