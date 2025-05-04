import { error, fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { query } from '$lib/server/db'
import { encrypt } from '$lib/server/encryption'
import sql from 'sql-template-tag'
import { get_validated_event } from '$lib/server/events'
import { snowflake } from '$lib/server/snowflake'

export const load: PageServerLoad = async (event) => {
	const user = event.locals.user
	if (!user) error(401, 'Unauthorized')

	const calendar_id = event.params.id

	const start_time = event.url.searchParams.get('start_time')
	const end_time = event.url.searchParams.get('end_time')
	const date = event.url.searchParams.get('date')
	const color = event.url.searchParams.get('color')

	return { calendar_id, start_time, end_time, date, color }
}

export const actions: Actions = {
	default: async (event) => {
		const user = event.locals.user
		if (!user) error(401, 'Unauthorized')

		const calendar_id = event.params.id

		const form_data = await event.request.formData()

		const { status, fields, error_message } = await get_validated_event(
			form_data,
			calendar_id
		)

		if (error_message) {
			return fail(status, { error: error_message, ...fields })
		}

		const encrypted_title_data = encrypt(fields.title)
		const encrypted_description_data = encrypt(fields.description)
		const encrypted_location_data = encrypt(fields.location)

		const event_id = await snowflake.generate()

		const insert_query = sql`
        INSERT INTO events
			(id, calendar_id,
			title_encrypted, title_iv, title_tag,
			description_encrypted, description_iv, description_tag,		
			location_encrypted, location_iv, location_tag,
			start_time, end_time, event_date, color)
        VALUES
            (${event_id}, ${calendar_id},
			${encrypted_title_data.data},
			${encrypted_title_data.iv},
			${encrypted_title_data.tag},
			${encrypted_description_data.data},
			${encrypted_description_data.iv},
			${encrypted_description_data.tag},
			${encrypted_location_data.data},
			${encrypted_location_data.iv},
			${encrypted_location_data.tag},
			${fields.start_time},
			${fields.end_time},
			${fields.date},
			${fields.color})`

		const { err } = await query(insert_query)
		if (err) return fail(500, { error: 'Database error.', ...fields })

		redirect(302, `/app/calendar/${calendar_id}/${fields.date}`)
	}
}
