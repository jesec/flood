import type {FastifyReply} from 'fastify';

export default (reply: FastifyReply) => {
  reply.raw.socket?.setKeepAlive(true);
  reply.raw.socket?.setTimeout(0);

  reply.raw.writeHead(200, {
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Content-Type': 'text/event-stream',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'X-Accel-Buffering': 'no',
  });

  reply.hijack();
  reply.raw.write('retry: 500\n\n');

  const keepAliveTimeout = setInterval(() => {
    reply.raw.write(':keep-alive\n\n');
  }, 500);

  reply.raw.on('close', () => {
    clearInterval(keepAliveTimeout);
  });
};
