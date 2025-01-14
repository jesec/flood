import {RequestHandler} from 'express';
import expressRateLimit, {Options} from 'express-rate-limit';

import config from '../../config';

export function rateLimit(passedOptions?: Partial<Options>): RequestHandler {
  if (config.disableRateLimit) {
    return function (req, res, next) {
      next();
    };
  }

  return expressRateLimit(passedOptions);
}
