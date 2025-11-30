import { Message } from "../types";

export type SessionType = "INTAKE" | "COACH" | "GLOBAL";
export interface SessionPayload {
  sessionId: string;
  type: SessionType;
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "https://secondwind-backend.onrender.com";

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
Windy: "okay, thanks for being honest. that does disqualify you from the housing grant (most landlord rules, not mine). but look—if you have medicaid, i can get you a peer coach to help navigate other housing options. do you have insurance?"`;

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
- Crisis? -> "Please call 988. You matter."`;

const generateSessionId = (prefix: string) =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? `${prefix}_${(crypto as Crypto).randomUUID()}`
    : `${prefix}_${Date.now()}`;

export const startIntakeSession = (): SessionPayload => ({
  sessionId: generateSessionId("sess"),
  type: "INTAKE",
});

export const startCoachSession = (): SessionPayload => ({
  sessionId: generateSessionId("sess_coach"),
  type: "COACH",
});

export const startGlobalSession = (): SessionPayload => ({
  sessionId: generateSessionId("sess_global"),
  type: "GLOBAL",
});

const toBackendHistory = (history: Message[]) =>
  history.map((m) => ({
    role: m.role === "model" ? "assistant" : "user",
    text: m.text,
  }));

const authHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

export interface LoginResponse {
  token: string;
  expiresIn: string;
}

export const loginToBackend = async (email: string, password: string): Promise<LoginResponse> => {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.error || "Unable to authenticate with backend");
  }

  return res.json();
};

export const sendMessageToGemini = async (
  message: string,
  session: SessionPayload,
  history: Message[] = [],
  token?: string
): Promise<{ text: string; sources?: Array<{ title: string; uri: string }> }> => {
  if (!token) {
    throw new Error("Missing authentication token. Please log in.");
  }

  const res = await fetch(`${API_BASE_URL}/api/chat`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      message: { role: "user", text: message },
      session,
      history: toBackendHistory(history),
    }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.error || "Chat request failed");
  }

  const data = await res.json();
  return data.response;
};

export const generateVisionImage = async (prompt: string, size: "1K" | "2K" | "4K", token?: string): Promise<string> => {
  if (!token) {
    throw new Error("Missing authentication token. Please log in.");
  }

  const res = await fetch(`${API_BASE_URL}/api/images`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ prompt, size }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.error || "Image generation failed");
  }

  const data = await res.json();
  return data.image;
};
