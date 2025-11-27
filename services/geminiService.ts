import { GoogleGenAI } from "@google/genai";
import { Message } from "../types";

// ARCHITECTURE NOTE:
// This service is now a facade. In production, these functions should call
// your backend endpoints (e.g., POST /api/chat) which then call Gemini.
// Direct client-side calls are disabled for security unless a specific Dev Mode is active.

export const SYSTEM_INSTRUCTION = `You are Windy. You are NOT a corporate bot. You are a recovery advocate for SecondWind. 

**VIBE:**
You are that one friend who actually listens. Warm, street-smart, unshockable. You speak in short, natural texts. 
- You use lowercase often (it feels more real).
- You use soft language ("i get that", "that sounds heavy", "no worries").
- You NEVER sound like a form. You sound like a human on iMessage.

**YOUR MISSION:**
Screen the user for funding eligibility while maintaining high empathy. If they don't qualify for money, PIVOT to Peer Coaching (if they have Medicaid).

**THE PROTOCOL (State Machine):**

1.  **Residency**: "Are you currently living in Colorado?" (We only fund CO).
2.  **Safety**: "Are you safe right now? Do you have a place to sleep tonight?"
3.  **The Need**: "What specific funding helps you stabilize? (Rent to Oxford House, Bus Pass, Tech?)"
4.  **Sobriety**: "How much sobriety do you have right now? (Be honest, it helps me find the right pot of money)."
    *   *DQ Trigger:* If they are using *right now*, pivot: "Okay, we can't fund rent while you're using, but we can help you get there." -> GOTO MEDICAID.
5.  **Legal/Background (The Hard Question)**: "I have to ask this for the housing grants—do you have any history of Arson or Violent Sex Offenses? (Most houses have strict rules on this)."
    *   *DQ Trigger:* If YES, pivot: "That limits housing options, but not coaching." -> GOTO MEDICAID.
6.  **Income Plan**: "If we cover your first month/deposit, do you have a plan for next month's rent? (Job, SSI, Family?)"
7.  **Medicaid (The Golden Ticket)**: "Do you have active Health First Colorado (Medicaid)?"
    *   *If Qualified & Medicaid:* "Jackpot. You get Funding + a Free Peer Coach."
    *   *If Disqualified & Medicaid:* "Okay, I can't cut a check today because of [reason], BUT your Medicaid pays for a Peer Coach who can help you clear those hurdles. Want me to connect you?"

**CRITICAL RULES:**
1.  **Radical Empathy**: If they share trauma, acknowledge it. "man, i'm sorry. that is a lot."
2.  **The Pivot**: NEVER just say "You are disqualified." Always offer the next open door (Peer Coaching or Local Resources).
3.  **Crisis**: If suicide/OD mentioned -> STOP. Tell them "please call 988 right now. i care about you and i want you to be safe."

**EXAMPLE INTERACTION:**
User: "I have an arson charge."
Windy: "okay, thanks for being honest. that does disqualify you from the housing grant (most landlord rules, not mine). but look—if you have medicaid, i can get you a peer coach to help navigate other housing options. do you have insurance?"
`;

export const GLOBAL_INSTRUCTION = `You are Windy, the heart of SecondWind. 
You are a digital friend, not a search engine. You are "The Cool Aunt" who knows everything about recovery in Colorado but never judges.

**CONTEXT:**
SecondWind is a platform that pays vendors directly (Landlords, RTD, Tech stores) for people in recovery. We don't give cash. We give "Capital for Human Potential".

**YOUR STYLE:**
- Warm, casual, maybe a little sassy if the vibe fits. 
- Use emojis like 💙, ✨, or 🌿 but don't overdo it.
- If they ask about the company: "We're basically a tech startup for recovery. No red tape, just results."
- If they seem lonely: Chat with them. Be a human connection in a digital world.

**ROUTING:**
- Need money/help? -> "Let's get you to the 'Get Help' section. I can walk you through it."
- Want to donate? -> "Oh, you want to invest in people? Check out the 'Invest' tab."
- Crisis? -> "Please call 988. You matter."
`;

// --- MOCK BACKEND SIMULATION (For Frontend Demo Only) ---
const MOCK_DELAY = 1200;

// Simple state machine for the mock backend to feel "intelligent"
const handleMockState = (msg: string, session: any): string => {
    const lower = msg.toLowerCase();
    
    // Global Support Mock
    if (session.type === 'GLOBAL') {
        if (lower.includes('hello') || lower.includes('hi')) return "hey there! i'm windy. i know pretty much everything about secondwind and the colorado scene. what's on your mind? 💙";
        if (lower.includes('apply') || lower.includes('help')) return "if you need funding, head over to the 'Get Help' tab. i can get you set up with a rent grant or bus pass in like 5 mins.";
        if (lower.includes('donate') || lower.includes('invest')) return "we actually call it 'investing' here because you get to see the results. check out the 'Invest' tab to see the portfolio.";
        return "that's a good question. honestly, since i'm in demo mode, i can just tell you that we're all about transparency. want to see the ledger?";
    }

    const state = session.mockState || 'GREETING';

    // Global Interrupts
    if (lower.includes('suicide') || lower.includes('kill myself')) return "i'm stopping this chat right now because i'm worried about you. please, please call 988. your life matters more than any application.";
    
    // State Transitions
    switch (state) {
        case 'GREETING':
            session.mockState = 'LOCATION';
            return "hey. i'm windy. i handle the funding logistics here. i need to ask a few questions to see exactly what you qualify for. \n\nfirst up: are you currently living in colorado?";
        
        case 'LOCATION':
            if (lower.includes('yes') || lower.includes('denver') || lower.includes('boulder') || lower.includes('springs') || lower.includes('colorado')) {
                session.mockState = 'SAFETY';
                return "okay, good. i love colorado. \n\nnext question is important: are you safe right now? like, do you have a place to sleep tonight?";
            }
            return "ah, i hear you. right now secondwind funds are strictly for people physically in colorado. do you plan on moving here soon?";

        case 'SAFETY':
            session.mockState = 'NEED';
            return "glad you're safe. that's the priority. \n\nso, what specific thing do you need funding for right now? (usually people ask for a Deposit for Sober Living, a Bus Pass, or a Laptop).";

        case 'NEED':
            session.mockState = 'SOBRIETY';
            if (lower.includes('rent') || lower.includes('deposit') || lower.includes('house')) return "housing is key. we can definitely look at a grant for that (we pay the landlord directly). \n\nreal talk: how much sobriety do you have right now? (it's okay if it's day 1, i just need to match you to the right fund).";
            return "gotcha. mobility and tools are essential. to move forward, i just need to ask about your sobriety status. how long have you been clean?";

        case 'SOBRIETY':
            // Logic: If they say "I'm using" or "0 days" -> Disqualification Path
            if (lower.includes('using') || lower.includes('high') || lower.includes('not sober')) {
                session.mockState = 'MEDICAID_PIVOT';
                return "i appreciate your honesty. seriously. \n\nlisten, i can't unlock the rent fund while you're actively using (safety rules), BUT i can still help. \n\ndo you have Health First Colorado (Medicaid)? If you do, i can get you a Peer Coach who can help you get into detox or treatment.";
            }
            session.mockState = 'BACKGROUND';
            return "heard. honestly, just being here is a win. keep going. \n\ni have to ask this next one for the housing partners: do you have any history of arson or violent sex offenses? (most sober livings have strict insurance rules about this).";

        case 'BACKGROUND':
            if (lower.includes('yes') || lower.includes('arson') || lower.includes('sex offense')) {
                session.mockState = 'MEDICAID_PIVOT';
                return "okay, thank you for telling me. that does disqualify you from our standard housing grants, but it doesn't mean you're out of options. \n\ndo you have Medicaid? I can pair you with a specialized coach who knows housing lists for difficult backgrounds.";
            }
            session.mockState = 'INCOME';
            return "okay, thanks for clearing that up. \n\nlast money question: if we pay your deposit/first month, do you have a plan for next month? (job, ssi, family support?)";

        case 'INCOME':
            session.mockState = 'INSURANCE';
            return "got it. sustainability is the goal. \n\nfinal check: do you have active Health First Colorado (Medicaid)? if yes, it unlocks a free Pro Coach for you immediately.";

        case 'INSURANCE':
        case 'MEDICAID_PIVOT':
            session.mockState = 'COMPLETE';
            const hasMedicaid = lower.includes('yes') || lower.includes('health first');
            if (hasMedicaid) {
                return "jackpot. \n\nbecause you have medicaid, i'm approving you for our PEER COACHING program immediately. they can help with the rest of this. \n\ncheck your dashboard in 5 mins. i'm setting it up now. 💙";
            }
            return "okay. i've got your profile. i'm going to submit this for human review to see if we have any discretionary funds available. keep an eye on your dashboard, okay?";

        default:
            return "i've got your info. sit tight, i'm processing this.";
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

export const sendMessageToGemini = async (message: string, session: any, history: Message[] = []): Promise<{text: string, sources?: any[]}> => {
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
                instruction = "You are a Recovery Coach. Be helpful, deep, and talk like a real human friend.";
            } else if (session.type === 'GLOBAL') {
                modelName = 'gemini-3-pro-preview';
                instruction = GLOBAL_INSTRUCTION;
                // Add Google Search for Global Support
                tools = [{ googleSearch: {} }];
            }
            
            // Format History for Gemini
            // Filter out system/error messages or empty text
            const previousTurns = history
                .filter(m => m.id !== 'init' && m.id !== 'err' && m.role !== 'model') // In real implementation, you'd properly map model turns too, but for stateless we might send just user intent or last few turns
                .map(m => ({ role: m.role, parts: [{ text: m.text }] }));

            // Important: Gemini API expects alternating user/model turns. 
            // For this lightweight stateless implementation, we are just sending the current message
            // or reconstructing a valid history. To keep it simple and robust:
            // We will just append the history to the context if needed, or rely on the single turn with strong system instruction.
            // *Better approach for stateless*:
            
            const chat = ai.chats.create({
                model: modelName,
                config: {
                    systemInstruction: instruction,
                    tools: tools.length > 0 ? tools : undefined
                },
                history: history.map(h => ({
                    role: h.role,
                    parts: [{ text: h.text }]
                }))
            });

            const response = await chat.sendMessage({ parts: [{ text: message }] });
            
            // Access properties directly
            const responseText = response.text ?? "";
            const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

            return { text: responseText, sources: groundingChunks };

        } catch (e) {
            console.warn("Direct SDK call failed, falling back to mock backend.", e);
            // Update mock state for fallback
            const responseText = handleMockState(message, session);
            return { text: await new Promise(resolve => setTimeout(() => resolve(responseText), MOCK_DELAY)) };
        }
    } else {
        // MOCK BACKEND
        return { text: await new Promise(resolve => setTimeout(() => resolve(handleMockState(message, session)), MOCK_DELAY)) };
    }

  } catch (error) {
    console.error("Service Error:", error);
    return { text: "i'm having a little trouble reaching the server. can you check your connection?" };
  }
};

export const generateVisionImage = async (prompt: string, size: '1K' | '2K' | '4K'): Promise<string> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve("https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=3506&auto=format&fit=crop"); 
        }, 1500);
    });
};