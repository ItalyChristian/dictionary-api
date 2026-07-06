import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import jwt from 'jsonwebtoken';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { authMiddleware } from '@adapters/http/middlewares/auth.middleware';

const JWT_SECRET = 'test-secret';

function buildReply() {
  const reply = {
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis()
  };
  return reply as unknown as FastifyReply & typeof reply;
}

function buildRequest(authorization?: string) {
  return {
    headers: authorization ? { authorization } : {}
  } as unknown as FastifyRequest;
}

describe('authMiddleware', () => {
  const originalSecret = process.env.JWT_SECRET;

  beforeEach(() => {
    process.env.JWT_SECRET = JWT_SECRET;
  });

  afterEach(() => {
    process.env.JWT_SECRET = originalSecret;
    vi.restoreAllMocks();
  });

  it('accepts a valid Bearer token and attaches the user id', async () => {
    const token = jwt.sign({ id: 'user-1' }, JWT_SECRET);
    const request = buildRequest(`Bearer ${token}`);
    const reply = buildReply();

    await authMiddleware(request, reply);

    expect(reply.status).not.toHaveBeenCalled();
    expect((request as any).user).toEqual({ id: 'user-1' });
  });

  it('accepts a raw token without the Bearer prefix', async () => {
    const token = jwt.sign({ sub: 'user-2' }, JWT_SECRET);
    const request = buildRequest(token);
    const reply = buildReply();

    await authMiddleware(request, reply);

    expect((request as any).user).toEqual({ id: 'user-2' });
  });

  it('returns 401 when the authorization header is missing', async () => {
    const reply = buildReply();
    await authMiddleware(buildRequest(), reply);

    expect(reply.status).toHaveBeenCalledWith(401);
    expect(reply.send).toHaveBeenCalledWith({
      message: 'Missing or invalid authorization header'
    });
  });

  it('returns 500 when the JWT secret is not configured', async () => {
    delete process.env.JWT_SECRET;
    const reply = buildReply();

    await authMiddleware(buildRequest('Bearer whatever'), reply);

    expect(reply.status).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({
      message: 'JWT secret not configured'
    });
  });

  it('returns 401 when the token is invalid', async () => {
    const reply = buildReply();
    await authMiddleware(buildRequest('Bearer invalid.token.here'), reply);

    expect(reply.status).toHaveBeenCalledWith(401);
    expect(reply.send).toHaveBeenCalledWith({
      message: 'Invalid or expired token'
    });
  });

  it('returns 401 when the token payload has no id or sub', async () => {
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET);
    const reply = buildReply();

    await authMiddleware(buildRequest(`Bearer ${token}`), reply);

    expect(reply.status).toHaveBeenCalledWith(401);
    expect(reply.send).toHaveBeenCalledWith({
      message: 'Invalid token payload'
    });
  });
});
