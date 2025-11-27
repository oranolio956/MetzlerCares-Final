import { getDatabasePool } from '../config/database.js';
import { Application, ApplicationStatus } from '../types/index.js';
import { logger } from '../utils/logger.js';
import { NotFoundError, DatabaseError, ValidationError } from '../utils/errors.js';

export interface CreateApplicationInput {
  userId: string;
  type: string;
  details: string;
}

export interface UpdateApplicationInput {
  status?: ApplicationStatus;
  details?: string;
}

export const createApplication = async (input: CreateApplicationInput): Promise<Application> => {
  const pool = getDatabasePool();

  // Validate input
  if (!input.type || typeof input.type !== 'string' || input.type.trim().length === 0) {
    throw new ValidationError('Application type is required');
  }

  if (input.type.length > 50) {
    throw new ValidationError('Application type must be 50 characters or less');
  }

  if (input.details && input.details.length > 10000) {
    throw new ValidationError('Application details must be 10,000 characters or less');
  }

  try {
    const result = await pool.query(
      `INSERT INTO applications (user_id, type, status, details)
       VALUES ($1, $2, 'reviewing', $3)
       RETURNING *`,
      [input.userId, input.type.trim(), input.details?.trim() || null]
    );

    const application = result.rows[0];
    logger.info('Application created:', {
      applicationId: application.id,
      userId: input.userId,
      type: input.type,
    });

    // Send notification email (async, don't block)
    setImmediate(async () => {
      try {
        const { getUserById } = await import('./userService.js');
        const user = await getUserById(input.userId);
        if (user?.email) {
          const { sendApplicationStatusEmail } = await import('./emailService.js');
          await sendApplicationStatusEmail(user.email, {
            type: input.type,
            status: 'reviewing',
          });
        }
      } catch (error) {
        logger.warn('Failed to send application email:', error);
      }
    });

    return application;
  } catch (error: any) {
    logger.error('Failed to create application:', error);
    throw new DatabaseError('Failed to create application');
  }
};

export const getApplicationById = async (id: string): Promise<Application | null> => {
  const pool = getDatabasePool();

  const result = await pool.query('SELECT * FROM applications WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const getUserApplications = async (
  userId: string,
  limit: number = 50,
  offset: number = 0,
  status?: ApplicationStatus
): Promise<{ applications: Application[]; total: number }> => {
  const pool = getDatabasePool();

  try {
    let countQuery = 'SELECT COUNT(*) FROM applications WHERE user_id = $1';
    let dataQuery = `SELECT * FROM applications WHERE user_id = $1`;
    const countParams: any[] = [userId];
    const dataParams: any[] = [userId];

    if (status) {
      countQuery += ' AND status = $2';
      dataQuery += ' AND status = $2';
      countParams.push(status);
      dataParams.push(status);
    }

    dataQuery += ' ORDER BY created_at DESC LIMIT $' + (dataParams.length + 1) + ' OFFSET $' + (dataParams.length + 2);
    dataParams.push(limit, offset);

    // Get total count
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count, 10);

    // Get applications
    const result = await pool.query(dataQuery, dataParams);

    return {
      applications: result.rows,
      total,
    };
  } catch (error) {
    logger.error('Failed to get user applications:', error);
    throw new DatabaseError('Failed to fetch applications');
  }
};

export const updateApplication = async (
  id: string,
  input: UpdateApplicationInput
): Promise<Application> => {
  const pool = getDatabasePool();

  // Validate status if provided
  if (input.status) {
    const validStatuses: ApplicationStatus[] = [
      'reviewing',
      'approved',
      'action_needed',
      'funded',
      'rejected',
    ];
    if (!validStatuses.includes(input.status)) {
      throw new ValidationError(
        `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      );
    }
  }

  // Validate details if provided
  if (input.details !== undefined) {
    if (input.details && input.details.length > 10000) {
      throw new ValidationError('Application details must be 10,000 characters or less');
    }
  }

  try {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (input.status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(input.status);
    }

    if (input.details !== undefined) {
      updates.push(`details = $${paramCount++}`);
      values.push(input.details?.trim() || null);
    }

    if (updates.length === 0) {
      throw new ValidationError('No fields to update');
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(
      `UPDATE applications 
       SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Application');
    }

    const updated = result.rows[0];
    logger.info('Application updated:', { applicationId: id, updates: input });

    // Send notification email if status changed (async, don't block)
    if (input.status) {
      setImmediate(async () => {
        try {
          const application = await getApplicationById(id);
          if (application) {
            const { getUserById } = await import('./userService.js');
            const user = await getUserById(application.user_id);
            if (user?.email) {
              const { sendApplicationStatusEmail } = await import('./emailService.js');
              await sendApplicationStatusEmail(user.email, {
                type: application.type,
                status: application.status,
                note: input.status === 'action_needed' ? 'Action required' : undefined,
              });
            }
          }
        } catch (error) {
          logger.warn('Failed to send status update email:', error);
        }
      });
    }

    return updated;
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ValidationError) {
      throw error;
    }
    logger.error('Failed to update application:', error);
    throw new DatabaseError('Failed to update application');
  }
};

export const deleteApplication = async (id: string, userId: string): Promise<void> => {
  const pool = getDatabasePool();

  // Verify ownership
  const application = await getApplicationById(id);
  if (!application) {
    throw new NotFoundError('Application');
  }

  if (application.user_id !== userId) {
    throw new ValidationError('Application does not belong to user');
  }

  // Only allow deletion if status is reviewing or rejected
  if (application.status !== 'reviewing' && application.status !== 'rejected') {
    throw new ValidationError('Cannot delete application with current status');
  }

  try {
    await pool.query('DELETE FROM applications WHERE id = $1', [id]);
    logger.info('Application deleted:', { applicationId: id, userId });
  } catch (error) {
    logger.error('Failed to delete application:', error);
    throw new DatabaseError('Failed to delete application');
  }
};
