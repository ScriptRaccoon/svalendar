<script lang="ts">
	import { enhance } from '$app/forms'
	import { goto } from '$app/navigation'
	import EventInput from '$lib/components/EventInput.svelte'
	import IconLink from '$lib/components/IconLink.svelte'
	import { faXmark } from '@fortawesome/free-solid-svg-icons'

	let { form, data } = $props()

	let back_url = $derived(
		data.date
			? `/calendar/${data.calendar_id}/${data.date}`
			: `/calendar/${data.calendar_id}`
	)
</script>

<svelte:head>
	<title>New Event</title>
</svelte:head>

<header class="app-header">
	<h1>New Event</h1>
	<menu class="menu">
		<IconLink href={back_url} aria_label="back to calendar" icon={faXmark} />
	</menu>
</header>

{#if data.templates.length}
	<details class="templates-details">
		<summary>Use template</summary>
		<ul class="list">
			{#each data.templates as template}
				<li>
					<a
						href={`/calendar/${data.calendar_id}/event/new?template=${template.id}&date=${data.date}`}
						class="template"
					>
						{template.title}
					</a>
				</li>
			{/each}
		</ul>
	</details>
{/if}

<form method="POST" use:enhance>
	<EventInput
		title={form?.title ?? data.title ?? ''}
		description={form?.description ?? data.description ?? ''}
		start_time={form?.start_time ?? data.start_time ?? ''}
		end_time={form?.end_time ?? data.end_time ?? ''}
		date={form?.date ?? data.date ?? ''}
		location={form?.location ?? data.location ?? ''}
		color={form?.color ?? data.color ?? ''}
		link={form?.link ?? data.link ?? ''}
		readonly={false}
		colors={data.colors}
	/>

	<menu>
		<button class="button" type="button" onclick={() => goto(back_url)}>
			Cancel
		</button>
		<button class="button" type="submit">Create Event</button>
	</menu>
</form>

{#if form?.error}
	<div class="error">{form.error}</div>
{/if}

<style>
	menu {
		display: flex;
		justify-content: space-between;
	}

	.templates-details {
		margin-bottom: 1rem;
	}
</style>
