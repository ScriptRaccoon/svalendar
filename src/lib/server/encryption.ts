import { ENCRYPTION_KEY } from '$env/static/private'
import { randomBytes, createCipheriv, createDecipheriv } from 'node:crypto'

const key = Buffer.from(ENCRYPTION_KEY, 'hex')

const algorithm = 'aes-256-gcm'

type EncryptedData = {
	data: string
	iv: string
	tag: string
}

export function encrypt(text: string): EncryptedData {
	const iv = randomBytes(12)
	const cipher = createCipheriv(algorithm, key, iv)
	const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
	const tag = cipher.getAuthTag()

	return {
		data: encrypted.toString('base64'),
		iv: iv.toString('base64'),
		tag: tag.toString('base64')
	}
}

export function decrypt({ data, iv, tag }: EncryptedData) {
	const decipher = createDecipheriv(algorithm, key, Buffer.from(iv, 'base64'))
	decipher.setAuthTag(Buffer.from(tag, 'base64'))
	const decrypted = Buffer.concat([
		decipher.update(Buffer.from(data, 'base64')),
		decipher.final()
	])
	return decrypted.toString('utf8')
}
