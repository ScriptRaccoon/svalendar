type RateLimiterEntry = {
	attempts: number
	last_attempt: number // timestamp in ms
}

export class RateLimiter {
	private limiter: Map<string, RateLimiterEntry>

	constructor(
		private max_attempts: number,
		private window_ms: number
	) {
		this.limiter = new Map<string, RateLimiterEntry>()
	}

	is_rate_limited(ip: string): boolean {
		const now = Date.now()
		const entry = this.limiter.get(ip)

		if (!entry) {
			this.limiter.set(ip, { attempts: 1, last_attempt: now })
			return false
		}

		if (now - entry.last_attempt > this.window_ms) {
			this.limiter.set(ip, { attempts: 1, last_attempt: now })
			return false
		}

		entry.attempts += 1
		entry.last_attempt = now

		if (entry.attempts > this.max_attempts) return true

		this.limiter.set(ip, entry)
		return false
	}

	clear(ip: string): void {
		this.limiter.delete(ip)
	}
}
