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

describe('Authentication Endpoints', () => {
  describe('POST /api/v1/auth/refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      const testUser = await createTestUser('refresh@example.com');
      
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: testUser.refreshToken })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.accessToken).toBeTruthy();
    });

    it('should return 401 for invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for missing refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout user with valid token', async () => {
      const testUser = await createTestUser('logout@example.com');
      
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 401 for missing token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });
});
