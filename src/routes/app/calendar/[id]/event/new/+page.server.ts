import { error, fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { query } from '$lib/server/db'
import { datetime_schema } from '$lib/server/schemas'
import { COLOR_IDS } from '$lib/config'
import { format } from 'date-fns'
import { decrypt, encrypt } from '$lib/server/encryption'
import type { EventTitleEncrypted } from '$lib/server/types'

export const load: PageServerLoad = async (event) => {
	const calendar_id = event.params.id
	const selected_date = event.url.searchParams.get('date')
	const start_time = selected_date ? `${selected_date}T09:00` : null
	const end_time = selected_date ? `${selected_date}T10:00` : null
	const color = event.url.searchParams.get('color')
	return { calendar_id, start_time, end_time, color }
}

export const actions: Actions = {
	default: async (event) => {
		const user = event.locals.user
		if (!user) error(401, 'Unauthorized')

		const calendar_id = event.params.id

		const form_data = await event.request.formData()
		const title = form_data.get('title') as string
		const description = form_data.get('description') as string
		const start_time = form_data.get('start_time') as string
		const end_time = form_data.get('end_time') as string
		const location = form_data.get('location') as string
		const color = form_data.get('color') as string | null

		const fields = {
			title,
			description,
			start_time,
			end_time,
			location,
			color
		}

		if (!title || !start_time || !end_time || !color) {
			return fail(400, { error: 'Fill in the required fields.', ...fields })
		}

		if (new Date(start_time) >= new Date(end_time)) {
			return fail(400, { error: 'End time must be after start time.', ...fields })
		}

		if (!COLOR_IDS.includes(color)) {
			return fail(400, { error: 'Invalid color.', ...fields })
		}

		if (!datetime_schema.safeParse(start_time).success) {
			return fail(400, { error: 'Invalid start time.', ...fields })
		}

		if (!datetime_schema.safeParse(end_time).success) {
			return fail(400, { error: 'Invalid end time.', ...fields })
		}

		const sql_overlap = `
		SELECT
			title_encrypted, title_iv, title_tag
		FROM
			events
		WHERE
			calendar_id = ?
			AND end_time > ?
			AND start_time < ?
		LIMIT 1
		`

		const args_overlap = [calendar_id, start_time, end_time]
		const { rows: overlap_rows, err: overlap_err } = await query<EventTitleEncrypted>(
			sql_overlap,
			args_overlap
		)

		if (overlap_err) return fail(500, { error: 'Database error.', ...fields })
		if (overlap_rows.length) {
			const overlap = overlap_rows[0]
			const title_overlap = decrypt({
				data: overlap.title_encrypted,
				iv: overlap.title_iv,
				tag: overlap.title_tag
			})

			return fail(400, {
				error: `Time overlaps with another event (${title_overlap}).`,
				...fields
			})
		}

		const encrypted_title_data = encrypt(title)
		const encrypted_description_data = encrypt(description)
		const encrypted_location_data = encrypt(location)

		const sql = `
        INSERT INTO
            events (calendar_id,
			title_encrypted, title_iv, title_tag,
			description_encrypted, description_iv, description_tag,		
			location_encrypted, location_iv, location_tag,
			start_time, end_time, color)
        VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING id
        `

		const args = [
			calendar_id,
			encrypted_title_data.data,
			encrypted_title_data.iv,
			encrypted_title_data.tag,
			encrypted_description_data.data,
			encrypted_description_data.iv,
			encrypted_description_data.tag,
			encrypted_location_data.data,
			encrypted_location_data.iv,
			encrypted_location_data.tag,
			start_time,
			end_time,
			color
		]

		const { err } = await query(sql, args)
		if (err) return fail(500, { error: 'Database error.', ...fields })

		const date = format(start_time, 'yyyy-MM-dd')
		redirect(302, `/app/calendar/${calendar_id}/${date}`)
	}
}
