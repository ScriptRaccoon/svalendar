<script lang="ts">
	let { form } = $props();
</script>

<h1>Register</h1>

<form method="POST">
	<div>
		<label for="name">Name</label>
		<input type="text" id="name" name="name" required value={form?.name} />
	</div>

	<div>
		<label for="password">Password</label>
		<input type="password" id="password" name="password" required />
	</div>

	<div>
		<label for="confirm_password">Confirm Password</label>
		<input type="password" id="confirm_password" name="confirm_password" required />
	</div>

	<button>Submit</button>
</form>

{#if form?.error}
	<p>{form.error}</p>
{/if}

{#if form?.success}
	<p>User has been created. You can now <a href="/login">login</a>.</p>
{/if}
