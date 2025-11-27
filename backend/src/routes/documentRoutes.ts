import { Router } from 'express';
import {
  uploadDocument,
  getDocuments,
  removeDocument,
} from '../controllers/documentController.js';
import { authenticate } from '../middleware/auth.js';
import { param } from 'express-validator';
import { validate } from '../middleware/validator.js';
import multer from 'multer';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed. Allowed: ${allowedTypes.join(', ')}`));
    }
  },
});

// All document routes require authentication
router.use(authenticate);

// Upload document
router.post(
  '/applications/:applicationId/documents',
  validate([
    param('applicationId').isUUID().withMessage('Invalid application ID'),
  ]),
  upload.single('file'),
  uploadDocument
);

// Get application documents
router.get(
  '/applications/:applicationId/documents',
  validate([
    param('applicationId').isUUID().withMessage('Invalid application ID'),
  ]),
  getDocuments
);

// Delete document
router.delete(
  '/documents/:documentId',
  validate([
    param('documentId').isUUID().withMessage('Invalid document ID'),
  ]),
  removeDocument
);

export default router;
