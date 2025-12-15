import type {RateLimitOptions} from '@fastify/rate-limit';
import type {RouteShorthandOptions} from 'fastify';

import config from '../../config';

export function rateLimit(options: Pick<RateLimitOptions, 'max'> & {windowMs: number}): RouteShorthandOptions {
  if (config.disableRateLimit) {
    return {};
  }

  return {
    config: {
      rateLimit: {
        max: options.max,
        timeWindow: options.windowMs,
      },
    },
  };
}
