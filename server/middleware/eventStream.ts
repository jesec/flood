import type {FastifyReply, FastifyRequest} from 'fastify';

export default (request: FastifyRequest, reply: FastifyReply) => {
  request.raw.socket.setKeepAlive(true);
  request.raw.socket.setTimeout(0);

  reply.raw.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'X-Accel-Buffering': 'no',
  });
  reply.hijack();
  reply.raw.write('retry: 500\n\n');

  // Keep the connection open by sending a message every so often.
  const keepAliveTimeout = setInterval(() => {
    reply.raw.write(':keep-alive\n\n');
  }, 500);

  // cleanup on close
  reply.raw.on('close', () => {
    clearInterval(keepAliveTimeout);
  });
};
