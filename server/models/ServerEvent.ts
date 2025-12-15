import type {ServerEvents} from '@shared/types/ServerEvents';
import type {ServerResponse} from 'node:http';

class ServerEvent {
  res: ServerResponse;

  constructor(res: ServerResponse) {
    this.res = res;
  }

  emit<T extends keyof ServerEvents>(id: number, eventType: T, data: ServerEvents[T]) {
    this.res.write(`id:${id}\n`);
    this.res.write(`event:${eventType}\n`);
    this.res.write(`data:${JSON.stringify(data)}\n\n`);
  }
}

export default ServerEvent;
