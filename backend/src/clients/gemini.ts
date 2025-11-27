import { GoogleGenAI } from '@google/genai';
import { config } from '../config.js';
import type { ChatMessage, ChatResponse, SessionInfo } from '../types/chat.js';

const FALLBACK_MODEL = 'gemini-2.0-flash-lite-preview-02-05';
const COACH_MODEL = 'gemini-3.0-pro';
const GLOBAL_MODEL = 'gemini-3.0-pro';

const SYSTEM_INSTRUCTIONS: Record<SessionInfo['type'], string> = {
  INTAKE:
    'You are Windy, an empathetic recovery advocate helping users understand funding eligibility. Keep responses concise, warm, and actionable.',
  COACH:
    'You are a supportive recovery coach. Offer encouragement and next steps without judgement.',
  GLOBAL:
    'You are an upbeat guide for the SecondWind platform. Provide helpful answers and route users to the right area when needed.',
};

if (!config.geminiApiKey) {
  throw new Error('[startup] GEMINI_API_KEY must be configured for Gemini access.');
}

const client = new GoogleGenAI({ apiKey: config.geminiApiKey as string });

const toParts = (message: ChatMessage) => [{ text: message.text }];

export const runGeminiChat = async (
  message: ChatMessage,
  session: SessionInfo,
  history: ChatMessage[] = []
): Promise<ChatResponse> => {
  const modelName =
    session.type === 'GLOBAL'
      ? GLOBAL_MODEL
      : session.type === 'COACH'
        ? COACH_MODEL
        : FALLBACK_MODEL;

  const chatHistory = history
    .filter((item) => item.text.trim().length > 0)
    .map((item) => ({
      role: item.role === 'assistant' ? 'model' : item.role,
      parts: toParts(item),
    }));

  // Use new chat API when available; fallback to basic generateContent
  if (client!.chats && client!.chats.create) {
    const chat = client!.chats.create({
      model: modelName,
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS[session.type],
      },
      history: chatHistory,
    });

    const response = await chat.sendMessage({ role: 'user', parts: toParts(message) });
    return {
      text: response.text(),
      sources: response.response?.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
        title: chunk.title ?? 'source',
        uri: chunk.uri ?? chunk.url ?? '',
      })),
      model: response.response?.candidates?.[0]?.model,
    };
  }

  const result = await client!.models.generateContent({
    model: modelName,
    systemInstruction: SYSTEM_INSTRUCTIONS[session.type],
    contents: [
      ...chatHistory,
      {
        role: 'user',
        parts: toParts(message),
      },
    ],
  });

  const text = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ?? result.response.text();
  return {
    text,
    sources: result.response?.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.title ?? 'source',
      uri: chunk.uri ?? chunk.url ?? '',
    })),
    model: result.response?.candidates?.[0]?.model,
  };
};

export const generateGeminiImage = async (prompt: string, size: '1K' | '2K' | '4K'): Promise<string> => {
  const result = await client!.models.generateContent({
    model: 'gemini-3.0-pro-vision',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      imageConfig: {
        aspectRatio: '16:9',
        imageSize: size,
      },
    },
  });

  const imagePart = result.response?.candidates?.[0]?.content?.parts?.find((part: any) => part.inlineData?.data);
  if (!imagePart?.inlineData?.data) {
    throw new Error('No image data returned from Gemini.');
  }

  const mimeType = imagePart.inlineData.mimeType || 'image/png';
  return `data:${mimeType};base64,${imagePart.inlineData.data}`;
};
