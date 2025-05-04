<script lang="ts">
	import { enhance } from '$app/forms'
	import { goto } from '$app/navigation'
	import { page } from '$app/state'
	import EventInput from '$lib/components/EventInput.svelte'
	import IconLink from '$lib/components/IconLink.svelte'
	import { PARTICIPATION_ICONS } from '$lib/config.js'
	import { faXmark } from '@fortawesome/free-solid-svg-icons'
	import Fa from 'svelte-fa'

	let { data, form } = $props()
	let event = $derived(data.event)
	let my_role = $derived(data.my_role)

	let title = $derived(my_role === 'organizer' ? 'Edit Event' : 'Event Details')
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<header class="app-header">
	<h1>{title}</h1>
	<menu class="menu">
		<IconLink
			href={`/app/calendar/${data.calendar_id}/${event.event_date}`}
			aria_label="back to calendar"
			icon={faXmark}
		/>
	</menu>
</header>

<form method="POST" action="?/update" use:enhance>
	<EventInput
		title={form?.title ?? event.title}
		description={form?.description ?? event.description}
		start_time={form?.start_time ?? event.start_time}
		end_time={form?.end_time ?? event.end_time}
		date={form?.date ?? event.event_date}
		location={form?.location ?? event.location}
		color={form?.color ?? event.color}
		readonly={my_role === 'attendee'}
	/>

	{#if my_role === 'organizer'}
		<menu>
			<button class="button danger" type="submit" formaction="?/delete">
				Delete Event
			</button>
			<button
				class="button"
				type="button"
				onclick={() =>
					goto(`/app/calendar/${data.calendar_id}/${event.event_date}`)}
			>
				Cancel
			</button>
			<button class="button" type="submit">Save</button>
		</menu>
	{:else}
		<menu>
			<button class="button danger" type="submit" formaction="?/remove">
				Remove from Calendar
			</button>
		</menu>
	{/if}
</form>

{#if form?.error}
	<p class="error">{form.error}</p>
{/if}

<!-- TOOD: improve styling  -->

<p></p>

<h2>Participants</h2>

<form method="POST" action="?/accept_event" use:enhance>
	<ul class="list no-bullets">
		{#each data.participants as participant (participant.id)}
			<li>
				<div class="participant_item">
					<div>
						<Fa icon={PARTICIPATION_ICONS[participant.status]} />
						&nbsp;
						{participant.name} ({participant.role})
					</div>
					<div>
						{#if participant.id === page.data.user?.id}
							<button
								class="button"
								formaction="?/decline_event"
								disabled={participant.status === 'declined'}
							>
								Decline
							</button>
							<button
								class="button"
								disabled={participant.status === 'accepted'}
							>
								Accept
							</button>
						{/if}
					</div>
				</div>
			</li>
		{/each}
	</ul>
</form>

{#if my_role == 'organizer'}
	<form method="POST" action="?/add_participant" use:enhance>
		<div class="input-group">
			<label for="participant_name">Participant</label>
			<input type="text" id="participant_name" name="participant_name" required />
		</div>

		<button class="button">Add</button>
	</form>
{/if}

<style>
	menu {
		display: flex;
		justify-content: space-between;
		gap: 1rem;

		.button.danger {
			margin-right: auto;
		}
	}

	.participant_item {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
</style>
