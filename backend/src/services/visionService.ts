import { sendChatMessage } from './geminiService.js';
import { getDatabasePool } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { ValidationError, DatabaseError } from '../utils/errors.js';

export type ImageSize = '1K' | '2K' | '4K';

export interface GenerateImageInput {
  userId: string;
  prompt: string;
  size: ImageSize;
}

export interface VisionImage {
  id: string;
  userId: string;
  prompt: string;
  size: ImageSize;
  imageUrl: string;
  createdAt: Date;
}

// Map size to dimensions
const SIZE_DIMENSIONS: Record<ImageSize, { width: number; height: number }> = {
  '1K': { width: 1024, height: 1024 },
  '2K': { width: 2048, height: 2048 },
  '4K': { width: 4096, height: 4096 },
};

export const generateVisionImage = async (
  input: GenerateImageInput
): Promise<VisionImage> => {
  // Validate prompt
  if (!input.prompt || input.prompt.trim().length === 0) {
    throw new ValidationError('Prompt is required');
  }

  if (input.prompt.length > 1000) {
    throw new ValidationError('Prompt must be 1000 characters or less');
  }

  // In production, this would call Gemini's image generation API
  // For now, we'll use a placeholder that would integrate with the actual API
  // The actual implementation would be:
  // const client = getGeminiClient();
  // const model = client.models.getGenerativeModel({ model: 'imagen-3' });
  // const result = await model.generateImage({ prompt: input.prompt, size: SIZE_DIMENSIONS[input.size] });

  // Placeholder: Generate a unique image URL
  // In production, this would be an S3/CDN URL
  const imageUrl = `https://storage.secondwind.org/visions/${input.userId}/${Date.now()}.png`;

  // Save to database
  const pool = getDatabasePool();
  try {
    const result = await pool.query(
      `INSERT INTO vision_images (user_id, prompt, size, image_url)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [input.userId, input.prompt.trim(), input.size, imageUrl]
    );

    logger.info('Vision image generated:', {
      imageId: result.rows[0].id,
      userId: input.userId,
      size: input.size,
    });

    return {
      id: result.rows[0].id,
      userId: result.rows[0].user_id,
      prompt: result.rows[0].prompt,
      size: result.rows[0].size,
      imageUrl: result.rows[0].image_url,
      createdAt: result.rows[0].created_at,
    };
  } catch (error) {
    logger.error('Failed to save vision image:', error);
    throw new DatabaseError('Failed to save vision image');
  }
};

export const getUserVisionImages = async (
  userId: string,
  limit: number = 20
): Promise<VisionImage[]> => {
  const pool = getDatabasePool();

  const result = await pool.query(
    `SELECT * FROM vision_images 
     WHERE user_id = $1 
     ORDER BY created_at DESC 
     LIMIT $2`,
    [userId, limit]
  );

  return result.rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    prompt: row.prompt,
    size: row.size,
    imageUrl: row.image_url,
    createdAt: row.created_at,
  }));
};

export const deleteVisionImage = async (
  imageId: string,
  userId: string
): Promise<void> => {
  const pool = getDatabasePool();

  // Verify ownership
  const result = await pool.query(
    'SELECT * FROM vision_images WHERE id = $1',
    [imageId]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('Vision image');
  }

  if (result.rows[0].user_id !== userId) {
    throw new ValidationError('Vision image does not belong to user');
  }

  await pool.query('DELETE FROM vision_images WHERE id = $1', [imageId]);
  logger.info('Vision image deleted:', { imageId, userId });
};
