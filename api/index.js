import { fastify } from '../server/dist/server.js';

export default async function (req, res) {
  await fastify.ready();
  fastify.server.emit('request', req, res);
}
