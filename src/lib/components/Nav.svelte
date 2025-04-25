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

<style>
	nav {
		padding-block: 0.5rem 1rem;
	}
	ul {
		display: flex;
		list-style: none;
		gap: 1rem;
	}
</style>
