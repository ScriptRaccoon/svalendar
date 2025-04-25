<script lang="ts">
	import { page } from '$app/state'
	import {
		faCog,
		faHome,
		faList,
		faSignIn,
		faSignOut,
		faUserPlus
	} from '@fortawesome/free-solid-svg-icons'
	import Fa from 'svelte-fa'
</script>

<header>
	<h1>Svalendar</h1>
	<nav>
		<ul>
			{#if !page.data.user}
				<li>
					<Fa icon={faHome} />
					<a href="/"> Home </a>
				</li>
				<li>
					<Fa icon={faUserPlus} />
					<a href="/register"> Register </a>
				</li>
				<li>
					<Fa icon={faSignIn} />
					<a href="/login"> Login </a>
				</li>
			{:else}
				<li>
					<Fa icon={faList} />
					<a href="/app/dashboard">Dashboard</a>
				</li>
				<li>
					<Fa icon={faCog} />
					<a href="/account">Account</a>
				</li>
				<li>
					<Fa icon={faSignOut} />
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
		padding-block: 1rem;
	}

	h1 {
		font-size: 1.5rem;
		font-weight: 400;
		line-height: initial;
		color: var(--primary-color);
		letter-spacing: 1px;
	}

	ul {
		display: flex;
		list-style: none;
		gap: 1rem;
	}
</style>
