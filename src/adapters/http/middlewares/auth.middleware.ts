import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  sub?: string;
  id?: string;
}

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader || authHeader.trim().length === 0) {
    return reply
      .status(401)
      .send({ message: 'Missing or invalid authorization header' });
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length).trim()
    : authHeader.trim();
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return reply.status(500).send({ message: 'JWT secret not configured' });
  }

  try {
    const payload = jwt.verify(token, secret) as JwtPayload;
    const userId = payload.id ?? payload.sub;

    if (!userId) {
      return reply.status(401).send({ message: 'Invalid token payload' });
    }

    (request as any).user = { id: userId };
  } catch {
    return reply.status(401).send({ message: 'Invalid or expired token' });
  }
}
