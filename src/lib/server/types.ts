export type UserLocals = {
	id: number;
	name: string;
};

export type Calendar = { id: number; name: string };

export type CalendarEvent = {
	id: number;
	title: string;
	description: string;
	start_time: string;
	end_time: string;
	location: string;
	color: string;
};
