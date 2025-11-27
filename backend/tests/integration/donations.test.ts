import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import routes from '../../src/routes/index.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';
import { createTestUser, createTestDonation } from '../helpers/testHelpers.js';

const app = express();
app.use(express.json());
app.use(routes);
app.use(errorHandler);

describe('Donation Endpoints', () => {
  describe('GET /api/v1/donations/me', () => {
    it('should get user donations when authenticated', async () => {
      const testUser = await createTestUser('donor@example.com', 'Donor', 'donor');
      await createTestDonation(testUser.id, 100);
      await createTestDonation(testUser.id, 200);

      const response = await request(app)
        .get('/api/v1/donations/me')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/v1/donations/me')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/donations/statistics', () => {
    it('should get donation statistics when authenticated', async () => {
      const testUser = await createTestUser('stats@example.com', 'Donor', 'donor');
      await createTestDonation(testUser.id, 100);
      await createTestDonation(testUser.id, 200);

      const response = await request(app)
        .get('/api/v1/donations/statistics')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalDonated');
      expect(response.body).toHaveProperty('donationCount');
      expect(parseFloat(response.body.totalDonated)).toBeGreaterThanOrEqual(300);
    });
  });
});
