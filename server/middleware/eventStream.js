export default (req, res, next) => {
  req.socket.setKeepAlive(true);
  req.socket.setTimeout(0);

  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'X-Accel-Buffering': 'no',
  });
  res.status(200);
  res.write('retry: 500\n\n');

  // Keep the connection open by sending a message every so often.
  const keepAliveTimeout = setInterval(() => {
    res.write(':keep-alive\n\n');
    res.flush();
  }, 500);

  // cleanup on close
  res.on('close', () => {
    clearInterval(keepAliveTimeout);
  });

  next();
};
