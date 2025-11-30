import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../database.js';
import { requireAuth, requireBeneficiary } from '../middleware/auth.js';
import { logAuditEvent } from '../middleware/hipaa.js';

// Safe JSON parsing utility
const safeJsonParse = <T>(jsonString: string, fallback: T): T => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('Failed to parse JSON, using fallback:', error);
    return fallback;
  }
};

const intakeRouter = Router();

// Intake qualification schema
const intakeQualificationSchema = z.object({
  residency: z.enum(['colorado', 'other'], {
    errorMap: () => ({ message: 'Must specify Colorado residency status' })
  }),
  safety: z.boolean({
    errorMap: () => ({ message: 'Must confirm current safety status' })
  }),
  need: z.enum(['rent', 'transport', 'tech'], {
    errorMap: () => ({ message: 'Must specify primary need: rent, transport, or tech' })
  }),
  sobrietyDays: z.number().min(0).max(10000, {
    errorMap: () => ({ message: 'Sobriety days must be between 0 and 10,000' })
  }),
  legalIssues: z.boolean({
    errorMap: () => ({ message: 'Must disclose any legal issues' })
  }),
  medicaidStatus: z.enum(['verified', 'pending', 'none'], {
    errorMap: () => ({ message: 'Medicaid status must be verified, pending, or none' })
  }),
  incomePlan: z.boolean({
    errorMap: () => ({ message: 'Must confirm income/sustainability plan' })
  })
});

// SUBMIT INTAKE QUALIFICATION
intakeRouter.post('/qualify', requireBeneficiary, async (req, res) => {
  try {
    const { userId } = req.user!;
    const intakeData = intakeQualificationSchema.parse(req.body);

    // Get beneficiary record
    const beneficiaryResult = await pool.query(
      'SELECT id, medicaid_status FROM beneficiaries WHERE user_id = $1',
      [userId]
    );

    if (beneficiaryResult.rows.length === 0) {
      return res.status(404).json({ error: 'Beneficiary profile not found' });
    }

    const beneficiary = beneficiaryResult.rows[0];

    // QUALIFICATION ALGORITHM
    let qualificationScore = 0;
    let isQualified = false;
    let disqualificationReason = null;
    const qualifications = [];

    // 1. Residency Check (30 points)
    if (intakeData.residency === 'colorado') {
      qualificationScore += 30;
      qualifications.push('Colorado resident');
    } else {
      disqualificationReason = 'Must be Colorado resident';
    }

    // 2. Safety Check (20 points)
    if (intakeData.safety) {
      qualificationScore += 20;
      qualifications.push('Safe housing situation');
    } else {
      qualifications.push('Safety concerns noted');
    }

    // 3. Primary Need (20 points)
    if (intakeData.need) {
      qualificationScore += 20;
      qualifications.push(`${intakeData.need} assistance requested`);
    }

    // 4. Sobriety Status (15 points)
    if (intakeData.sobrietyDays >= 7) {
      qualificationScore += 15;
      qualifications.push(`${intakeData.sobrietyDays} days sober`);
    } else if (intakeData.sobrietyDays > 0) {
      qualificationScore += 10;
      qualifications.push(`${intakeData.sobrietyDays} days sober (minimum met)`);
    } else {
      qualifications.push('Currently using (coaching recommended)');
    }

    // 5. Legal Issues (10 points - disqualification if certain issues)
    if (!intakeData.legalIssues) {
      qualificationScore += 10;
      qualifications.push('No disqualifying legal issues');
    } else {
      disqualificationReason = 'Legal background requires review';
      qualifications.push('Legal issues disclosed - requires review');
    }

    // 6. Medicaid Status (15 points - preferred but not required)
    if (intakeData.medicaidStatus === 'verified') {
      qualificationScore += 15;
      qualifications.push('Medicaid verified - coaching eligible');
    } else if (intakeData.medicaidStatus === 'pending') {
      qualificationScore += 10;
      qualifications.push('Medicaid pending - partial qualification');
    } else {
      qualifications.push('No Medicaid - standard qualification applies');
    }

    // 7. Income/Sustainability (10 points)
    if (intakeData.incomePlan) {
      qualificationScore += 10;
      qualifications.push('Sustainability plan confirmed');
    } else {
      qualifications.push('Sustainability plan needed');
    }

    // FINAL QUALIFICATION DECISION
    const minScore = 70; // Minimum score for qualification
    const preferredScore = 85; // Score for preferred qualification

    if (qualificationScore >= preferredScore && !disqualificationReason) {
      isQualified = true;
      qualifications.push('FULLY QUALIFIED - Priority funding');
    } else if (qualificationScore >= minScore && !disqualificationReason) {
      isQualified = true;
      qualifications.push('QUALIFIED - Standard funding');
    } else {
      isQualified = false;
      qualifications.push('REQUIRES REVIEW - Additional information needed');
    }

    // Determine application status
    let applicationStatus = 'draft';
    if (isQualified) {
      applicationStatus = 'qualified';
    } else if (disqualificationReason) {
      applicationStatus = 'needs_review';
    } else if (qualificationScore >= minScore - 10) {
      applicationStatus = 'reviewing';
    }

    // Update beneficiary record
    await pool.query(
      `UPDATE beneficiaries SET
        days_sober = $1,
        medicaid_status = $2,
        application_status = $3,
        qualification_score = $4,
        intake_completed = true,
        updated_at = NOW()
       WHERE user_id = $5`,
      [
        intakeData.sobrietyDays,
        intakeData.medicaidStatus,
        applicationStatus,
        qualificationScore,
        userId
      ]
    );

    // Store intake data (anonymized for audit)
    const intakeRecord = {
      residency: intakeData.residency,
      safety: intakeData.safety,
      need: intakeData.need,
      sobrietyDays: intakeData.sobrietyDays,
      legalIssues: intakeData.legalIssues,
      medicaidStatus: intakeData.medicaidStatus,
      incomePlan: intakeData.incomePlan,
      qualificationScore,
      isQualified,
      submittedAt: new Date().toISOString()
    };

    await pool.query(
      'UPDATE beneficiaries SET intake_data = $1 WHERE user_id = $2',
      [JSON.stringify(intakeRecord), userId]
    );

    // Log qualification decision
    await logAuditEvent(userId, 'INTAKE_COMPLETED', {
      qualificationScore,
      isQualified,
      applicationStatus,
      qualifications
    }, req);

    res.json({
      qualification: {
        score: qualificationScore,
        isQualified,
        status: applicationStatus,
        qualifications,
        disqualificationReason
      },
      nextSteps: isQualified ? [
        'You are now eligible for funding!',
        'Monitor your dashboard for available opportunities',
        'Complete any additional verification if requested'
      ] : disqualificationReason ? [
        'Your application requires additional review',
        'Contact support for assistance with qualification',
        'Consider peer coaching options while reviewing'
      ] : [
        'Your application is being reviewed',
        'You may be contacted for additional information',
        'Check back in 24-48 hours for status updates'
      ],
      estimatedWaitTime: isQualified ? 'Immediate' : '24-48 hours'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid intake data',
        details: error.errors
      });
    }
    console.error('Intake qualification error:', error);
    await logAuditEvent(req.user!.userId, 'INTAKE_ERROR', { error: error.message }, req);
    res.status(500).json({ error: 'Failed to process intake qualification' });
  }
});

// GET INTAKE STATUS
intakeRouter.get('/status', requireBeneficiary, async (req, res) => {
  try {
    const { userId } = req.user!;

    const beneficiaryResult = await pool.query(
      `SELECT
        days_sober,
        medicaid_status,
        application_status,
        qualification_score,
        intake_completed,
        intake_data,
        created_at,
        updated_at
       FROM beneficiaries WHERE user_id = $1`,
      [userId]
    );

    if (beneficiaryResult.rows.length === 0) {
      return res.status(404).json({ error: 'Beneficiary profile not found' });
    }

    const beneficiary = beneficiaryResult.rows[0];

    // Parse intake data if exists
    let intakeDetails = null;
    if (beneficiary.intake_data) {
      try {
        intakeDetails = safeJsonParse(beneficiary.intake_data, {});
      } catch (error) {
        console.error('Error parsing intake data:', error);
      }
    }

    res.json({
      intakeStatus: {
        completed: beneficiary.intake_completed,
        applicationStatus: beneficiary.application_status,
        qualificationScore: beneficiary.qualification_score,
        medicaidStatus: beneficiary.medicaid_status,
        sobrietyDays: beneficiary.days_sober
      },
      intakeDetails,
      submittedAt: beneficiary.updated_at,
      lastUpdated: beneficiary.updated_at
    });

  } catch (error) {
    console.error('Intake status error:', error);
    res.status(500).json({ error: 'Failed to retrieve intake status' });
  }
});

// UPDATE INTAKE INFORMATION (for beneficiaries who need to resubmit)
intakeRouter.put('/update', requireBeneficiary, async (req, res) => {
  try {
    const { userId } = req.user!;
    const updateData = req.body;

    // Validate update data (partial validation)
    const updateSchema = intakeQualificationSchema.partial();
    const validatedData = updateSchema.parse(updateData);

    // Update beneficiary record
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (validatedData.sobrietyDays !== undefined) {
      updateFields.push(`days_sober = $${paramCount}`);
      values.push(validatedData.sobrietyDays);
      paramCount++;
    }

    if (validatedData.medicaidStatus !== undefined) {
      updateFields.push(`medicaid_status = $${paramCount}`);
      values.push(validatedData.medicaidStatus);
      paramCount++;
    }

    if (validatedData.residency !== undefined ||
        validatedData.safety !== undefined ||
        validatedData.need !== undefined ||
        validatedData.legalIssues !== undefined ||
        validatedData.incomePlan !== undefined) {

      // Get current intake data
      const currentResult = await pool.query(
        'SELECT intake_data FROM beneficiaries WHERE user_id = $1',
        [userId]
      );

      let currentIntake = {};
      if (currentResult.rows[0]?.intake_data) {
        currentIntake = safeJsonParse(currentResult.rows[0].intake_data, {});
      }

      // Merge with updates
      const updatedIntake = {
        ...currentIntake,
        ...validatedData,
        updatedAt: new Date().toISOString()
      };

      updateFields.push(`intake_data = $${paramCount}`);
      values.push(JSON.stringify(updatedIntake));
      paramCount++;
    }

    if (updateFields.length > 0) {
      updateFields.push('updated_at = NOW()');
      values.push(userId);

      const query = `
        UPDATE beneficiaries
        SET ${updateFields.join(', ')}
        WHERE user_id = $${paramCount}
        RETURNING application_status, qualification_score
      `;

      const result = await pool.query(query, values);

      await logAuditEvent(userId, 'INTAKE_UPDATED', {
        updates: validatedData,
        newStatus: result.rows[0].application_status,
        newScore: result.rows[0].qualification_score
      }, req);

      res.json({
        message: 'Intake information updated successfully',
        newStatus: result.rows[0].application_status,
        newQualificationScore: result.rows[0].qualification_score
      });
    } else {
      res.status(400).json({ error: 'No valid updates provided' });
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid update data',
        details: error.errors
      });
    }
    console.error('Intake update error:', error);
    res.status(500).json({ error: 'Failed to update intake information' });
  }
});

// ADMIN: QUALIFICATION ANALYTICS
intakeRouter.get('/admin/analytics', requireAuth, async (req, res) => {
  try {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Qualification statistics
    const statsQuery = `
      SELECT
        COUNT(*) as total_applications,
        COUNT(CASE WHEN intake_completed THEN 1 END) as completed_intakes,
        COUNT(CASE WHEN application_status = 'qualified' THEN 1 END) as qualified,
        COUNT(CASE WHEN application_status = 'needs_review' THEN 1 END) as needs_review,
        COUNT(CASE WHEN application_status = 'reviewing' THEN 1 END) as under_review,
        AVG(qualification_score) as avg_score,
        MIN(qualification_score) as min_score,
        MAX(qualification_score) as max_score
      FROM beneficiaries
    `;

    const statsResult = await pool.query(statsQuery);
    const stats = statsResult.rows[0];

    // Score distribution
    const scoreDistributionQuery = `
      SELECT
        CASE
          WHEN qualification_score >= 90 THEN '90-100'
          WHEN qualification_score >= 80 THEN '80-89'
          WHEN qualification_score >= 70 THEN '70-79'
          WHEN qualification_score >= 60 THEN '60-69'
          ELSE '0-59'
        END as score_range,
        COUNT(*) as count
      FROM beneficiaries
      WHERE qualification_score IS NOT NULL
      GROUP BY score_range
      ORDER BY score_range DESC
    `;

    const scoreResult = await pool.query(scoreDistributionQuery);

    // Recent applications
    const recentApplicationsQuery = `
      SELECT
        b.id,
        u.email,
        b.application_status,
        b.qualification_score,
        b.medicaid_status,
        b.created_at,
        b.updated_at
      FROM beneficiaries b
      JOIN users u ON b.user_id = u.id
      WHERE b.intake_completed = true
      ORDER BY b.updated_at DESC
      LIMIT 20
    `;

    const recentResult = await pool.query(recentApplicationsQuery);

    res.json({
      overview: {
        totalApplications: parseInt(stats.total_applications),
        completedIntakes: parseInt(stats.completed_intakes),
        qualifiedApplicants: parseInt(stats.qualified),
        needsReview: parseInt(stats.needs_review),
        underReview: parseInt(stats.under_review),
        averageScore: parseFloat(stats.avg_score) || 0,
        scoreRange: {
          min: parseFloat(stats.min_score) || 0,
          max: parseFloat(stats.max_score) || 0
        },
        qualificationRate: stats.completed_intakes > 0
          ? ((parseInt(stats.qualified) / parseInt(stats.completed_intakes)) * 100).toFixed(1)
          : '0'
      },
      scoreDistribution: scoreResult.rows,
      recentApplications: recentResult.rows.map(app => ({
        id: app.id,
        email: app.email,
        status: app.application_status,
        score: app.qualification_score,
        medicaidStatus: app.medicaid_status,
        appliedAt: app.created_at,
        lastUpdated: app.updated_at
      }))
    });

  } catch (error) {
    console.error('Intake analytics error:', error);
    res.status(500).json({ error: 'Failed to load intake analytics' });
  }
});

// ADMIN: MANUAL QUALIFICATION OVERRIDE
intakeRouter.put('/admin/qualify/:beneficiaryId', requireAuth, async (req, res) => {
  try {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { beneficiaryId } = req.params;
    const { status, score, notes } = req.body;

    if (!['qualified', 'needs_review', 'reviewing'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be qualified, needs_review, or reviewing' });
    }

    if (score !== undefined && (score < 0 || score > 100)) {
      return res.status(400).json({ error: 'Score must be between 0 and 100' });
    }

    // Update beneficiary
    const updateData = { status };
    if (score !== undefined) updateData.score = score;

    await pool.query(
      `UPDATE beneficiaries SET
        application_status = $1,
        qualification_score = COALESCE($2, qualification_score),
        updated_at = NOW()
       WHERE id = $3`,
      [status, score, beneficiaryId]
    );

    // Log manual override
    await logAuditEvent(req.user!.userId, 'MANUAL_QUALIFICATION_OVERRIDE', {
      beneficiaryId: parseInt(beneficiaryId),
      newStatus: status,
      newScore: score,
      notes
    }, req);

    res.json({
      message: `Beneficiary qualification status updated to ${status}`,
      beneficiaryId,
      newStatus: status,
      newScore: score
    });

  } catch (error) {
    console.error('Manual qualification error:', error);
    res.status(500).json({ error: 'Failed to update qualification status' });
  }
});

export default intakeRouter;



