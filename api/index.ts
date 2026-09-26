import { fastify } from '../server/dist/server.js';

export default async function (req, res) {
  try {
    await fastify.ready();
    fastify.server.emit('request', req, res);
  } catch (err) {
    res.status(500).send(`Server Error: ${err.message}\nStack: ${err.stack}`);
  }
}
