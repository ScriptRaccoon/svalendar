<script lang="ts">
	import { enhance } from '$app/forms'
	import { goto } from '$app/navigation'
	import { page } from '$app/state'
	import EventInput from '$lib/components/EventInput.svelte'
	import IconLink from '$lib/components/IconLink.svelte'
	import { faCheckCircle, faQuestionCircle } from '@fortawesome/free-regular-svg-icons'
	import { faBan } from '@fortawesome/free-solid-svg-icons'
	import { faXmark } from '@fortawesome/free-solid-svg-icons'
	import Fa from 'svelte-fa'

	let { data, form } = $props()
	let event = $derived(data.event)
	let my_role = $derived(data.my_role)

	let title = $derived(my_role === 'organizer' ? 'Edit Event' : 'Event Details')

	const PARTICIPATION_ICONS = {
		pending: faQuestionCircle,
		accepted: faCheckCircle,
		declined: faBan
	} as const
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<header class="app-header">
	<h1>{title}</h1>
	<menu class="menu">
		<IconLink
			href={`/calendar/${data.calendar_id}/${event.event_date}`}
			aria_label="back to calendar"
			icon={faXmark}
		/>
	</menu>
</header>

<form method="POST" use:enhance>
	<EventInput
		title={event.title}
		description={event.description}
		start_time={event.start_time}
		end_time={event.end_time}
		date={event.event_date}
		location={event.location}
		color={event.color}
		link={event.link}
		readonly={my_role === 'attendee'}
		colors={data.colors}
	/>

	<menu class="update-menu">
		{#if my_role === 'organizer'}
			<button class="button" formaction="?/update">Save</button>
			<button class="button" formaction="?/save_template">
				Save as Template
			</button>
			<button
				class="button"
				type="button"
				onclick={() => goto(`/calendar/${data.calendar_id}/${event.event_date}`)}
			>
				Cancel
			</button>
		{:else}
			<button class="button danger" formaction="?/remove">
				Remove from Calendar
			</button>
		{/if}
	</menu>

	{#if form?.action === 'update' && form.error}
		<div class="error">{form.error}</div>
	{/if}
</form>

<section>
	<h2>Participants</h2>

	<form method="POST" action="?/accept_event" use:enhance>
		<input type="hidden" name="event_title" value={event.title} />

		<ul class="list no-bullets">
			{#each data.participants as participant (participant.id)}
				<li>
					<div class="participant_item">
						<div>
							<span class="icon {participant.status}">
								<Fa icon={PARTICIPATION_ICONS[participant.status]} />
							</span>
							&nbsp;
							<span class="participant_name {participant.status}">
								{participant.name} ({participant.role})
							</span>
						</div>
						<div class="participant_actions">
							{#if participant.id === page.data.user?.id}
								<button
									class="button small"
									formaction="?/decline_event"
									disabled={participant.status === 'declined'}
								>
									Decline
								</button>
								<button
									class="button small"
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
		{#if form?.action === 'respond' && form.error}
			<p class="error">{form.error}</p>
		{/if}
	</form>

	{#if my_role == 'organizer'}
		<form method="POST" action="?/add_participant" use:enhance>
			<input type="hidden" name="event_title" value={event.title} />

			<div class="input-group">
				<label for="participant_name">Participant</label>
				<div class="input-with-button">
					<input
						type="text"
						id="participant_name"
						name="participant_name"
						required
					/>
					<button class="button">Add</button>
				</div>
			</div>

			{#if form?.action === 'add_participant' && form.error}
				<div class="error">{form.error}</div>
			{/if}
		</form>
	{/if}
</section>

{#if my_role === 'organizer'}
	<section aria-label="delete event">
		<form action="?/delete" method="POST" use:enhance>
			<input type="hidden" name="date" value={event.event_date} />
			<button class="button danger delete_btn">Delete Event</button>
			{#if form?.action === 'delete' && form.error}
				<p class="error">{form.error}</p>
			{/if}
		</form>
	</section>
{/if}

<style>
	.update-menu {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	section {
		margin-top: 2.5rem;
	}

	.participant_item {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.participant_item .icon {
		&.accepted {
			color: var(--title-color);
		}
		&.declined {
			color: var(--error-color);
		}
	}

	.participant_name {
		&.declined {
			text-decoration: line-through;
			color: var(--secondary-font-color);
		}
	}

	.participant_actions {
		display: flex;
		gap: 0.25rem;
	}

	.delete_btn {
		width: 100%;
	}

	@media (min-width: 600px) {
		.update-menu {
			flex-direction: row;
		}

		.delete_btn {
			width: auto;
		}
	}
</style>
