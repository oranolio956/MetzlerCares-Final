// Common types used throughout the application

export type UserType = 'donor' | 'beneficiary';

export type ApplicationStatus = 'reviewing' | 'approved' | 'action_needed' | 'funded' | 'rejected';

export type DonationStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';

export type TransactionStatus = 'PENDING' | 'CLEARED';

export type TransactionCategory = 'RENT' | 'TRANSPORT' | 'TECH';

export type ImpactType = 'commute' | 'home' | 'tech';

export type ChatSessionType = 'INTAKE' | 'COACH';

export type NotificationType = 'success' | 'info' | 'error';

export type PartnerComplianceStatus = 'pending' | 'approved' | 'rejected';

export type InsuranceStatus = 'verified' | 'pending' | 'none';

// Database entity types
export interface User {
  id: string;
  email: string;
  name: string | null;
  user_type: UserType;
  oauth_provider: string | null;
  oauth_id: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface Session {
  id: string;
  user_id: string;
  token: string;
  refresh_token: string | null;
  expires_at: Date;
  created_at: Date;
}

export interface Application {
  id: string;
  user_id: string;
  type: string;
  status: ApplicationStatus;
  details: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Donation {
  id: string;
  user_id: string;
  amount: number;
  impact_type: ImpactType;
  item_label: string | null;
  stripe_payment_intent_id: string | null;
  status: DonationStatus;
  created_at: Date;
}

export interface Transaction {
  id: string;
  donation_id: string | null;
  category: TransactionCategory;
  amount: number;
  vendor: string;
  recipient_hash: string | null;
  status: TransactionStatus;
  created_at: Date;
}

export interface Partner {
  id: string;
  name: string;
  address: string | null;
  ein: string | null;
  type: string | null;
  bed_count: number | null;
  monthly_rent: number | null;
  accepts_mat: boolean;
  has_naloxone: boolean;
  has_insurance: boolean;
  is_rra_member: boolean;
  compliance_status: PartnerComplianceStatus | null;
  stripe_subscription_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface ChatSession {
  id: string;
  user_id: string;
  session_type: ChatSessionType;
  created_at: Date;
  expires_at: Date | null;
}

export interface Message {
  id: string;
  session_id: string;
  role: 'user' | 'model';
  content: string;
  created_at: Date;
}

export interface Document {
  id: string;
  application_id: string;
  file_url: string;
  file_name: string | null;
  file_type: string | null;
  file_size: number | null;
  created_at: Date;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, any> | null;
  created_at: Date;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  message: string;
  read: boolean;
  created_at: Date;
}

export interface BeneficiaryProfile {
  id: string;
  user_id: string;
  days_sober: number;
  next_milestone: number | null;
  insurance_status: InsuranceStatus | null;
  created_at: Date;
  updated_at: Date;
}

export interface Vendor {
  id: string;
  name: string;
  category: TransactionCategory | null;
  verified: boolean;
  created_at: Date;
  updated_at: Date;
}
