import { error, fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { batch, query } from '$lib/server/db'
import { decrypt, encrypt } from '$lib/server/encryption'
import sql from 'sql-template-tag'
import { decrypt_event_template, get_validated_event } from '$lib/server/events'
import { generate_id } from '$lib/server/snowflake'
import type { CalendarTemplateEncrypted, CalendarTemplate } from '$lib/server/types'
import { EVENT_COLORS } from '$lib/server/config'

export const load: PageServerLoad = async (event) => {
	const user = event.locals.user
	if (!user) error(401, 'Unauthorized')

	const calendar_id = event.params.id

	const template_id = event.url.searchParams.get('template')
	const date = event.url.searchParams.get('date')

	if (template_id) {
		const template_query = sql`
		SELECT
			id, title_encrypted, title_iv, title_tag,
			description_encrypted, description_iv, description_tag,		
			location_encrypted, location_iv, location_tag,
			start_time, end_time, color, link
		FROM templates
		WHERE id = ${template_id}
		AND user_id = ${user.id}
		`

		const { rows, err } = await query<CalendarTemplateEncrypted>(template_query)
		if (err) error(500, 'Database error.')
		if (!rows.length) error(404, 'Template not found')

		const template: CalendarTemplate = decrypt_event_template(rows[0])

		const used_query = sql`
		UPDATE templates
		SET used_count = used_count + 1
		WHERE id = ${template_id}
		AND user_id = ${user.id}
		`

		await query(used_query)

		return {
			calendar_id,
			templates: [],
			date,
			...template,
			colors: EVENT_COLORS
		}
	}

	const start_time = event.url.searchParams.get('start_time')
	const end_time = event.url.searchParams.get('end_time')
	const color = event.url.searchParams.get('color')

	const templates_query = sql`
	SELECT id, title_encrypted, title_iv, title_tag
	FROM templates
	WHERE user_id = ${user.id}
	ORDER BY used_count DESC
	`

	const { rows: encrypted_templates, err } = await query<{
		id: string
		title_encrypted: string
		title_iv: string
		title_tag: string
	}>(templates_query)

	if (err) error(500, 'Database error.')

	const templates = encrypted_templates.map((template) => ({
		id: template.id,
		title: decrypt({
			data: template.title_encrypted,
			iv: template.title_iv,
			tag: template.title_tag
		})
	}))

	return {
		calendar_id,
		start_time,
		end_time,
		date,
		color,
		templates,
		colors: EVENT_COLORS
	}
}

export const actions: Actions = {
	default: async (event) => {
		const user = event.locals.user
		if (!user) error(401, 'Unauthorized')

		const calendar_id = event.params.id

		const form = await event.request.formData()

		const { status, fields, error_message } = await get_validated_event(
			form,
			calendar_id
		)

		if (error_message) {
			return fail(status, { error: error_message, ...fields })
		}

		const encrypted_title = encrypt(fields.title)
		const encrypted_description = encrypt(fields.description)
		const encrypted_location = encrypt(fields.location)

		const event_id = await generate_id()

		const insert_query = sql`
        INSERT INTO events
			(id,
			title_encrypted, title_iv, title_tag,
			description_encrypted, description_iv, description_tag,		
			location_encrypted, location_iv, location_tag,
			start_time, end_time, event_date, color, link)
        VALUES
            (${event_id},
			${encrypted_title.data},
			${encrypted_title.iv},
			${encrypted_title.tag},
			${encrypted_description.data},
			${encrypted_description.iv},
			${encrypted_description.tag},
			${encrypted_location.data},
			${encrypted_location.iv},
			${encrypted_location.tag},
			${fields.start_time},
			${fields.end_time},
			${fields.date},
			${fields.color},
			${fields.link})`

		const visibility_query = sql`
		INSERT INTO event_visibilities (event_id, calendar_id)
		VALUES (${event_id}, ${calendar_id})`

		const participants_query = sql`
		INSERT INTO event_participants (event_id, user_id, role, status)
		VALUES (${event_id}, ${user.id}, 'organizer', 'accepted')`

		const { err } = await batch([insert_query, visibility_query, participants_query])

		if (err) {
			return fail(500, { error: 'Database error.', ...fields })
		}

		redirect(302, `/calendar/${calendar_id}/${fields.date}`)
	}
}
