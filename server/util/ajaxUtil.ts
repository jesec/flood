import type {Response} from 'express';

const ajaxUtil = {
  getResponseFn: (res: Response) => <D extends unknown>(data: D, error?: Error | string) => {
    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.trace(error);
      }

      if (typeof error === 'string') {
        res.status(500).json(Error(error));
      }

      res.status(500).json(error);
    } else {
      res.json(data);
    }
  },
};

export default ajaxUtil;
