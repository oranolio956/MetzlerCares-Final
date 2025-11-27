import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { AuthenticationError, ValidationError } from '../utils/errors.js';
import { getDonorAnalytics, getPlatformAnalytics } from '../services/analyticsService.js';
import { requireUserType } from '../middleware/auth.js';

// Get donor analytics
export const getDonorStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    if (req.user.userType !== 'donor') {
      throw new ValidationError('Only donors can access this endpoint');
    }

    const analytics = await getDonorAnalytics(req.user.userId);

    res.json({
      analytics: {
        totalInvested: analytics.totalInvested,
        livesImpacted: analytics.livesImpacted,
        activeProjects: analytics.activeProjects,
        socialRoi: analytics.socialRoi,
        byImpactType: analytics.byImpactType,
        recentImpact: analytics.recentImpact,
      },
    });
});

// Get platform analytics (admin only - placeholder for future admin role)
export const getPlatformStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // In production, this would require admin role
    // For now, we'll allow authenticated users (can be restricted later)
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const analytics = await getPlatformAnalytics();

    res.json({
      analytics: {
        totalDonations: analytics.totalDonations,
        totalAmount: analytics.totalAmount,
        totalUsers: analytics.totalUsers,
        totalApplications: analytics.totalApplications,
        totalPartners: analytics.totalPartners,
        donationsByMonth: analytics.donationsByMonth,
      },
    });
});
