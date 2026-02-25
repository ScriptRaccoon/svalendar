<script lang="ts">
	import { faExternalLink } from '@fortawesome/free-solid-svg-icons'
	import ColorPicker from './ColorPicker.svelte'
	import Fa from 'svelte-fa'
	import type { Color } from '$lib/server/types'

	type Props = {
		title: string
		description: string
		location: string
		start_time: string
		end_time: string
		date: string
		color: string
		link: string
		readonly: boolean
		colors: readonly Color[]
	}

	let {
		title,
		description,
		location,
		start_time,
		end_time,
		date,
		color: current_color,
		link,
		readonly,
		colors
	}: Props = $props()

	let link_state = $derived(link)
</script>

<div class="input-group">
	<label for="title">Title</label>
	<input type="text" id="title" name="title" value={title} required {readonly} />
</div>

<div class="input-group">
	<label for="description"
		>Description <span class="smaller">&nbsp;(optional)</span></label
	>
	<textarea id="description" name="description" {readonly}>{description}</textarea>
</div>

<div class="input-group">
	<label for="date">Date</label>
	<input type="date" id="date" name="date" value={date} {readonly} />
</div>

<div class="input-group">
	<label for="start_time">Start Time</label>
	<input
		type="time"
		id="start_time"
		name="start_time"
		value={start_time}
		{readonly}
		required
	/>
</div>

<div class="input-group">
	<label for="end_time">End Time</label>
	<input
		type="time"
		id="end_time"
		name="end_time"
		value={end_time}
		{readonly}
		required
	/>
</div>

<div class="input-group">
	<label for="location">Location <span class="smaller">&nbsp;(optional)</span></label>
	<input type="text" id="location" name="location" value={location} {readonly} />
</div>

<ColorPicker {colors} label="Color" {current_color} {readonly} />

<div class="input-group">
	{#if !readonly}
		<label for="link">Link <span class="smaller">&nbsp;(optional)</span></label>
		<input type="url" id="link" name="link" {readonly} bind:value={link_state} />
	{/if}
	{#if link_state}
		<div class="link-preview">
			<a href={link_state} target="_blank" class="highlight">
				{link_state}
				<Fa icon={faExternalLink} scale={0.75} />
			</a>
		</div>
	{/if}
</div>

<style>
	.link-preview {
		padding-block: 0.5rem;
	}
</style>
