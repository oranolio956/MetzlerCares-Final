import { describe, it, expect } from 'vitest';
import { createDonation, getDonationById, getUserDonations } from '../../../src/services/donationService.js';
import { ValidationError, NotFoundError } from '../../../src/utils/errors.js';
import { createTestUser } from '../../helpers/testHelpers.js';

describe('Donation Service', () => {
  describe('createDonation', () => {
    it('should create a donation', async () => {
      const testUser = await createTestUser('donor@example.com', 'Donor', 'donor');
      
      const donation = await createDonation({
        userId: testUser.id,
        amount: 100,
        impactType: 'tech',
        itemLabel: 'Laptop',
        stripePaymentIntentId: 'pi_test_123',
      });

      expect(donation).toBeDefined();
      expect(donation.amount).toBe('100');
      expect(donation.impact_type).toBe('tech');
      expect(donation.status).toBe('pending');
    });

    it('should throw ValidationError for negative amount', async () => {
      const testUser = await createTestUser('donor2@example.com', 'Donor', 'donor');
      
      await expect(
        createDonation({
          userId: testUser.id,
          amount: -100,
          impactType: 'tech',
          itemLabel: 'Laptop',
          stripePaymentIntentId: 'pi_test_123',
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid impact type', async () => {
      const testUser = await createTestUser('donor3@example.com', 'Donor', 'donor');
      
      await expect(
        createDonation({
          userId: testUser.id,
          amount: 100,
          impactType: 'invalid' as any,
          itemLabel: 'Laptop',
          stripePaymentIntentId: 'pi_test_123',
        })
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('getDonationById', () => {
    it('should get donation by ID', async () => {
      const testUser = await createTestUser('getdonation@example.com', 'Donor', 'donor');
      const donation = await createDonation({
        userId: testUser.id,
        amount: 100,
        impactType: 'tech',
        itemLabel: 'Laptop',
        stripePaymentIntentId: 'pi_test_123',
      });

      const retrieved = await getDonationById(donation.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(donation.id);
    });

    it('should return null for non-existent donation', async () => {
      const donation = await getDonationById('00000000-0000-0000-0000-000000000000');
      expect(donation).toBeNull();
    });
  });

  describe('getUserDonations', () => {
    it('should get user donations', async () => {
      const testUser = await createTestUser('mydonations@example.com', 'Donor', 'donor');
      
      await createDonation({
        userId: testUser.id,
        amount: 100,
        impactType: 'tech',
        itemLabel: 'Laptop',
        stripePaymentIntentId: 'pi_test_1',
      });
      
      await createDonation({
        userId: testUser.id,
        amount: 200,
        impactType: 'home',
        itemLabel: 'Rent',
        stripePaymentIntentId: 'pi_test_2',
      });

      const donations = await getUserDonations(testUser.id);
      expect(donations.length).toBeGreaterThanOrEqual(2);
    });
  });
});
