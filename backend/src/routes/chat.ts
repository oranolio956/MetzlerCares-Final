import { Router } from 'express';
import { z } from 'zod';
import { runGeminiChat } from '../clients/gemini.js';
import type { ChatMessage, SessionInfo } from '../types/chat.js';
import { requireAuth } from '../middleware/auth.js';

const chatRequestSchema = z.object({
  message: z.object({
    role: z.literal('user'),
    text: z.string().min(1, 'message text is required'),
  }),
  session: z.object({
    sessionId: z.string().min(1, 'sessionId is required'),
    type: z.enum(['INTAKE', 'COACH', 'GLOBAL']).default('INTAKE'),
  }),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system', 'model']).default('user'),
        text: z.string().min(1),
      })
    )
    .default([]),
});

export const chatRouter = Router();

chatRouter.use(requireAuth);

chatRouter.post('/', async (req, res) => {
  const parsed = chatRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.format() });
  }

  const { message, session, history } = parsed.data;

  try {
    const response = await runGeminiChat(message as ChatMessage, session as SessionInfo, history as ChatMessage[]);
    return res.json({ response });
  } catch (error) {
    console.error('[chat] Error', error);
    return res.status(500).json({ error: 'Unable to process your request right now.' });
  }
});
