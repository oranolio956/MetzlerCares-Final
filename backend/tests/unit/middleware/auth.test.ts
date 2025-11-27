import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { authenticate, requireUserType } from '../../../src/middleware/auth.js';
import { generateAccessToken } from '../../../src/utils/jwt.js';
import { AuthenticationError, AuthorizationError } from '../../../src/utils/errors.js';

describe('Auth Middleware', () => {
  describe('authenticate', () => {
    it('should authenticate valid token', async () => {
      const userId = 'user-123';
      const token = generateAccessToken({
        userId,
        email: 'test@example.com',
        userType: 'donor',
      });

      const req = {
        headers: { authorization: `Bearer ${token}` },
      } as Request;
      const res = {} as Response;
      const next = vi.fn() as NextFunction;

      await authenticate(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user?.userId).toBe(userId);
    });

    it('should reject missing token', async () => {
      const req = {
        headers: {},
      } as Request;
      const res = {} as Response;
      const next = vi.fn() as NextFunction;

      await authenticate(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = (next as any).mock.calls[0][0];
      expect(error).toBeInstanceOf(AuthenticationError);
    });

    it('should reject invalid token', async () => {
      const req = {
        headers: { authorization: 'Bearer invalid-token' },
      } as Request;
      const res = {} as Response;
      const next = vi.fn() as NextFunction;

      await authenticate(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = (next as any).mock.calls[0][0];
      expect(error).toBeInstanceOf(AuthenticationError);
    });
  });

  describe('requireUserType', () => {
    it('should allow access for correct user type', async () => {
      const req = {
        user: {
          userId: 'user-123',
          email: 'test@example.com',
          userType: 'donor',
        },
      } as Request;
      const res = {} as Response;
      const next = vi.fn() as NextFunction;

      const middleware = requireUserType(['donor']);
      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect((next as any).mock.calls[0][0]).toBeUndefined();
    });

    it('should reject access for wrong user type', async () => {
      const req = {
        user: {
          userId: 'user-123',
          email: 'test@example.com',
          userType: 'donor',
        },
      } as Request;
      const res = {} as Response;
      const next = vi.fn() as NextFunction;

      const middleware = requireUserType(['beneficiary']);
      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = (next as any).mock.calls[0][0];
      expect(error).toBeInstanceOf(AuthorizationError);
    });
  });
});
