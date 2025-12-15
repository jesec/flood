import type {ServerEvents} from '@shared/types/ServerEvents';
import type {FastifyReply} from 'fastify';

class ServerEvent {
  reply: FastifyReply;

  constructor(reply: FastifyReply) {
    this.reply = reply;
  }

  emit<T extends keyof ServerEvents>(id: number, eventType: T, data: ServerEvents[T]) {
    this.reply.sse
      .send({
        id: `${id}`,
        event: eventType,
        data: data,
      })
      .catch(() => {});
  }
}

export default ServerEvent;
