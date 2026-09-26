export default async function (req, res) {
  try {
    const { fastify } = await import('../server/src/server.ts');
    await fastify.ready();
    fastify.server.emit('request', req, res);
  } catch (err) {
    res.status(500).send(`Server Error: ${err.message}\nStack: ${err.stack}`);
  }
}
