import { FastifyRequest, FastifyReply } from 'fastify';
import { Counter } from 'prom-client';

const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests received',
  labelNames: ['method', 'route']
});

export async function metricsMiddleware(
  request: FastifyRequest,
  _reply: FastifyReply
): Promise<void> {
  const route = request.routeOptions?.url ?? request.url;
  httpRequestsTotal.inc({ method: request.method, route });
}
