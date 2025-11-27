import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { AuthenticationError, ValidationError } from '../utils/errors.js';
import {
  getBeneficiaryDashboard,
  verifyInsurance,
  createOrUpdateBeneficiaryProfile,
} from '../services/beneficiaryService.js';

// Get beneficiary dashboard
export const getDashboard = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    if (req.user.userType !== 'beneficiary') {
      throw new ValidationError('Only beneficiaries can access this endpoint');
    }

    const dashboard = await getBeneficiaryDashboard(req.user.userId);

    res.json({
      dashboard: {
        name: req.user.email.split('@')[0], // Placeholder, should come from user profile
        daysSober: dashboard.daysSober,
        nextMilestone: dashboard.nextMilestone,
        insuranceStatus: dashboard.insuranceStatus,
        requests: dashboard.applications.map((app) => ({
          id: app.id,
          type: app.type,
          date: app.date,
          status: app.status,
          note: app.note,
          details: app.details,
        })),
      },
    });
});

// Verify insurance
export const verifyInsuranceStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    if (req.user.userType !== 'beneficiary') {
      throw new ValidationError('Only beneficiaries can verify insurance');
    }

    const { status } = req.body;

    if (!status || (status !== 'verified' && status !== 'pending')) {
      throw new ValidationError('status must be "verified" or "pending"');
    }

    const profile = await verifyInsurance(req.user.userId, status);

    res.json({
      insuranceStatus: profile.insurance_status,
      message: status === 'verified' 
        ? 'Medicaid verified. Peer Coaching unlocked.' 
        : 'Insurance verification pending.',
    });
});

// Update beneficiary profile
export const updateProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    if (req.user.userType !== 'beneficiary') {
      throw new ValidationError('Only beneficiaries can update this profile');
    }

    const { daysSober, nextMilestone, insuranceStatus } = req.body;

    const updates: any = {};
    if (daysSober !== undefined) updates.days_sober = daysSober;
    if (nextMilestone !== undefined) updates.next_milestone = nextMilestone;
    if (insuranceStatus !== undefined) updates.insurance_status = insuranceStatus;

    if (Object.keys(updates).length === 0) {
      throw new ValidationError('No fields to update');
    }

    const profile = await createOrUpdateBeneficiaryProfile(req.user.userId, updates);

    res.json({
      profile: {
        daysSober: profile.days_sober,
        nextMilestone: profile.next_milestone,
        insuranceStatus: profile.insurance_status,
      },
    });
});
