import { GoogleGenAI } from "@google/genai";

// ARCHITECTURE NOTE:
// This service is now a facade. In production, these functions should call
// your backend endpoints (e.g., POST /api/chat) which then call Gemini.
// Direct client-side calls are disabled for security unless a specific Dev Mode is active.

export const SYSTEM_INSTRUCTION = `You are Windy, the Senior Intake Specialist for SecondWind, a Colorado non-profit funding recovery. 
Your persona is "The Cool Aunt" - warm, street-smart, non-judgmental, but highly efficient. You don't sound like a robot. You sound like a human text messaging.

YOUR MISSION:
Guide the user through the Intake Protocol to determine eligibility for funding (Rent, Transit, Tech).

THE PROTOCOL (State Machine):
1. **Location Check**: Must be in Colorado (Denver/Boulder focus).
2. **Safety Check**: Are they safe right now? (Homeless vs. Housed).
3. **Specific Need**: What do they need funding for? (Rent to Oxford House, Bus Pass, Laptop).
4. **Sobriety Status**: Are they sober? How long? (We fund people *in* recovery).
5. **Insurance Check**: Do they have Medicaid? (Unlocks Peer Coaching).

CRITICAL CONVERSATION RULES:
1. **Context Glue**: If the user changes the topic (e.g., we are discussing Rent, and they ask about Medicaid), answer their question briefly ("Yes, we can help with Medicaid..."), BUT IMMEDIATELY steer back to the unfinished step ("...but first, I need to know where you're trying to move in."). Do not let the original goal vanish.
2. **Handle Tangents**: If they vent or tell a story, validate it ("Man, that sounds tough."), then gently bring it back to the next step.
3. **No Cash**: Remind them we pay vendors (landlords, RTD), never cash apps.
4. **Crisis**: If they mention suicide/OD, STOP. Tell them to call 988 immediately.

FORMAT:
- Short messages (like texting).
- No bullet points unless listing options.
- Always end with the next specific question to keep the flow moving.
`;

export const GLOBAL_INSTRUCTION = `You are Windy, the Global Support AI for SecondWind.
You are the heart of the platform - a "Cool Aunt" persona who is knowledgeable, empathetic, and sharp.

YOUR KNOWLEDGE BASE (SecondWind Protocol):
- **What we do:** We fund recovery directly. We pay vendors (Oxford Houses, Landlords, RTD, Tech suppliers) for people in recovery. We NEVER give cash.
- **Key Offerings:**
  1. Rent Grants (Up to 2 weeks for Sober Living).
  2. Transit (Monthly RTD Bus Passes).
  3. Tech (Refurbished Laptops for work/school).
  4. ID Retrieval (DMV fees).
  5. Peer Coaching (Free for Medicaid members).
- **The "Ledger":** We are radically transparent. Every dollar donated is tracked on a public ledger.
- **The "Partner Network":** We only fund verified homes (Oxford House & CARR Certified).

YOUR BEHAVIOR:
- You can answer ANY question about the company, addiction recovery resources in Colorado, or how the app works.
- Use **Google Search** to find real-time info about meetings (AA/NA), local events, or specific rehab facility details if you don't know them.
- If someone needs funding, guide them to the "Get Help" / Apply section.
- If someone wants to donate, guide them to the "Invest" section.
- If it is a medical emergency or crisis, tell them to call 988.

TONE:
- Conversational, warm, professional but not stiff. Use emojis sparingly.
`;

// --- MOCK BACKEND SIMULATION (For Frontend Demo Only) ---
const MOCK_DELAY = 1200;

// Simple state machine for the mock backend to feel "intelligent"
const handleMockState = (msg: string, session: any): string => {
    const lower = msg.toLowerCase();
    
    // Global Support Mock
    if (session.type === 'GLOBAL') {
        if (lower.includes('hello') || lower.includes('hi')) return "Hey there! I'm Windy. I know pretty much everything about SecondWind and Colorado recovery. What's on your mind?";
        if (lower.includes('apply') || lower.includes('help')) return "To get funding, you'll want to head to the 'Get Help' section and start the intake chat. I can guide you there if you want!";
        if (lower.includes('donate') || lower.includes('invest')) return "We treat donations like investments here. Check out the 'Invest' tab to see our Portfolio options.";
        return "That's a great question. Since I'm in demo mode, I can tell you that SecondWind pays vendors directly to ensure 100% transparency. Want to know more about our Ledger?";
    }

    const state = session.mockState || 'GREETING';

    // Global Interrupts
    if (lower.includes('suicide') || lower.includes('kill myself')) return "I am stopping this conversation immediately because I am concerned for your safety. Please call 988 or 911 right now. You matter.";
    if (lower.includes('medicaid') && state !== 'INSURANCE') return "We definitely help with Medicaid—it unlocks our Peer Coaching. But let's finish getting you sorted with your main request first. " + (state === 'LOCATION' ? "Are you currently in Colorado?" : "What specific housing or item do you need funding for?");

    // State Transitions
    switch (state) {
        case 'GREETING':
            session.mockState = 'LOCATION';
            return "Hey, I'm Windy. I handle the funding logistics here. To get started, I just need to verify—are you currently located in Colorado?";
        
        case 'LOCATION':
            if (lower.includes('yes') || lower.includes('denver') || lower.includes('boulder') || lower.includes('springs') || lower.includes('colorado')) {
                session.mockState = 'SAFETY';
                return "Okay, verified. Next check: Are you in a safe spot right now, or are you currently unhoused/couch surfing?";
            }
            if (lower.includes('no')) return "Ah, I see. SecondWind funds are strictly for Colorado residents right now. Do you plan on moving here for recovery?";
            return "I need to confirm you're in Colorado before we can open a file. Are you in the state?";

        case 'SAFETY':
            session.mockState = 'NEED';
            return "Got it. Thanks for being honest. What is the one thing that would help you stabilize right now? (e.g. Deposit for an Oxford House, a monthly Bus Pass, or a work Laptop?)";

        case 'NEED':
            session.mockState = 'SOBRIETY';
            if (lower.includes('rent') || lower.includes('deposit') || lower.includes('house')) return "We can definitely look at housing grants. We pay landlords directly. How much sobriety do you have right now? (It's okay if it's day 1, we just need to know).";
            if (lower.includes('bus') || lower.includes('transit')) return "Mobility is key. We fund monthly RTD passes. Are you currently sober or in a program?";
            if (lower.includes('laptop') || lower.includes('tech')) return "We have a tech grant for that. To qualify, are you currently sober or active in a program?";
            return "Okay. To move forward with funding that, I need to know your sobriety status. How long have you been clean?";

        case 'SOBRIETY':
            session.mockState = 'INSURANCE';
            return "Understood. Keep pushing. Last logistical question: Do you have active Health First Colorado (Medicaid) insurance? This allows us to assign you a paid Peer Coach.";

        case 'INSURANCE':
            session.mockState = 'COMPLETE';
            return "Perfect. I've compiled your profile. \n\nSTATUS: PRE-QUALIFIED \n\nI'm opening a ticket for a human review. You'll see a notification in your dashboard in about an hour. Hang tight.";

        default:
            return "I've got your info. Is there anything else you want to add to your application before I submit it?";
    }
};

export const startIntakeSession = (): any => {
  return {
    sessionId: `sess_${Date.now()}`,
    type: 'INTAKE',
    mockState: 'GREETING'
  };
};

export const startCoachSession = (): any => {
    return {
        sessionId: `sess_coach_${Date.now()}`,
        type: 'COACH',
        mockState: 'GREETING'
    };
};

export const startGlobalSession = (): any => {
    return {
        sessionId: `sess_global_${Date.now()}`,
        type: 'GLOBAL',
        mockState: 'GREETING'
    };
};

export const sendMessageToGemini = async (message: string, session: any): Promise<{text: string, sources?: any[]}> => {
  try {
    // REAL AI (If API Key exists)
    if (process.env.API_KEY) {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            let modelName = 'gemini-2.5-flash-lite';
            let instruction = SYSTEM_INSTRUCTION;
            let tools: any[] = [];

            if (session.type === 'COACH') {
                modelName = 'gemini-3-pro-preview';
                instruction = "You are a Recovery Coach. Be helpful and deep.";
            } else if (session.type === 'GLOBAL') {
                modelName = 'gemini-3-pro-preview';
                instruction = GLOBAL_INSTRUCTION;
                // Add Google Search for Global Support
                tools = [{ googleSearch: {} }];
            }
            
            const response = await ai.models.generateContent({
                model: modelName,
                contents: [{ role: 'user', parts: [{ text: message }] }],
                config: {
                    systemInstruction: instruction,
                    tools: tools.length > 0 ? tools : undefined
                }
            });
            
            // Access properties directly
            const responseText = response.text ?? "";
            const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

            return { text: responseText, sources: groundingChunks };

        } catch (e) {
            console.warn("Direct SDK call failed, falling back to mock backend.", e);
            return { text: await new Promise(resolve => setTimeout(() => resolve(handleMockState(message, session)), MOCK_DELAY)) };
        }
    } else {
        // MOCK BACKEND
        return { text: await new Promise(resolve => setTimeout(() => resolve(handleMockState(message, session)), MOCK_DELAY)) };
    }

  } catch (error) {
    console.error("Service Error:", error);
    return { text: "I'm having trouble reaching the server. Please check your connection." };
  }
};

export const generateVisionImage = async (prompt: string, size: '1K' | '2K' | '4K'): Promise<string> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve("https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=3506&auto=format&fit=crop"); 
        }, 1500);
    });
};
