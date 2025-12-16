import type {FastifyRateLimitOptions} from '@fastify/rate-limit';

import config from '../../config';

type RateLimitOptions = {
  max: number;
  windowMs: number;
};

type RateLimitConfig = {
  config: {
    rateLimit: FastifyRateLimitOptions;
  };
};

export function rateLimit(passedOptions: RateLimitOptions): RateLimitConfig | undefined {
  if (config.disableRateLimit) {
    return undefined;
  }

  const {windowMs, max} = passedOptions;

  return {
    config: {
      rateLimit: {
        max,
        timeWindow: windowMs,
      },
    },
  };
}
