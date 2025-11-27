import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { AuthenticationError, ValidationError, NotFoundError } from '../utils/errors.js';
import {
  createApplication,
  getUserApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
} from '../services/applicationService.js';

// Create application
export const submitApplication = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    // Only beneficiaries can submit applications
    if (req.user.userType !== 'beneficiary') {
      throw new ValidationError('Only beneficiaries can submit applications');
    }

    const { type, details } = req.body;

    const application = await createApplication({
      userId: req.user.userId,
      type,
      details,
    });

    res.status(201).json({
      application: {
        id: application.id,
        type: application.type,
        status: application.status,
        details: application.details,
        createdAt: application.created_at,
      },
    });
});

// Get user's applications
export const getApplications = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const limit = parseInt(req.query.limit as string, 10) || 50;
    const offset = parseInt(req.query.offset as string, 10) || 0;
    const status = req.query.status as string | undefined;

    if (limit > 100) {
      throw new ValidationError('limit cannot exceed 100');
    }

    const { applications, total } = await getUserApplications(
      req.user.userId,
      limit,
      offset,
      status as any
    );

    res.json({
      applications: applications.map((app) => ({
        id: app.id,
        type: app.type,
        status: app.status,
        details: app.details,
        createdAt: app.created_at,
        updatedAt: app.updated_at,
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
});

// Get application by ID
export const getApplication = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const { applicationId } = req.params;

    const application = await getApplicationById(applicationId);

    if (!application) {
      throw new NotFoundError('Application');
    }

    // Verify ownership
    if (application.user_id !== req.user.userId) {
      throw new AuthenticationError('Application does not belong to user');
    }

    res.json({
      application: {
        id: application.id,
        type: application.type,
        status: application.status,
        details: application.details,
        createdAt: application.created_at,
        updatedAt: application.updated_at,
      },
    });
});

// Update application (user can only update details, not status)
export const updateApplicationDetails = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const { applicationId } = req.params;
    const { details } = req.body;

    // Verify ownership first
    const application = await getApplicationById(applicationId);
    if (!application) {
      throw new NotFoundError('Application');
    }

    if (application.user_id !== req.user.userId) {
      throw new AuthenticationError('Application does not belong to user');
    }

    const updated = await updateApplication(applicationId, { details });

    res.json({
      application: {
        id: updated.id,
        type: updated.type,
        status: updated.status,
        details: updated.details,
        updatedAt: updated.updated_at,
      },
    });
});

// Delete application
export const removeApplication = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const { applicationId } = req.params;

    await deleteApplication(applicationId, req.user.userId);

    res.json({
      message: 'Application deleted successfully',
    });
});
