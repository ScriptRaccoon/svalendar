<script lang="ts">
	import { page } from '$app/state'
</script>

<header>
	<h1>Svalendar</h1>
	<nav>
		<ul>
			<li>
				<a href="/"> Home </a>
			</li>
			{#if !page.data.user}
				<li>
					<a href="/register"> Register </a>
				</li>
				<li>
					<a href="/login"> Login </a>
				</li>
			{:else}
				<li>
					<a href="/app/dashboard">Dashboard</a>
				</li>
				<li>
					<a href="/account">Account</a>
				</li>
				<li>
					<a href="/logout" data-sveltekit-preload-data="off">Logout</a>
				</li>
			{/if}
		</ul>
	</nav>
</header>

<style>
	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-block: 1rem 1.5rem;
	}

	h1 {
		font-size: 1.5rem;
		font-weight: 400;
		line-height: initial;
		color: var(--title-color);
		letter-spacing: 1px;
	}

	ul {
		display: flex;
		list-style: none;
		gap: 1rem;
	}
</style>
