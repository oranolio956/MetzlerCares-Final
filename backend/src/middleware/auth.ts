import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export interface AuthenticatedUser {
  userId: number;
  role: string;
  email: string;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

// Authentication middleware
export const requireAuth = (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, config.jwtSecret as string) as any;

      // Attach user info to request
      req.user = {
        userId: decoded.userId,
        role: decoded.role,
        email: decoded.email || null
      };

      next();
    } catch (jwtError) {
      if (jwtError instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
          error: 'Token expired',
          message: 'Please refresh your token or login again'
        });
      } else if (jwtError instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ error: 'Invalid token' });
      } else {
        return res.status(401).json({ error: 'Authentication failed' });
      }
    }

  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication service unavailable' });
  }
};

// Role-based authorization middleware
export const requireRole = (allowedRoles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        requiredRoles: allowedRoles,
        userRole: req.user.role
      });
    }

    next();
  };
};

// Admin-only middleware
export const requireAdmin = requireRole(['admin']);

// Donor-only middleware
export const requireDonor = requireRole(['donor']);

// Beneficiary-only middleware
export const requireBeneficiary = requireRole(['beneficiary']);

// Vendor-only middleware
export const requireVendor = requireRole(['vendor']);

// Combined auth and role middleware
export const authAndRole = (allowedRoles: string[]) => [
  requireAuth,
  requireRole(allowedRoles)
];

// Optional authentication (for endpoints that work with or without auth)
export const optionalAuth = (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      try {
        const decoded = jwt.verify(token, config.jwtSecret as string) as any;
        req.user = {
          userId: decoded.userId,
          role: decoded.role,
          email: decoded.email || null
        };
      } catch (error) {
        // Token is invalid but we don't fail - just continue without user
        req.user = null;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    req.user = null;
    next();
  }
};