import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { config } from '../config.js';
import { pool, redis, dbQuery, dbRedisGet, dbRedisSet, dbRedisDel } from '../database.js';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('valid email is required'),
  password: z.string().min(8, 'password must be at least 8 characters'),
  role: z.enum(['donor', 'beneficiary', 'vendor'], {
    errorMap: () => ({ message: 'role must be donor, beneficiary, or vendor' })
  }),
  profile: z.object({
    name: z.string().min(1, 'name is required'),
    phone: z.string().optional(),
    location: z.object({
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional()
    }).optional()
  })
});

const loginSchema = z.object({
  email: z.string().email('valid email is required'),
  password: z.string().min(1, 'password is required'),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'refresh token is required'),
});

// Helper functions
async function generateTokens(userId: number, role: string) {
  const accessToken = jwt.sign(
    { userId, role },
    config.jwtSecret as string,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId, role },
    config.jwtSecret as string,
    { expiresIn: '7d' }
  );

  // Store refresh token in Redis
  await dbRedisSet(`refresh:${userId}`, refreshToken, { EX: 7 * 24 * 60 * 60 }); // 7 days

  return { accessToken, refreshToken };
}

async function logAuditEvent(userId: number | null, action: string, details: any, req: any) {
  try {
    await dbQuery(
      'INSERT INTO audit_logs (user_id, action, resource_type, old_values, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5, $6)',
      [
        userId,
        action,
        details.resourceType || 'auth',
        JSON.stringify(details),
        req.ip,
        req.get('User-Agent')
      ]
    );
  } catch (error) {
    console.error('Audit logging failed:', error);
  }
}

export const authRouter = Router();

// User registration
authRouter.post('/register', async (req, res) => {
  try {
    const { email, password, role, profile } = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await dbQuery(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      await logAuditEvent(null, 'REGISTRATION_FAILED', { email, reason: 'user_exists' }, req);
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const userResult = await dbQuery(
      'INSERT INTO users (email, password_hash, role, profile) VALUES ($1, $2, $3, $4) RETURNING id, email, role, profile',
      [email, passwordHash, role, JSON.stringify(profile)]
    );
    const user = userResult.rows[0];

    // Create role-specific profile within transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create role-specific profile
      if (role === 'beneficiary') {
        await client.query(
          'INSERT INTO beneficiaries (user_id) VALUES ($1)',
          [user.id]
        );
      } else if (role === 'donor') {
        await client.query(
          'INSERT INTO donors (user_id) VALUES ($1)',
          [user.id]
        );
      } else if (role === 'vendor') {
        await client.query(
          'INSERT INTO vendors (user_id, business_name, vendor_type) VALUES ($1, $2, $3)',
          [user.id, profile.name || `${profile.firstName || 'Business'} ${profile.lastName || 'Owner'}`, 'housing']
        );
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateTokens(user.id, user.role);

    await logAuditEvent(user.id, 'USER_REGISTERED', { role, email }, req);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile
      },
      accessToken,
      refreshToken
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid input',
        details: error.errors
      });
    }
    console.error('Registration error:', error);
    await logAuditEvent(null, 'REGISTRATION_ERROR', { error: error.message }, req);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// User login
authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find user
    const userResult = await dbQuery(
      'SELECT id, email, password_hash, role, profile, is_active FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      await logAuditEvent(null, 'LOGIN_FAILED', { email, reason: 'user_not_found' }, req);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      await logAuditEvent(user.id, 'LOGIN_FAILED', { email, reason: 'account_inactive' }, req);
      return res.status(401).json({ error: 'Account is inactive' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      await logAuditEvent(user.id, 'LOGIN_FAILED', { email, reason: 'invalid_password' }, req);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last login
    await pool.query(
      'UPDATE users SET last_login_at = NOW() WHERE id = $1',
      [user.id]
    );

    // Generate tokens
    const { accessToken, refreshToken } = await generateTokens(user.id, user.role);

    await logAuditEvent(user.id, 'USER_LOGIN', { email, role: user.role }, req);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile
      },
      accessToken,
      refreshToken
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid input',
        details: error.errors
      });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Refresh access token
authRouter.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = refreshTokenSchema.parse(req.body);

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.jwtSecret as string) as any;

    // Check if refresh token exists in Redis
    const storedToken = await redis.get(`refresh:${decoded.userId}`);
    if (!storedToken || storedToken !== refreshToken) {
      await logAuditEvent(decoded.userId, 'TOKEN_REFRESH_FAILED', { reason: 'invalid_token' }, req);
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Generate new tokens
    const { accessToken, newRefreshToken } = await generateTokens(decoded.userId, decoded.role);

    // Update refresh token in Redis
    await redis.set(`refresh:${decoded.userId}`, newRefreshToken, { EX: 7 * 24 * 60 * 60 });

    await logAuditEvent(decoded.userId, 'TOKEN_REFRESHED', {}, req);

    res.json({
      accessToken,
      refreshToken: newRefreshToken
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid input',
        details: error.errors
      });
    }
    console.error('Token refresh error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// Logout
authRouter.post('/logout', async (req, res) => {
  try {
    // Extract user ID from JWT if available (optional auth)
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, config.jwtSecret as string) as any;
        await redis.del(`refresh:${decoded.userId}`);
        await logAuditEvent(decoded.userId, 'USER_LOGOUT', {}, req);
      } catch (error) {
        // Token might be expired, continue with logout
      }
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Get current user profile (requires authentication)
authRouter.get('/profile', async (req, res) => {
  try {
    // This will be protected by auth middleware
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.jwtSecret as string) as any;

    const userResult = await pool.query(
      'SELECT id, email, role, profile, created_at FROM users WHERE id = $1 AND is_active = true',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Get role-specific data
    let additionalData = {};
    if (user.role === 'beneficiary') {
      const beneficiaryResult = await pool.query(
        'SELECT days_sober, medicaid_status, application_status FROM beneficiaries WHERE user_id = $1',
        [user.id]
      );
      if (beneficiaryResult.rows.length > 0) {
        additionalData = beneficiaryResult.rows[0];
      }
    } else if (user.role === 'donor') {
      const donorResult = await pool.query(
        'SELECT total_donated, impact_preferences FROM donors WHERE user_id = $1',
        [user.id]
      );
      if (donorResult.rows.length > 0) {
        additionalData = donorResult.rows[0];
      }
    }

    res.json({
      user: {
        ...user,
        ...additionalData
      }
    });

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

export default authRouter;
