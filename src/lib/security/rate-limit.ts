import { prisma } from "../db/client";

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: Date;
}

/**
 * DB-backed Rate Limiter using RateLimitBucket model with fixed-window intervals.
 * Safe across distributed serverless environments.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const now = new Date();
  const windowMs = windowSeconds * 1000;
  const currentWindowStart = new Date(Math.floor(now.getTime() / windowMs) * windowMs);
  const resetAt = new Date(currentWindowStart.getTime() + windowMs);

  try {
    const bucket = await prisma.rateLimitBucket.findUnique({
      where: { key },
    });

    if (!bucket || bucket.windowStart.getTime() < currentWindowStart.getTime()) {
      // First hit in this window or window rolled over
      await prisma.rateLimitBucket.upsert({
        where: { key },
        create: {
          key,
          count: 1,
          windowStart: currentWindowStart,
        },
        update: {
          count: 1,
          windowStart: currentWindowStart,
        },
      });

      return {
        success: true,
        remaining: limit - 1,
        resetAt,
      };
    }

    if (bucket.count >= limit) {
      return {
        success: false,
        remaining: 0,
        resetAt,
      };
    }

    const updated = await prisma.rateLimitBucket.update({
      where: { key },
      data: {
        count: { increment: 1 },
      },
    });

    return {
      success: updated.count <= limit,
      remaining: Math.max(0, limit - updated.count),
      resetAt,
    };
  } catch (error) {
    console.error("Rate limit check error:", error);
    // Fail open in case of temporary DB failure to avoid complete outage
    return {
      success: true,
      remaining: 1,
      resetAt,
    };
  }
}
