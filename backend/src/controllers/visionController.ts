import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { AuthenticationError, ValidationError } from '../utils/errors.js';
import {
  generateVisionImage,
  getUserVisionImages,
  deleteVisionImage,
} from '../services/visionService.js';
import { ImageSize } from '../services/visionService.js';

// Generate vision board image
export const generateImage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    // Only beneficiaries can generate vision images
    if (req.user.userType !== 'beneficiary') {
      throw new ValidationError('Only beneficiaries can generate vision images');
    }

    const { prompt, size = '1K' } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      throw new ValidationError('prompt is required and must be a string');
    }

    const validSizes: ImageSize[] = ['1K', '2K', '4K'];
    if (!validSizes.includes(size)) {
      throw new ValidationError(`size must be one of: ${validSizes.join(', ')}`);
    }

    const image = await generateVisionImage({
      userId: req.user.userId,
      prompt: prompt.trim(),
      size,
    });

    res.status(201).json({
      image: {
        id: image.id,
        prompt: image.prompt,
        size: image.size,
        imageUrl: image.imageUrl,
        createdAt: image.createdAt,
      },
    });
});

// Get user's vision images
export const getVisionHistory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    if (req.user.userType !== 'beneficiary') {
      throw new ValidationError('Only beneficiaries can access vision images');
    }

    const limit = parseInt(req.query.limit as string, 10) || 20;

    if (limit > 100) {
      throw new ValidationError('limit cannot exceed 100');
    }

    const images = await getUserVisionImages(req.user.userId, limit);

    res.json({
      images: images.map((img) => ({
        id: img.id,
        prompt: img.prompt,
        size: img.size,
        imageUrl: img.imageUrl,
        createdAt: img.createdAt,
      })),
    });
});

// Delete vision image
export const removeVisionImage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const { imageId } = req.params;

    await deleteVisionImage(imageId, req.user.userId);

    res.json({
      message: 'Vision image deleted successfully',
    });
});
