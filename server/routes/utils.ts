import type {FastifyReply, FastifyRequest} from 'fastify';

import config from '../../config';

type RateLimitOptions = {
  max: number;
  windowMs: number;
};

type RateLimitState = {
  count: number;
  expiresAt: number;
};

const counters = new Map<string, RateLimitState>();

export function rateLimit(passedOptions: RateLimitOptions): (req: FastifyRequest, reply: FastifyReply) => void {
  if (config.disableRateLimit) {
    return function () {
      return;
    };
  }

  const {windowMs, max} = passedOptions;

  return function (req, reply) {
    const key = req.ip ?? req.socket?.remoteAddress ?? 'unknown';
    const now = Date.now();
    const state = counters.get(key);

    if (state == null || state.expiresAt < now) {
      counters.set(key, {
        count: 1,
        expiresAt: now + windowMs,
      });
      return;
    }

    state.count += 1;
    if (state.count > max) {
      reply.status(429).send({message: 'Too many requests'});
    }
  };
}
