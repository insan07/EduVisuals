// In-memory Sliding Window Rate Limiter for LearnPik

interface RateLimitConfig {
  limit: number;       // Max requests
  windowMs: number;    // Time window in ms
}

interface RateLimitRecord {
  timestamps: number[];
}

const limiters = new Map<string, RateLimitRecord>();

export function checkRateLimit(
  ip: string,
  route: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const key = `${ip}:${route}`;
  const record = limiters.get(key) || { timestamps: [] };

  // Filter timestamps within the current window
  const windowStart = now - config.windowMs;
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

  const requestCount = record.timestamps.length;
  const allowed = requestCount < config.limit;

  if (allowed) {
    record.timestamps.push(now);
    limiters.set(key, record);
  }

  const remaining = Math.max(0, config.limit - record.timestamps.length);
  const oldestTimestamp = record.timestamps[0] || now;
  const resetTime = oldestTimestamp + config.windowMs;

  return {
    allowed,
    remaining,
    resetTime,
  };
}
