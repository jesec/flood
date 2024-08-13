import type {NextFunction, Request, Response} from 'express';

import type {ServiceInstances} from '../services';
import {getAllServices} from '../services';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      services: ServiceInstances;
    }
  }
}

const failedInitializeResponse = (res: Response): Response => {
  return res.status(500).json({message: 'Flood server failed to initialze.'});
};

export default (req: Request, res: Response, next: NextFunction) => {
  if (req.user == null) {
    return failedInitializeResponse(res);
  }

  req.services = getAllServices(req.user);
  if (req.services?.clientGatewayService == null) {
    return failedInitializeResponse(res);
  }

  next();
};
