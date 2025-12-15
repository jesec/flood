import type {ServerEvents} from '@shared/types/ServerEvents';
import type {FastifyReply} from 'fastify';

type ServerSentEvent = {
  id?: string;
  event?: string;
  data: string;
};

class ServerEvent {
  reply: FastifyReply;

  constructor(reply: FastifyReply) {
    this.reply = reply;
  }

  emit<T extends keyof ServerEvents>(id: number, eventType: T, data: ServerEvents[T]) {
    const payload: ServerSentEvent = {
      id: `${id}`,
      event: eventType,
      data: JSON.stringify(data),
    };

    this.reply.sse.send(payload).catch(() => {});
  }
}

export default ServerEvent;
