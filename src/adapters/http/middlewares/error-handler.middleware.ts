import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';

export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
): void {
  request.log.error(error);

  const statusCode = error.statusCode ?? 500;

  const message = statusCode >= 500 ? 'Internal server error' : error.message;

  reply.status(statusCode).send({
    error: error.name || 'Error',
    message,
    statusCode
  });
}
