
export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  isTyping?: boolean;
}

export enum IntakeStage {
  GREETING = 'GREETING',
  QUALIFICATION = 'QUALIFICATION',
  NEEDS_ASSESSMENT = 'NEEDS_ASSESSMENT',
  COMPLETED = 'COMPLETED'
}

export interface DonorProfile {
  name: string;
  impactType: 'shelter' | 'mobility' | 'tech' | 'wellness';
  amount: number;
}

export type ApplicationStatus = 'reviewing' | 'approved' | 'action_needed' | 'funded';

export interface RequestItem {
  id: string;
  type: string;
  date: string;
  status: ApplicationStatus;
  note?: string;
}

export interface BeneficiaryProfile {
  name: string;
  daysSober: number;
  nextMilestone: number;
  requests: RequestItem[];
}

export interface ImpactStory {
  id: string;
  beneficiary: string;
  action: string;
  outcome: string;
  date: string;
  type: 'commute' | 'home' | 'tech';
}

export interface DonorStats {
  totalInvested: number;
  livesImpacted: number;
  activeProjects: number;
  socialRoi: number;
}

export interface Notification {
  id: string;
  type: 'success' | 'info' | 'error';
  message: string;
}

export interface LedgerItem {
  id: string;
  timestamp: string;
  category: 'RENT' | 'TRANSPORT' | 'TECH';
  amount: number;
  recipientHash: string;
  vendor: string;
  status: 'CLEARED' | 'PENDING';
}

export interface PaymentDetails {
  cardNumber: string;
  expiry: string;
  cvc: string;
  name: string;
  note?: string;
}

export interface TransactionReceipt {
  id: string;
  timestamp: string;
  amount: number;
  item: string;
  quantity: number;
}
