import type {Response} from 'express';

export const validationError = (res: Response, err: Error) => {
  res.status(422).json({
    message: 'Validation error.',
    error: err,
  });
};

export const getResponseFn = (res: Response) => <D extends unknown>(data: D, error?: Error | string) => {
  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.trace(error);
    }

    if (typeof error === 'string') {
      res.status(500).json(Error(error));
      return;
    }

    res.status(500).json(error);
  } else {
    res.json(data);
  }
};
