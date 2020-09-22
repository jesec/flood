import type {Request, Response, NextFunction} from 'express';

import services from '../services';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      services?: ReturnType<typeof services['getAllServices']>;
    }
  }
}

export default (req: Request, _res: Response, next: NextFunction) => {
  if (req.user != null) {
    req.services = services.getAllServices(req.user);
  }
  next();
};
