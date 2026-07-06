import { FastifyRequest, FastifyReply } from 'fastify';

export async function loggingMiddleware(
  request: FastifyRequest,
  _reply: FastifyReply
): Promise<void> {
  request.log.info(
    {
      method: request.method,
      url: request.url,
      ip: request.ip
    },
    'incoming request'
  );
}
