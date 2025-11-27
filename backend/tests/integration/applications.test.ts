import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import routes from '../../src/routes/index.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';
import { createTestUser, createTestApplication } from '../helpers/testHelpers.js';

const app = express();
app.use(express.json());
app.use(routes);
app.use(errorHandler);

describe('Application Endpoints', () => {
  describe('POST /api/v1/applications', () => {
    it('should create application for beneficiary', async () => {
      const testUser = await createTestUser('applicant@example.com', 'Applicant', 'beneficiary');

      const response = await request(app)
        .post('/api/v1/applications')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .send({
          type: 'rent',
          details: 'Need help with rent payment',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.type).toBe('rent');
      expect(response.body.status).toBe('reviewing');
    });

    it('should reject application from non-beneficiary', async () => {
      const testUser = await createTestUser('donor@example.com', 'Donor', 'donor');

      const response = await request(app)
        .post('/api/v1/applications')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .send({
          type: 'rent',
          details: 'Need help',
        })
        .expect(403);

      expect(response.body).toHaveProperty('error');
    });

    it('should validate required fields', async () => {
      const testUser = await createTestUser('validate@example.com', 'Applicant', 'beneficiary');

      const response = await request(app)
        .post('/api/v1/applications')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .send({
          // Missing type
          details: 'Need help',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/applications', () => {
    it('should get user applications', async () => {
      const testUser = await createTestUser('myapps@example.com', 'Applicant', 'beneficiary');
      await createTestApplication(testUser.id, 'rent', 'reviewing');
      await createTestApplication(testUser.id, 'tech', 'approved');

      const response = await request(app)
        .get('/api/v1/applications')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
    });
  });
});
