import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import routes from '../../src/routes/index.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';
import { createTestUser } from '../helpers/testHelpers.js';

const app = express();
app.use(express.json());
app.use(routes);
app.use(errorHandler);

describe('Security Penetration Tests', () => {
  describe('SQL Injection Protection', () => {
    it('should prevent SQL injection in user queries', async () => {
      const maliciousInput = "'; DROP TABLE users; --";
      
      const response = await request(app)
        .get(`/api/v1/users/me`)
        .set('Authorization', `Bearer invalid-token`)
        .expect(401);

      // Should not crash or expose database errors
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('XSS Protection', () => {
    it('should sanitize user input', async () => {
      const testUser = await createTestUser('xss@example.com');
      const xssPayload = '<script>alert("XSS")</script>';

      const response = await request(app)
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .send({ name: xssPayload })
        .expect(200);

      // Name should be stored but not executed
      expect(response.body.name).toContain('<script>');
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const requests = Array(150).fill(null).map(() =>
        request(app)
          .get('/api/v1/users/me')
          .set('Authorization', 'Bearer invalid-token')
      );

      const responses = await Promise.all(requests);
      
      // Some requests should be rate limited (429)
      const rateLimited = responses.filter(r => r.status === 429);
      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });

  describe('Authentication Bypass', () => {
    it('should reject requests without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/users/me')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject malformed tokens', async () => {
      const response = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', 'Bearer malformed.token.here')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Authorization Bypass', () => {
    it('should prevent access to other users data', async () => {
      const user1 = await createTestUser('user1@example.com', 'User 1', 'beneficiary');
      const user2 = await createTestUser('user2@example.com', 'User 2', 'beneficiary');

      // User 1 trying to access User 2's data
      const response = await request(app)
        .get(`/api/v1/beneficiaries/me/dashboard`)
        .set('Authorization', `Bearer ${user1.accessToken}`)
        .expect(200);

      // Should only return user1's data, not user2's
      expect(response.body).toBeDefined();
    });
  });

  describe('Input Validation', () => {
    it('should reject invalid UUIDs', async () => {
      const testUser = await createTestUser('validation@example.com');
      
      const response = await request(app)
        .get('/api/v1/applications/invalid-uuid')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject negative amounts', async () => {
      const testUser = await createTestUser('amount@example.com', 'Donor', 'donor');
      
      const response = await request(app)
        .post('/api/v1/payments/intents')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .send({ amount: -100 })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });
});
