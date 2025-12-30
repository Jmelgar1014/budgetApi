import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";

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

export const useRateLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const instance = rateLimit();

  const { success, limit, remaining } = await instance.limit(userId);

  if (!success) {
    return res.status(429).json({
      error: "Rate Limit Exceeded",
      limit: limit,
      remaining: remaining,
      reset: new Date(Date.now() + 60000),
    });
  }
  next();
};
