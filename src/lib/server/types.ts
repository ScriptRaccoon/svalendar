export type UserLocals = {
	id: number;
	name: string;
};

export type CalendarBasic = { id: number; name: string };

export type Calendar = CalendarBasic & { is_default: number };

export type CalendarEvent = {
	id: number;
	title: string;
	description: string;
	start_time: string;
	end_time: string;
	location: string;
	color: string;
};
