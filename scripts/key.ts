/**
 * Log a random 32-byte key to be used for encryption.
 */

import crypto from 'node:crypto'

console.info(crypto.randomBytes(32).toString('hex'))
