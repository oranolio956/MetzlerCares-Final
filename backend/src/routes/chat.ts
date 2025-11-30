import { Router } from 'express';
import { z } from 'zod';
import { runGeminiChat } from '../clients/gemini.js';
import type { ChatMessage, SessionInfo } from '../types/chat.js';
import { requireAuth } from '../middleware/auth.js';
import { pool } from '../database.js';

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
  const userId = req.user?.userId;

  try {
    // Get or create session in database
    let sessionRecord = await pool.query(
      'SELECT id, messages, state FROM chat_sessions WHERE session_id = $1 AND user_id = $2',
      [session.sessionId, userId]
    );

    let sessionId: number;
    let currentMessages: ChatMessage[] = [];
    let currentState: any = {};

    if (sessionRecord.rows.length > 0) {
      // Existing session
      sessionId = sessionRecord.rows[0].id;
      currentMessages = sessionRecord.rows[0].messages || [];
      currentState = sessionRecord.rows[0].state || {};
    } else {
      // Create new session
      const newSession = await pool.query(
        'INSERT INTO chat_sessions (session_id, user_id, type, messages, state) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [session.sessionId, userId, session.type, JSON.stringify(history), JSON.stringify({ mockState: 'GREETING' })]
      );
      sessionId = newSession.rows[0].id;
      currentMessages = history;
      currentState = { mockState: 'GREETING' };
    }

    // Add user message to history
    const updatedMessages = [
      ...currentMessages,
      { role: message.role, text: message.text, timestamp: new Date().toISOString() }
    ];

    // Get AI response
    const response = await runGeminiChat(message as ChatMessage, session as SessionInfo, updatedMessages);

    // Add AI response to history
    updatedMessages.push({
      role: 'assistant',
      text: response.response,
      timestamp: new Date().toISOString()
    });

    // Update session state (simplified for now)
    const newState = { ...currentState, lastActivity: new Date().toISOString() };

    // Save to database
    await pool.query(
      'UPDATE chat_sessions SET messages = $1, state = $2, updated_at = NOW() WHERE id = $3',
      [JSON.stringify(updatedMessages), JSON.stringify(newState), sessionId]
    );

    return res.json({ response: response.response });
  } catch (error) {
    console.error('[chat] Error', error);
    return res.status(500).json({ error: 'Unable to process your request right now.' });
  }
});
