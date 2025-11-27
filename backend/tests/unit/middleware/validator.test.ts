import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { validate } from '../../../src/middleware/validator.js';
import { ValidationError } from '../../../src/utils/errors.js';

describe('Validator Middleware', () => {
  it('should pass validation for valid input', async () => {
    const req = {
      body: {
        email: 'test@example.com',
        name: 'Test User',
      },
    } as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    const middleware = validate([
      body('email').isEmail(),
      body('name').notEmpty(),
    ]);

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    const error = (next as any).mock.calls[0][0];
    expect(error).toBeUndefined();
  });

  it('should reject invalid email', async () => {
    const req = {
      body: {
        email: 'invalid-email',
        name: 'Test User',
      },
    } as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    const middleware = validate([
      body('email').isEmail(),
      body('name').notEmpty(),
    ]);

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    const error = (next as any).mock.calls[0][0];
    expect(error).toBeInstanceOf(ValidationError);
  });

  it('should reject empty required field', async () => {
    const req = {
      body: {
        email: 'test@example.com',
        name: '',
      },
    } as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    const middleware = validate([
      body('email').isEmail(),
      body('name').notEmpty(),
    ]);

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    const error = (next as any).mock.calls[0][0];
    expect(error).toBeInstanceOf(ValidationError);
  });
});
