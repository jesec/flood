import type {NextFunction, Request, Response} from 'express';

import {AccessLevel} from '../../shared/schema/constants/Auth';

export default (req: Request, res: Response, next: NextFunction) => {
  if (req.user == null || req.user.level !== AccessLevel.ADMINISTRATOR) {
    res.status(403).json({message: 'User is not admin.'}).send();
    return;
  }
  next();
};
