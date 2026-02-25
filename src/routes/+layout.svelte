<script lang="ts">
	import './app.css'

	let { children } = $props()
</script>

<svelte:head>
	<link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
	<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
	<link rel="shortcut icon" href="/favicon.ico" />
	<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
	<meta name="apple-mobile-web-app-title" content="Svalendar" />
	<link rel="manifest" href="/site.webmanifest" />

	<meta property="og:title" content="Svalendar" />
	<meta
		property="og:description"
		content="Calendar application for managing events and schedules."
	/>
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://svalendar.netlify.app" />

	<link
		rel="preload"
		href="/fonts/OpenSans-VariableFont_wdth,wght.woff2"
		as="font"
		type="font/woff2"
		crossorigin="anonymous"
	/>
</svelte:head>

<div class="wrapper">
	{@render children()}
</div>
