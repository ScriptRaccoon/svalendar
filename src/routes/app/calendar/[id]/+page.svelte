<script lang="ts">
	let { data } = $props();
	let calendar = $derived(data.calendar);
</script>

<h1>Calendar {calendar.name}</h1>

<a href="/app/calendar/{calendar.id}/settings">Settings</a>
