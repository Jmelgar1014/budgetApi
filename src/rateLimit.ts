import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let rateLimitInstance: Ratelimit;

export const rateLimit = (): Ratelimit => {
  if (!rateLimitInstance) {
    rateLimitInstance = new Ratelimit({
      // Add the assignment here
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, "60 s"),
      prefix: "@upstash/rateLimit",
      analytics: true,
    });
  }
  return rateLimitInstance;
};
