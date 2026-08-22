const buckets = new Map()

function getBucket(key) {
  if (!buckets.has(key)) buckets.set(key, [])
  return buckets.get(key)
}

function prune(bucket, windowMs) {
  const cutoff = Date.now() - windowMs
  while (bucket.length && bucket[0] < cutoff) bucket.shift()
}

export function rateLimit({ windowMs = 60 * 1000, max = 5, keyGenerator, message } = {}) {
  return (req, res, next) => {
    const key = keyGenerator ? keyGenerator(req) : `${req.ip}:${req.path}`
    const bucket = getBucket(key)
    prune(bucket, windowMs)
    if (bucket.length >= max) {
      const retryAfter = Math.ceil((bucket[0] + windowMs - Date.now()) / 1000)
      res.setHeader('Retry-After', String(Math.max(1, retryAfter)))
      return res.status(429).json({
        success: false,
        code: 'RATE_LIMITED',
        message: message || 'Too many requests. Please try again later.',
      })
    }
    bucket.push(Date.now())
    next()
  }
}

// Cleanup old buckets every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, bucket] of buckets.entries()) {
    prune(bucket, 60 * 1000)
    if (bucket.length === 0) buckets.delete(key)
    // also prune if all entries older than 1h
    if (bucket.length && bucket[0] < now - 60 * 60 * 1000) buckets.delete(key)
  }
}, 5 * 60 * 1000).unref?.()
