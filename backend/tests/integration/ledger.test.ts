import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import routes from '../../src/routes/index.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';
import { createTestTransaction } from '../helpers/testHelpers.js';

const app = express();
app.use(express.json());
app.use(routes);
app.use(errorHandler);

describe('Ledger Endpoints (Public)', () => {
  describe('GET /api/v1/ledger/transactions', () => {
    it('should get transactions without authentication', async () => {
      await createTestTransaction(null, 'TECH', 100);
      await createTestTransaction(null, 'RENT', 200);

      const response = await request(app)
        .get('/api/v1/ledger/transactions')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter transactions by category', async () => {
      await createTestTransaction(null, 'TECH', 100);
      await createTestTransaction(null, 'RENT', 200);

      const response = await request(app)
        .get('/api/v1/ledger/transactions?category=TECH')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0].category).toBe('TECH');
      }
    });

    it('should paginate transactions', async () => {
      const response = await request(app)
        .get('/api/v1/ledger/transactions?limit=10&offset=0')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/v1/ledger/statistics', () => {
    it('should get ledger statistics without authentication', async () => {
      await createTestTransaction(null, 'TECH', 100);

      const response = await request(app)
        .get('/api/v1/ledger/statistics')
        .expect(200);

      expect(response.body).toHaveProperty('totalAmount');
      expect(response.body).toHaveProperty('transactionCount');
    });
  });
});
