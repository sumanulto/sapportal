import { RateLimiterMemory } from "rate-limiter-flexible"

const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req: any) => req.ip || "anonymous",
  points: 5, // Number of requests
  duration: 60, // Per 60 seconds
})

const strictRateLimiter = new RateLimiterMemory({
  keyGenerator: (req: any) => req.ip || "anonymous",
  points: 3, // Number of requests
  duration: 300, // Per 5 minutes
})

export async function applyRateLimit(req: any, strict = false) {
  try {
    const limiter = strict ? strictRateLimiter : rateLimiter
    await limiter.consume(req.ip || "anonymous")
    return true
  } catch (rejRes) {
    return false
  }
}
