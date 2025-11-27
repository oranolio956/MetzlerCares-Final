import { GoogleGenAI } from "@google/genai";

// ARCHITECTURE NOTE:
// This service is now a facade. In production, these functions should call
// your backend endpoints (e.g., POST /api/chat) which then call Gemini.
// Direct client-side calls are disabled for security unless a specific Dev Mode is active.

export const SYSTEM_INSTRUCTION = `You are Windy, the AI Intake Specialist for SecondWind, a Colorado non-profit funding recovery.
Your goal is to screen applicants for eligibility (Rent, Transit, Tech) in a friendly but efficient manner.
You represent a "tough love" but deeply caring persona.
Key qualifications:
1. Must be in Colorado.
2. Must be sober or seeking sobriety.
3. Funding goes to vendors (Oxford House, RTD), never cash to users.

If the user mentions suicide or self-harm, stop immediately and tell them to call 988.
Keep responses concise and conversational.`;

// --- MOCK BACKEND SIMULATION (For Frontend Demo Only) ---
const MOCK_DELAY = 800;

const mockBackendResponse = async (message: string, systemInstruction: string): Promise<string> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const lowerMsg = message.toLowerCase();
            
            // Crisis Detection (Simulated Backend Middleware)
            if (lowerMsg.includes('suicide') || lowerMsg.includes('kill myself') || lowerMsg.includes('hurt')) {
                resolve("I am stopping this conversation immediately because I am concerned for your safety. Please call 988 or 911 right now. We can handle the paperwork later. You matter.");
                return;
            }

            // Simple Decision Tree to simulate "Windy"
            if (systemInstruction.includes("Intake Case Manager") || systemInstruction.includes("Intake Specialist")) {
                 if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) return resolve("Hey there. I'm Windy. I handle the intake logistics so we can get you funded. First off, are you currently located in Colorado?");
                 if (lowerMsg.includes('yes') && lowerMsg.includes('colorado')) return resolve("Okay, good. Next question: Are you safe right now? Do you have a place to sleep tonight, or are you on the street?");
                 if (lowerMsg.includes('street') || lowerMsg.includes('homeless')) return resolve("I hear you. That's rough. We can help with sober living deposits. Do you have a specific Oxford House or facility in mind, or do you need a list?");
                 return resolve("I got that. Look, I need to be sure we're a good fit. Do you have Medicaid or any state insurance? That changes what funds I can unlock for you.");
            } else {
                 return resolve("I'm processing that through our secure coaching backend. Give me a moment to analyze your recovery trajectory... [Mock Response: Coach Pro would analyze career paths here].");
            }
        }, MOCK_DELAY);
    });
};

// --- CLIENT ---

export const startIntakeSession = (): any => {
  // In a real app, this would return a session ID from the server
  return {
    sessionId: `sess_${Date.now()}`,
    type: 'INTAKE'
  };
};

export const startCoachSession = (): any => {
    return {
        sessionId: `sess_coach_${Date.now()}`,
        type: 'COACH'
    };
};

export const sendMessageToGemini = async (message: string, session: any): Promise<string> => {
  try {
    // SECURITY CHECK: In production, use fetch() to your backend.
    // const response = await fetch('/api/chat', { method: 'POST', body: JSON.stringify({ message, sessionId: session.sessionId }) });
    // return await response.json();

    // FALLBACK: If API Key is present (Dev Mode), use SDK. Otherwise, use Mock.
    if (process.env.API_KEY) {
        try {
            // Re-instantiate for statelessness (simulating request scope)
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const modelName = session.type === 'COACH' ? 'gemini-3-pro-preview' : 'gemini-2.5-flash-lite';
            const instruction = session.type === 'COACH' 
                ? "You are a Recovery Coach." 
                : SYSTEM_INSTRUCTION;
            
            const model = ai.models.getGenerativeModel({ 
                model: modelName,
                systemInstruction: instruction
            });
            
            // Note: In a real stateless backend, you'd pass full history here.
            // For this demo, we just send the single prompt to show connectivity if key exists.
            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: message }] }]
            });
            return result.response.text();
        } catch (e) {
            console.warn("Direct SDK call failed, falling back to mock backend.", e);
            return await mockBackendResponse(message, session.type === 'COACH' ? "Coach" : "Intake Case Manager");
        }
    } else {
        // PRODUCTION / DEMO MODE (No Keys exposed)
        return await mockBackendResponse(message, session.type === 'COACH' ? "Coach" : "Intake Case Manager");
    }

  } catch (error) {
    console.error("Service Error:", error);
    return "I'm having trouble reaching the intake server. Please check your connection.";
  }
};

export const generateVisionImage = async (prompt: string, size: '1K' | '2K' | '4K'): Promise<string> => {
    // MOCK IMAGE GENERATION
    // Real backend would call: POST /api/generate-image
    return new Promise((resolve) => {
        setTimeout(() => {
            // Return a placeholder that looks cool
            resolve("https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=3506&auto=format&fit=crop"); 
        }, 1500);
    });
};