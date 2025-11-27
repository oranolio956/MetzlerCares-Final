import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { ValidationError, NotFoundError, AuthenticationError } from '../utils/errors.js';
import { sendChatMessage, ChatRequest } from '../services/geminiService.js';
import {
  createChatSession,
  getChatSession,
  getUserChatSessions,
  saveMessage,
  getConversationHistory,
  deleteChatSession,
} from '../services/chatService.js';
import { logger } from '../utils/logger.js';

// Create a new chat session
export const createSession = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const { sessionType } = req.body;

    if (!sessionType || (sessionType !== 'INTAKE' && sessionType !== 'COACH')) {
      throw new ValidationError('sessionType must be "INTAKE" or "COACH"');
    }

    // Check if user is beneficiary for coach sessions
    if (sessionType === 'COACH' && req.user.userType !== 'beneficiary') {
      throw new ValidationError('Only beneficiaries can create coach sessions');
    }

    const session = await createChatSession(req.user.userId, sessionType);

    res.status(201).json({
      session: {
        id: session.id,
        sessionType: session.session_type,
        createdAt: session.created_at,
        expiresAt: session.expires_at,
      },
    });
});

// Send a chat message
export const sendMessage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const { sessionId, message } = req.body;

    if (!sessionId || !message) {
      throw new ValidationError('sessionId and message are required');
    }

    if (typeof message !== 'string' || message.trim().length === 0) {
      throw new ValidationError('message must be a non-empty string');
    }

    // Get session and verify ownership
    const session = await getChatSession(sessionId);
    if (!session) {
      throw new NotFoundError('Chat session');
    }

    if (session.user_id !== req.user.userId) {
      throw new AuthenticationError('Session does not belong to user');
    }

    // Save user message
    await saveMessage(sessionId, 'user', message);

    // Get conversation history
    const history = await getConversationHistory(sessionId);
    const conversationHistory = history.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));

    // Send to Gemini
    const chatRequest: ChatRequest = {
      message,
      sessionId,
      sessionType: session.session_type,
      conversationHistory,
    };

    const response = await sendChatMessage(chatRequest);

    // Save AI response
    await saveMessage(sessionId, 'model', response);

    res.json({
      response,
      sessionId,
    });
});

// Get conversation history
export const getHistory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const { sessionId } = req.params;

    // Get session and verify ownership
    const session = await getChatSession(sessionId);
    if (!session) {
      throw new NotFoundError('Chat session');
    }

    if (session.user_id !== req.user.userId) {
      throw new AuthenticationError('Session does not belong to user');
    }

    const messages = await getConversationHistory(sessionId);

    res.json({
      session: {
        id: session.id,
        sessionType: session.session_type,
        createdAt: session.created_at,
      },
      messages: messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: msg.created_at,
      })),
    });
});

// Get user's chat sessions
export const getUserSessions = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const sessionType = req.query.type as 'INTAKE' | 'COACH' | undefined;

    const sessions = await getUserChatSessions(req.user.userId, sessionType);

    res.json({
      sessions: sessions.map((session) => ({
        id: session.id,
        sessionType: session.session_type,
        createdAt: session.created_at,
        expiresAt: session.expires_at,
      })),
    });
});

// Delete a chat session
export const deleteSession = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const { sessionId } = req.params;

    await deleteChatSession(sessionId, req.user.userId);

    res.json({
      message: 'Chat session deleted successfully',
    });
});
