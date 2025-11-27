import { Request, Response } from 'express';
import { getUserByEmail, getUserByOAuth, createUser } from '../services/userService.js';
import { createSession, invalidateSession, invalidateAllUserSessions } from '../services/sessionService.js';
import { generateTokenPair, verifyRefreshToken, JWTPayload } from '../utils/jwt.js';
import { logger } from '../utils/logger.js';
import { getEnv } from '../config/env.js';

const env = getEnv();

// Google OAuth callback handler
export const handleGoogleCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    // In a real implementation, you would:
    // 1. Exchange the authorization code for tokens
    // 2. Get user info from Google
    // 3. Create or find user
    // 4. Generate JWT tokens
    // 5. Create session

    // For now, this is a placeholder that expects user info in the request
    // In production, use Google OAuth library (e.g., google-auth-library)
    const { email, name, sub: googleId } = req.body;

    if (!email || !googleId) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Missing required OAuth data',
      });
      return;
    }

    // Find or create user
    let user = await getUserByOAuth('google', googleId);
    
    if (!user) {
      // Check if user exists by email
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        res.status(409).json({
          error: 'Conflict',
          message: 'User with this email already exists',
        });
        return;
      }

      // Create new user (default to beneficiary, can be changed)
      user = await createUser(email, name, 'beneficiary', 'google', googleId);
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
  } catch (error) {
    logger.error('Google OAuth callback failed:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication failed',
    });
  }
};

// Apple Sign-In callback handler
export const handleAppleCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    // Similar to Google, but for Apple Sign-In
    // In production, use apple-signin library
    const { email, name, sub: appleId } = req.body;

    if (!email || !appleId) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Missing required OAuth data',
      });
      return;
    }

    // Find or create user
    let user = await getUserByOAuth('apple', appleId);
    
    if (!user) {
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        res.status(409).json({
          error: 'Conflict',
          message: 'User with this email already exists',
        });
        return;
      }

      user = await createUser(email, name, 'beneficiary', 'apple', appleId);
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
  } catch (error) {
    logger.error('Apple OAuth callback failed:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication failed',
    });
  }
};

// Refresh token endpoint
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Refresh token is required',
      });
      return;
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    // Check if refresh token exists in Redis
    const redis = getRedisClient();
    const storedUserId = await redis.get(`refresh:${refreshToken}`);
    
    if (!storedUserId || storedUserId !== payload.userId) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid refresh token',
      });
      return;
    }

    // Generate new token pair
    const tokenPair = generateTokenPair(payload);

    // Update session
    await createSession(payload.userId, tokenPair);

    res.json({
      tokens: tokenPair,
    });
  } catch (error) {
    logger.error('Token refresh failed:', error);
    res.status(401).json({
      error: 'Unauthorized',
      message: error instanceof Error ? error.message : 'Invalid refresh token',
    });
  }
};

// Logout endpoint
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      await invalidateSession(token);
    }

    res.json({
      message: 'Logged out successfully',
    });
  } catch (error) {
    logger.error('Logout failed:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Logout failed',
    });
  }
};

// Logout all sessions
export const logoutAll = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    await invalidateAllUserSessions(req.user.userId);

    res.json({
      message: 'All sessions logged out successfully',
    });
  } catch (error) {
    logger.error('Logout all failed:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Logout failed',
    });
  }
};
