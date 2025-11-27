import { describe, it, expect, beforeEach } from 'vitest';
import { createUser, getUserById, getUserByEmail, updateUser } from '../../../src/services/userService.js';
import { ConflictError, NotFoundError } from '../../../src/utils/errors.js';
import { createTestUser } from '../../helpers/testHelpers.js';

describe('User Service', () => {
  describe('createUser', () => {
    it('should create a new user', async () => {
      const user = await createUser({
        email: 'newuser@example.com',
        name: 'New User',
        userType: 'donor',
        oauthProvider: 'google',
        oauthId: 'google-123',
      });

      expect(user).toBeDefined();
      expect(user.email).toBe('newuser@example.com');
      expect(user.name).toBe('New User');
      expect(user.user_type).toBe('donor');
    });

    it('should throw ConflictError for duplicate email', async () => {
      await createUser({
        email: 'duplicate@example.com',
        name: 'User 1',
        userType: 'donor',
        oauthProvider: 'google',
        oauthId: 'google-1',
      });

      await expect(
        createUser({
          email: 'duplicate@example.com',
          name: 'User 2',
          userType: 'donor',
          oauthProvider: 'google',
          oauthId: 'google-2',
        })
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('getUserById', () => {
    it('should get user by ID', async () => {
      const testUser = await createTestUser('getbyid@example.com');
      const user = await getUserById(testUser.id);

      expect(user).toBeDefined();
      expect(user?.id).toBe(testUser.id);
      expect(user?.email).toBe('getbyid@example.com');
    });

    it('should return null for non-existent user', async () => {
      const user = await getUserById('00000000-0000-0000-0000-000000000000');
      expect(user).toBeNull();
    });
  });

  describe('getUserByEmail', () => {
    it('should get user by email', async () => {
      const testUser = await createTestUser('getbyemail@example.com');
      const user = await getUserByEmail('getbyemail@example.com');

      expect(user).toBeDefined();
      expect(user?.id).toBe(testUser.id);
      expect(user?.email).toBe('getbyemail@example.com');
    });

    it('should return null for non-existent email', async () => {
      const user = await getUserByEmail('nonexistent@example.com');
      expect(user).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update user details', async () => {
      const testUser = await createTestUser('update@example.com', 'Old Name');
      const updated = await updateUser(testUser.id, {
        name: 'New Name',
      });

      expect(updated.name).toBe('New Name');
      expect(updated.email).toBe('update@example.com');
    });

    it('should throw NotFoundError for non-existent user', async () => {
      await expect(
        updateUser('00000000-0000-0000-0000-000000000000', { name: 'New Name' })
      ).rejects.toThrow(NotFoundError);
    });
  });
});
