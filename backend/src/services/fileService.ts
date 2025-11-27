import { getDatabasePool } from '../config/database.js';
import { Document } from '../types/index.js';
import { logger } from '../utils/logger.js';
import { NotFoundError, DatabaseError, ValidationError } from '../utils/errors.js';

// File upload configuration
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export interface FileUploadResult {
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

// Validate file before upload
export const validateFile = (
  file: Express.Multer.File | undefined
): void => {
  if (!file) {
    throw new ValidationError('No file provided');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new ValidationError(`File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    throw new ValidationError(
      `File type not allowed. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`
    );
  }
};

// Upload file to storage (S3 implementation would go here)
// For now, this is a placeholder that would integrate with AWS S3
export const uploadFile = async (
  file: Express.Multer.File,
  applicationId: string
): Promise<FileUploadResult> => {
  // Validate file
  validateFile(file);

  // In production, this would:
  // 1. Generate unique filename
  // 2. Upload to S3
  // 3. Get public URL
  // 4. Return file metadata

  // For now, return a placeholder URL
  const fileUrl = `https://storage.secondwind.org/documents/${applicationId}/${file.originalname}`;
  
  logger.info('File upload processed:', {
    applicationId,
    fileName: file.originalname,
    fileSize: file.size,
    fileType: file.mimetype,
  });

  return {
    fileUrl,
    fileName: file.originalname,
    fileType: file.mimetype,
    fileSize: file.size,
  };
};

// Save document record to database
export const saveDocument = async (
  applicationId: string,
  fileResult: FileUploadResult
): Promise<Document> => {
  const pool = getDatabasePool();

  try {
    const result = await pool.query(
      `INSERT INTO documents (application_id, file_url, file_name, file_type, file_size)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        applicationId,
        fileResult.fileUrl,
        fileResult.fileName,
        fileResult.fileType,
        fileResult.fileSize,
      ]
    );

    logger.info('Document saved:', {
      documentId: result.rows[0].id,
      applicationId,
    });

    return result.rows[0];
  } catch (error: any) {
    logger.error('Failed to save document:', error);
    if (error.code === '23503') {
      // Foreign key violation
      throw new NotFoundError('Application');
    }
    throw new DatabaseError('Failed to save document');
  }
};

export const getApplicationDocuments = async (
  applicationId: string
): Promise<Document[]> => {
  const pool = getDatabasePool();

  const result = await pool.query(
    'SELECT * FROM documents WHERE application_id = $1 ORDER BY created_at DESC',
    [applicationId]
  );

  return result.rows;
};

export const deleteDocument = async (
  documentId: string,
  userId: string
): Promise<void> => {
  const pool = getDatabasePool();

  try {
    // Verify document belongs to user's application
    const result = await pool.query(
      `SELECT d.*, a.user_id 
       FROM documents d
       JOIN applications a ON d.application_id = a.id
       WHERE d.id = $1`,
      [documentId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Document');
    }

    if (result.rows[0].user_id !== userId) {
      throw new ValidationError('Document does not belong to user');
    }

    // Delete from database (S3 deletion would happen here too)
    await pool.query('DELETE FROM documents WHERE id = $1', [documentId]);

    logger.info('Document deleted:', { documentId, userId });
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ValidationError) {
      throw error;
    }
    logger.error('Failed to delete document:', error);
    throw new DatabaseError('Failed to delete document');
  }
};
