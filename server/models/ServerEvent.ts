import type {ServerEvents} from '@shared/types/ServerEvents';
import type {Response} from 'express';

class ServerEvent {
  res: Response;

  constructor(res: Response) {
    this.res = res;
  }

  emit<T extends keyof ServerEvents>(id: number, eventType: T, data: ServerEvents[T]) {
    this.res.write(`id:${id}\n`);
    this.res.write(`event:${eventType}\n`);
    this.res.write(`data:${JSON.stringify(data)}\n\n`);
  }
}

export default ServerEvent;
