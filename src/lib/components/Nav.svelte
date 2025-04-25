<script lang="ts">
	import { page } from '$app/state';
</script>

<nav>
	<ul>
		{#if !page.data.user}
			<li><a href="/">Home</a></li>
			<li><a href="/register">Register</a></li>
			<li><a href="/login">Login</a></li>
		{:else}
			<li><a href="/app/dashboard">Dashboard</a></li>
			<li><a href="/account">Account</a></li>
			<li><a href="/logout" data-sveltekit-preload-data="off">Logout</a></li>
		{/if}
	</ul>
</nav>

<style>
	nav {
		padding-block: 0.5rem 1rem;
	}
	ul {
		display: flex;
		list-style: none;
		gap: 0.5rem;
	}
</style>
