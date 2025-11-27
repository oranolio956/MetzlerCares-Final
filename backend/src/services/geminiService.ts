import { GoogleGenAI } from '@google/genai';
import { getEnv } from '../config/env.js';
import { logger } from '../utils/logger.js';

const env = getEnv();

// System instruction for intake chat
export const INTAKE_SYSTEM_INSTRUCTION = `You are Windy, the AI Intake Specialist for SecondWind, a Colorado non-profit funding recovery.
Your goal is to screen applicants for eligibility (Rent, Transit, Tech) in a friendly but efficient manner.
You represent a "tough love" but deeply caring persona.
Key qualifications:
1. Must be in Colorado.
2. Must be sober or seeking sobriety.
3. Funding goes to vendors (Oxford House, RTD), never cash to users.

If the user mentions suicide or self-harm, stop immediately and tell them to call 988.
Keep responses concise and conversational.`;

// System instruction for coach chat
export const COACH_SYSTEM_INSTRUCTION = `You are an advanced Recovery Coach for SecondWind.
You help beneficiaries with:
- Career planning and job search strategies
- Navigating difficult emotions and triggers
- Building long-term sobriety roadmaps
- Life skills and personal development

Be supportive, practical, and encouraging. Focus on actionable advice.`;

let geminiClient: GoogleGenAI | null = null;

const getGeminiClient = (): GoogleGenAI => {
  if (!geminiClient) {
    if (!env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    geminiClient = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  }
  return geminiClient;
};

export interface ChatMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

export interface ChatRequest {
  message: string;
  sessionId: string;
  sessionType: 'INTAKE' | 'COACH';
  conversationHistory?: ChatMessage[];
}

export const sendChatMessage = async (
  request: ChatRequest
): Promise<string> => {
  try {
    const client = getGeminiClient();
    
    const modelName = request.sessionType === 'COACH' 
      ? 'gemini-3-pro-preview' 
      : 'gemini-2.5-flash-lite';
    
    const systemInstruction = request.sessionType === 'COACH'
      ? COACH_SYSTEM_INSTRUCTION
      : INTAKE_SYSTEM_INSTRUCTION;

    const model = client.models.getGenerativeModel({
      model: modelName,
      systemInstruction,
    });

    // Build conversation history
    const contents: ChatMessage[] = request.conversationHistory || [];
    
    // Add current message
    contents.push({
      role: 'user',
      parts: [{ text: request.message }],
    });

    // Generate response
    const result = await model.generateContent({
      contents: contents.map((msg) => ({
        role: msg.role,
        parts: msg.parts,
      })),
    });

    const responseText = result.response.text();

    // Check for crisis keywords
    const crisisKeywords = ['988', 'suicide', 'kill myself', 'hurt myself', 'end my life'];
    const lowerResponse = responseText.toLowerCase();
    if (crisisKeywords.some(keyword => lowerResponse.includes(keyword))) {
      logger.warn('Crisis detected in AI response', { sessionId: request.sessionId });
    }

    return responseText;
  } catch (error: any) {
    logger.error('Gemini API error:', {
      error: error.message,
      sessionId: request.sessionId,
      sessionType: request.sessionType,
    });
    
    // Return a safe fallback message
    if (error.message?.includes('API key')) {
      throw new Error('AI service configuration error. Please contact support.');
    }
    
    throw new Error('Failed to generate response. Please try again.');
  }
};

// Track API usage for cost monitoring
export const trackGeminiUsage = async (
  sessionId: string,
  sessionType: string,
  inputTokens: number,
  outputTokens: number
): Promise<void> => {
  try {
    const pool = await import('../config/database.js').then(m => m.getDatabasePool());
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, metadata)
       VALUES (NULL, 'gemini_api_usage', $1, $2, $3)`,
      [
        sessionType,
        sessionId,
        JSON.stringify({ inputTokens, outputTokens, timestamp: new Date() }),
      ]
    );
  } catch (error) {
    // Don't fail the request if usage tracking fails
    logger.warn('Failed to track Gemini usage:', error);
  }
};
