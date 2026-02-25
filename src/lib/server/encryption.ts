import crypto from 'node:crypto'
import { ENCRYPTION_KEY } from '$env/static/private'

const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest()

export function encrypt(plain_text: string): string {
	const iv = crypto.randomBytes(12)
	const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)

	const encrypted = Buffer.concat([cipher.update(plain_text, 'utf8'), cipher.final()])

	const tag = cipher.getAuthTag()

	return Buffer.concat([iv, tag, encrypted]).toString('base64')
}

export function decrypt(cipher_text: string): string {
	const data = Buffer.from(cipher_text, 'base64')

	const iv = data.subarray(0, 12)
	const tag = data.subarray(12, 28)
	const encrypted = data.subarray(28)

	const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
	decipher.setAuthTag(tag)

	const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])

	return decrypted.toString('utf8')
}
