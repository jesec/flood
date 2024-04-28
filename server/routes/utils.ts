import config from '../../config';

import expressRateLimit, {Options} from 'express-rate-limit';
import {RequestHandler} from 'express';

export function rateLimit(passedOptions?: Partial<Options>): RequestHandler {
  if (config.disableRateLimit) {
    return function (req, res, next) {
      next();
    };
  }

  return expressRateLimit(passedOptions);
}
