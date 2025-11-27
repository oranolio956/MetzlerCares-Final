import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { generateGeminiImage } from '../clients/gemini.js';

const imageSchema = z.object({
  prompt: z.string().min(1, 'prompt is required'),
  size: z.enum(['1K', '2K', '4K']).default('1K'),
});

export const imagesRouter = Router();

imagesRouter.use(requireAuth);

imagesRouter.post('/', async (req, res) => {
  const parsed = imageSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.format() });
  }

  try {
    const image = await generateGeminiImage(parsed.data.prompt, parsed.data.size);
    return res.json({ image });
  } catch (error) {
    console.error('[images] generation error', error);
    return res.status(500).json({ error: 'Unable to generate image at this time.' });
  }
});
