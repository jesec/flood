import type {Request, Response, NextFunction} from 'express';

export default (key: string) => (req: Request, _res: Response, next: NextFunction) => {
  const value = req.body && req.body[key];

  if (value && typeof value === 'string') {
    req.body[key] = value === 'true';
  }

  next();
};
