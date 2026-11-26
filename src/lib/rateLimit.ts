import { logServerError } from '@/lib/serverLogger';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { headers } from 'next/headers';
import { createHash } from 'node:crypto';

const POLICIES = {
  contactForm: { requests: 5, window: '10 m' },
} as const;

type Policy = keyof typeof POLICIES;

let redis: Redis | null | undefined;
const limiters = new Map<Policy, Ratelimit>();

function getRedis(): Redis | null {
  if (redis !== undefined) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  redis = url && token ? new Redis({ url, token }) : null;
  return redis;
}

function getLimiter(policy: Policy): Ratelimit | null {
  const client = getRedis();
  if (!client) return null;
  let limiter = limiters.get(policy);
  if (!limiter) {
    const { requests, window } = POLICIES[policy];
    limiter = new Ratelimit({
      redis: client,
      limiter: Ratelimit.slidingWindow(requests, window),
      prefix: `ratelimit:v2:${policy}`,
    });
    limiters.set(policy, limiter);
  }
  return limiter;
}

async function getIdentifier(userId: string | null): Promise<string> {
  let raw: string;
  if (userId) {
    raw = `user:${userId}`;
  } else {
    const h = await headers();
    const ip =
      h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      h.get('x-real-ip') ||
      'unknown';
    raw = `ip:${ip}`;
  }
  return createHash('sha256').update(raw).digest('hex');
}

/** Fail-open: allows the request when Upstash is not configured or errors. */
export async function checkRateLimit(
  policy: Policy,
  userId: string | null,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const limiter = getLimiter(policy);
  if (!limiter) return { ok: true };
  try {
    const { success } = await limiter.limit(await getIdentifier(userId));
    if (!success) {
      return {
        ok: false,
        message: 'Too many attempts. Please try again in a moment.',
      };
    }
  } catch (error) {
    logServerError('rateLimit', error, { policy });
  }
  return { ok: true };
}
