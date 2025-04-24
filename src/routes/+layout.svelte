<script lang="ts">
	let { data, children } = $props();
</script>

<nav>
	<ul>
		{#if !data.user}
			<li><a href="/">Home</a></li>
			<li><a href="/register">Register</a></li>
			<li><a href="/login">Login</a></li>
		{:else}
			<li><a href="/app/dashboard">Dashboard</a></li>
			<li><a href="/logout" data-sveltekit-preload-data="off">Logout</a></li>
		{/if}
	</ul>
</nav>

{@render children?.()}

<style>
	ul {
		display: flex;
		list-style: none;
		gap: 0.5rem;
	}
</style>
