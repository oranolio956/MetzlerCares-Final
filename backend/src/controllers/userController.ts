import { Request, Response } from 'express';
import { getUserById, updateUser } from '../services/userService.js';
import { getDatabasePool } from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { NotFoundError, AuthenticationError } from '../utils/errors.js';

// Get current user
export const getCurrentUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const user = await getUserById(req.user.userId);

    if (!user) {
      throw new NotFoundError('User');
    }

    // Remove sensitive fields
    const { deleted_at, ...userResponse } = user;

    res.json({
      user: userResponse,
    });
});

// Update current user
export const updateCurrentUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const { name, email } = req.body;

    const updatedUser = await updateUser(req.user.userId, { name, email });

    // Remove sensitive fields
    const { deleted_at, ...userResponse } = updatedUser;

    res.json({
      user: userResponse,
    });
});

// Get user sessions
export const getUserSessions = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
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
});
