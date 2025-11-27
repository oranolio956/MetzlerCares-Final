export type Role = 'user' | 'assistant' | 'system' | 'model';

export interface ChatMessage {
  role: Role;
  text: string;
}

export type SessionKind = 'INTAKE' | 'COACH' | 'GLOBAL';

export interface SessionInfo {
  sessionId: string;
  type: SessionKind;
}

export interface ChatResponse {
  text: string;
  sources?: Array<{ title: string; uri: string }>;
  model?: string;
}
