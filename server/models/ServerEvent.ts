import type {Response} from 'express';

import type {ServerEvents} from '@shared/types/ServerEvents';

class ServerEvent {
  res: Response;

  constructor(res: Response) {
    this.res = res;

    // Add 2kb padding for IE.
    const padding = new Array(2049);
    res.write(`:${padding.join(' ')}\n`);
  }

  emit<T extends keyof ServerEvents>(id: number, eventType: T, data: ServerEvents[T]) {
    this.res.write(`id:${id}\n`);
    this.res.write(`event:${eventType}\n`);
    this.res.write(`data:${JSON.stringify(data)}\n\n`);
    this.res.flush();
  }
}

export default ServerEvent;
