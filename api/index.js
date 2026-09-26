import { fastify } from '../server/src/server.ts';

export default async function (req, res) {
  await fastify.ready();
  fastify.server.emit('request', req, res);
}
