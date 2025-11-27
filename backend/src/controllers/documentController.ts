import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { AuthenticationError, NotFoundError, ValidationError } from '../utils/errors.js';
import { uploadFile, saveDocument, getApplicationDocuments, deleteDocument } from '../services/fileService.js';
import { getApplicationById } from '../services/applicationService.js';

// Upload document
export const uploadDocument = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const { applicationId } = req.params;
    const file = req.file;

    if (!file) {
      throw new ValidationError('No file provided');
    }

    // Verify application exists and belongs to user
    const application = await getApplicationById(applicationId);
    if (!application) {
      throw new NotFoundError('Application');
    }

    if (application.user_id !== req.user.userId) {
      throw new AuthenticationError('Application does not belong to user');
    }

    // Upload file
    const fileResult = await uploadFile(file, applicationId);

    // Save document record
    const document = await saveDocument(applicationId, fileResult);

    res.status(201).json({
      document: {
        id: document.id,
        fileName: document.file_name,
        fileType: document.file_type,
        fileSize: document.file_size,
        fileUrl: document.file_url,
        createdAt: document.created_at,
      },
    });
});

// Get application documents
export const getDocuments = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const { applicationId } = req.params;

    // Verify application belongs to user
    const application = await getApplicationById(applicationId);
    if (!application) {
      throw new NotFoundError('Application');
    }

    if (application.user_id !== req.user.userId) {
      throw new AuthenticationError('Application does not belong to user');
    }

    const documents = await getApplicationDocuments(applicationId);

    res.json({
      documents: documents.map((doc) => ({
        id: doc.id,
        fileName: doc.file_name,
        fileType: doc.file_type,
        fileSize: doc.file_size,
        fileUrl: doc.file_url,
        createdAt: doc.created_at,
      })),
    });
});

// Delete document
export const removeDocument = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const { documentId } = req.params;

    await deleteDocument(documentId, req.user.userId);

    res.json({
      message: 'Document deleted successfully',
    });
});
