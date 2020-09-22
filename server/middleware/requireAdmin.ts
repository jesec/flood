import type {Request, Response, NextFunction} from 'express';

export default (req: Request, res: Response, next: NextFunction) => {
  if (req.user == null || !req.user.isAdmin) {
    res.status(403).json({message: 'User is not admin.'}).send();
    return;
  }
  next();
};
