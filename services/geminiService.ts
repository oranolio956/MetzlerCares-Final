import { GoogleGenAI, Chat, Content, Part } from "@google/genai";

// Safe access to API_KEY to prevent ReferenceError in browsers where 'process' is not global
const getApiKey = () => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
    // Fallback for browser polyfills attached to window
    if (typeof window !== 'undefined' && (window as any).process && (window as any).process.env) {
      return (window as any).process.env.API_KEY;
    }
  } catch (e) {
    // ignore
  }
  return '';
};

// Lazy initialization
let ai: GoogleGenAI | null = null;

const getAiClient = () => {
  if (!ai) {
    const key = getApiKey();
    if (!key) console.warn("Gemini API Key missing");
    ai = new GoogleGenAI({ apiKey: key });
  }
  return ai;
};

const SYSTEM_INSTRUCTION = `
You are "Windy", a friendly, empathetic, yet professional digital intake guide for "SecondWind", a non-profit organization helping people in recovery.

Your goal is to conduct a preliminary qualification chat for applicants seeking assistance (Rent, Bus Passes, Laptops, etc.).

TONE:
- Warm, encouraging, but not overly sappy.
- Professional and clear.
- Use simple language.
- act like a helpful character, slightly quirky but focused.

RULES:
1. Do not promise funds directly. Say "I can help get your application ready for review."
2. Ask one question at a time.
3. Keep responses short (under 40 words usually).
4. Required info to gather sequentially:
   - Name
   - Clean/Sober Date (Must be at least 30 days for most aid, but be gentle if less).
   - Current Living Situation (Sober living, homeless, apartment, etc.).
   - Specific Need (Rent, Bus pass, etc.).
5. If they ask for money directly to a bank account, politely explain we pay vendors/landlords directly.

After gathering the info, thank them and say you are submitting their profile to the human team.
`;

export const startIntakeSession = (restoredHistory?: Content[]): Chat => {
  const client = getAiClient();
  
  // Transform simplified history if needed or pass as is
  // The SDK expects Content[] which is { role: string, parts: Part[] }[]
  const validHistory = restoredHistory?.map(h => ({
    role: h.role,
    parts: h.parts
  })) || [];

  return client.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
    },
    history: validHistory
  });
};

export const sendMessageToGemini = async (message: string, chat: Chat): Promise<string> => {
  try {
    const result = await chat.sendMessage({ message });
    
    // Safety & Null Checks
    if (!result || !result.candidates || result.candidates.length === 0) {
        throw new Error("No response candidates returned");
    }

    const candidate = result.candidates[0];
    
    // Check for safety blocking
    if (candidate.finishReason === 'SAFETY') {
        return "I want to help, but I need to keep our conversation focused on your recovery needs and logistics. Could we rephrase that?";
    }

    // Access text via getter, but wrap in try/catch as getters can throw on some SDK versions if empty
    try {
        const text = result.text;
        if (text) return text;
    } catch (e) {
        // Fallback for parsing structure manually if getter fails
        if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
             const part = candidate.content.parts[0];
             if ('text' in part) return part.text as string;
        }
    }

    return "I'm having a little trouble connecting to the wind right now. Can you try again?";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Oops, a gust of wind interrupted me. Let's try that again.";
  }
};