export function add_days(date: string | Date, days: number): string {
	const date_obj = new Date(date)
	date_obj.setDate(date_obj.getDate() + days)
	return date_obj.toLocaleDateString('en-CA')
}
