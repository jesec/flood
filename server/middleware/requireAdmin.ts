import type {Request, Response, NextFunction} from 'express';

import {AccessLevel} from '../../shared/schema/Auth';

export default (req: Request, res: Response, next: NextFunction) => {
  if (req.user == null || req.user.level !== AccessLevel.ADMINISTRATOR) {
    res.status(403).json({message: 'User is not admin.'}).send();
    return;
  }
  next();
};
