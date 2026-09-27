import awsLambdaFastify from '@fastify/aws-lambda';
import { fastify } from '../../server/src/server.ts';

const proxy = awsLambdaFastify(fastify);

export const handler = async (event, context) => {
  return proxy(event, context);
};
