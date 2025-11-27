import { Request, Response } from 'express';
import { getUserByEmail, getUserByOAuth, createUser } from '../services/userService.js';
import { createSession, invalidateSession, invalidateAllUserSessions } from '../services/sessionService.js';
import { generateTokenPair, verifyRefreshToken, JWTPayload } from '../utils/jwt.js';
import { logger } from '../utils/logger.js';
import { ConflictError, ValidationError, AuthenticationError } from '../utils/errors.js';
import { getRedisClient } from '../config/redis.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { UserType } from '../types/index.js';

// Helper to validate user type
const isValidUserType = (type: string): type is UserType => {
  return type === 'donor' || type === 'beneficiary';
};

// Google OAuth callback handler
export const handleGoogleCallback = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // In a real implementation, you would:
    // 1. Exchange the authorization code for tokens
    // 2. Get user info from Google
    // 3. Create or find user
    // 4. Generate JWT tokens
    // 5. Create session

    // For now, this is a placeholder that expects user info in the request
    // In production, use Google OAuth library (e.g., google-auth-library)
    // The frontend should send: { email, name, sub: googleId, userType?: 'donor' | 'beneficiary' }
    const { email, name, sub: googleId } = req.body;

    if (!email || !googleId) {
      throw new ValidationError('Missing required OAuth data: email and sub (Google ID) are required');
    }

    // Validate user type if provided
    const userType = req.body.userType || 'beneficiary';
    if (!isValidUserType(userType)) {
      throw new ValidationError('Invalid user type. Must be "donor" or "beneficiary"');
    }

    // Find or create user
    let user = await getUserByOAuth('google', googleId);
    
    if (!user) {
      // Check if user exists by email
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        throw new ConflictError('User with this email already exists');
      }

      // Create new user
      user = await createUser(email, name, userType, 'google', googleId);
    }

    // Generate tokens
    const tokenPair = generateTokenPair({
      userId: user.id,
      email: user.email,
      userType: user.user_type,
    });

    // Create session
    await createSession(user.id, tokenPair);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.user_type,
      },
      tokens: tokenPair,
    });
});

// Apple Sign-In callback handler
export const handleAppleCallback = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Similar to Google, but for Apple Sign-In
    // In production, use apple-signin library
    // The frontend should send: { email, name, sub: appleId, userType?: 'donor' | 'beneficiary' }
    const { email, name, sub: appleId } = req.body;

    if (!email || !appleId) {
      throw new ValidationError('Missing required OAuth data: email and sub (Apple ID) are required');
    }

    // Validate user type if provided
    const userType = req.body.userType || 'beneficiary';
    if (!isValidUserType(userType)) {
      throw new ValidationError('Invalid user type. Must be "donor" or "beneficiary"');
    }

    // Find or create user
    let user = await getUserByOAuth('apple', appleId);
    
    if (!user) {
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        throw new ConflictError('User with this email already exists');
      }

      user = await createUser(email, name, userType, 'apple', appleId);
    }

    // Generate tokens
    const tokenPair = generateTokenPair({
      userId: user.id,
      email: user.email,
      userType: user.user_type,
    });

    // Create session
    await createSession(user.id, tokenPair);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.user_type,
      },
      tokens: tokenPair,
    });
});

// Refresh token endpoint
export const refreshToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ValidationError('Refresh token is required');
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    // Check if refresh token exists in Redis
    const redis = getRedisClient();
    let storedUserId: string | null = null;
    try {
      storedUserId = await redis.get(`refresh:${refreshToken}`);
    } catch (error) {
      logger.warn('Redis error during token refresh, continuing with database check:', error);
    }
    
    if (!storedUserId || storedUserId !== payload.userId) {
      // Fallback: check database if Redis fails
      const sessionService = await import('../services/sessionService.js');
      const session = await sessionService.getSessionByToken(refreshToken);
      if (!session || session.user_id !== payload.userId) {
        throw new AuthenticationError('Invalid refresh token');
      }
    }

    // Generate new token pair
    const tokenPair = generateTokenPair(payload);

    // Update session
    await createSession(payload.userId, tokenPair);

    res.json({
      tokens: tokenPair,
    });
});

// Logout endpoint
export const logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      await invalidateSession(token);
    }

    res.json({
      message: 'Logged out successfully',
    });
});

// Logout all sessions
export const logoutAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    await invalidateAllUserSessions(req.user.userId);

    res.json({
      message: 'All sessions logged out successfully',
    });
});
