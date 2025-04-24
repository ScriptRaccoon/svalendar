import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	return { name: event.locals.name };
};
