<script lang="ts">
	import { faList, faSignOut } from '@fortawesome/free-solid-svg-icons'
	import IconLink from './IconLink.svelte'
	import { faUser } from '@fortawesome/free-regular-svg-icons'
</script>

<menu class="menu">
	<IconLink href="/app/dashboard" icon={faList} aria_label="Dashboard" />
	<IconLink href="/app/account" icon={faUser} aria_label="Account" />
	<IconLink href="/app/logout" icon={faSignOut} aria_label="Logout" preload="off" />
</menu>
