import { Snowflake } from '@skorotkiewicz/snowflake-id'

const machine_id = 1

/**
 * {@link https://en.wikipedia.org/wiki/Snowflake_ID}
 */
export const snowflake = new Snowflake(machine_id)
