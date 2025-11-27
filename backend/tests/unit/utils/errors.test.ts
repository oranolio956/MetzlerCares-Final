import { describe, it, expect } from 'vitest';
import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
} from '../../../src/utils/errors.js';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create AppError with message', () => {
      const error = new AppError('Test error');
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
    });

    it('should create AppError with custom status code', () => {
      const error = new AppError('Test error', 400);
      expect(error.statusCode).toBe(400);
    });
  });

  describe('ValidationError', () => {
    it('should create ValidationError with 400 status', () => {
      const error = new ValidationError('Invalid input');
      expect(error.message).toBe('Invalid input');
      expect(error.statusCode).toBe(400);
    });
  });

  describe('AuthenticationError', () => {
    it('should create AuthenticationError with 401 status', () => {
      const error = new AuthenticationError('Not authenticated');
      expect(error.message).toBe('Not authenticated');
      expect(error.statusCode).toBe(401);
    });
  });

  describe('AuthorizationError', () => {
    it('should create AuthorizationError with 403 status', () => {
      const error = new AuthorizationError('Not authorized');
      expect(error.message).toBe('Not authorized');
      expect(error.statusCode).toBe(403);
    });
  });

  describe('NotFoundError', () => {
    it('should create NotFoundError with 404 status', () => {
      const error = new NotFoundError('Resource');
      expect(error.message).toBe('Resource not found');
      expect(error.statusCode).toBe(404);
    });
  });

  describe('ConflictError', () => {
    it('should create ConflictError with 409 status', () => {
      const error = new ConflictError('Resource already exists');
      expect(error.message).toBe('Resource already exists');
      expect(error.statusCode).toBe(409);
    });
  });

  describe('DatabaseError', () => {
    it('should create DatabaseError with 500 status', () => {
      const error = new DatabaseError('Database operation failed');
      expect(error.message).toBe('Database operation failed');
      expect(error.statusCode).toBe(500);
    });
  });
});
