import { Request, Response } from 'express';
import { getUserById, updateUser } from '../services/userService.js';
import { getDatabasePool } from '../config/database.js';
import { logger } from '../utils/logger.js';

// Get current user
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    const user = await getUserById(req.user.userId);

    if (!user) {
      res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
      return;
    }

    // Remove sensitive fields
    const { deleted_at, ...userResponse } = user;

    res.json({
      user: userResponse,
    });
  } catch (error) {
    logger.error('Get current user failed:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch user',
    });
  }
};

// Update current user
export const updateCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    const { name, email } = req.body;

    // Validate input
    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Name must be a non-empty string',
      });
      return;
    }

    if (email !== undefined && (typeof email !== 'string' || !email.includes('@'))) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Email must be a valid email address',
      });
      return;
    }

    const updatedUser = await updateUser(req.user.userId, { name, email });

    // Remove sensitive fields
    const { deleted_at, ...userResponse } = updatedUser;

    res.json({
      user: userResponse,
    });
  } catch (error: any) {
    logger.error('Update current user failed:', error);
    
    if (error.message === 'User not found') {
      res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
      return;
    }

    if (error.code === '23505') {
      res.status(409).json({
        error: 'Conflict',
        message: 'Email already in use',
      });
      return;
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update user',
    });
  }
};

// Get user sessions
export const getUserSessions = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    const pool = getDatabasePool();
    const result = await pool.query(
      `SELECT id, created_at, expires_at 
       FROM sessions 
       WHERE user_id = $1 AND expires_at > NOW()
       ORDER BY created_at DESC`,
      [req.user.userId]
    );

    res.json({
      sessions: result.rows,
    });
  } catch (error) {
    logger.error('Get user sessions failed:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch sessions',
    });
  }
};
