import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Donation, Notification, RequestItem, BeneficiaryProfile, Message } from '../types';

type UserType = 'donor' | 'beneficiary' | null;

interface IntakeSessionState {
  messages: Message[];
  mockState: string;
  hasStarted: boolean;
  hasConsent: boolean;
}

interface StoreContextType {
  isCalmMode: boolean;
  toggleCalmMode: () => void;
  isSoundEnabled: boolean;
  toggleSound: () => void;
  // Crisis Management
  isCrisisMode: boolean;
  setCrisisMode: (active: boolean) => void;
  // Legal & Auth
  showLegalDocs: boolean;
  setShowLegalDocs: (show: boolean) => void;
  authToken: string | null;
  // Data
  donations: Donation[];
  addDonation: (donation: Donation) => void;
  notifications: Notification[];
  addNotification: (type: 'success' | 'info' | 'error', message: string) => void;
  removeNotification: (id: string) => void;
  confettiTrigger: number;
  triggerConfetti: () => void;
  // Beneficiary State
  beneficiaryProfile: BeneficiaryProfile;
  submitIntakeRequest: (data: { type: string; details: string }) => void;
  verifyInsurance: (status: 'verified' | 'pending') => void;
  // Auth State (Simulated Backend)
  userType: UserType;
  isAuthenticated: boolean;
  login: (type: UserType) => void;
  logout: () => void;
  clearAllData: () => void;
  // Chat Persistence
  intakeSession: IntakeSessionState;
  updateIntakeSession: (updates: Partial<IntakeSessionState>) => void;
  resetIntakeSession: () => void;
}

const DEFAULT_BENEFICIARY: BeneficiaryProfile = {
  name: "Alex",
  daysSober: 42,
  nextMilestone: 60,
  insuranceStatus: 'pending', 
  requests: [
    { id: '1', type: 'Rent Assistance (October)', date: '2 days ago', status: 'reviewing' },
    { id: '2', type: 'Bus Pass (Monthly)', date: 'Sep 28, 2024', status: 'funded' },
    { id: '3', type: 'Work Laptop', date: 'Sep 15, 2024', status: 'action_needed', note: 'Upload Offer Letter' }
  ]
};

const DEFAULT_INTAKE_SESSION: IntakeSessionState = {
  messages: [],
  mockState: 'GREETING',
  hasStarted: false,
  hasConsent: false
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isCalmMode, setIsCalmMode] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isCrisisMode, setCrisisMode] = useState(false);
  const [showLegalDocs, setShowLegalDocs] = useState(false);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [beneficiaryProfile, setBeneficiaryProfile] = useState<BeneficiaryProfile>(DEFAULT_BENEFICIARY);
  const [userType, setUserType] = useState<UserType>(null);
  const [intakeSession, setIntakeSession] = useState<IntakeSessionState>(DEFAULT_INTAKE_SESSION);
  
  // Simulated Secure Session
  const [authToken, setAuthToken] = useState<string | null>(null);

  const toggleCalmMode = () => {
    setIsCalmMode(prev => {
      const newState = !prev;
      if (newState) {
        document.body.classList.add('calm-mode');
        addNotification('info', 'Calm Mode active. Reduced motion & contrast.');
      } else {
        document.body.classList.remove('calm-mode');
        addNotification('success', 'Standard Mode active.');
      }
      return newState;
    });
  };

  const toggleSound = () => {
    setIsSoundEnabled(prev => {
        const newState = !prev;
        addNotification('info', newState ? 'Audio System Online' : 'Audio Muted');
        return newState;
    });
  };

  const triggerConfetti = () => {
      if (!isCalmMode) {
        setConfettiTrigger(prev => prev + 1);
      }
  };

  const addDonation = (donation: Donation) => {
    setDonations(prev => [donation, ...prev]);
  };

  const submitIntakeRequest = (data: { type: string; details: string }) => {
    const newRequest: RequestItem = {
      id: `REQ-${Date.now().toString().slice(-4)}`,
      type: data.type,
      details: data.details,
      date: 'Just now',
      status: 'reviewing'
    };
    
    setBeneficiaryProfile(prev => ({
      ...prev,
      requests: [newRequest, ...prev.requests]
    }));

    addNotification('success', 'Application submitted to your Dashboard.');
    triggerConfetti();
  };

  const verifyInsurance = (status: 'verified' | 'pending') => {
    setBeneficiaryProfile(prev => ({ ...prev, insuranceStatus: status }));
    if (status === 'verified') {
        addNotification('success', 'Medicaid Verified. Peer Coaching Unlocked.');
        triggerConfetti();
    } else {
        addNotification('info', 'Insurance verification pending.');
    }
  };

  const addNotification = (type: 'success' | 'info' | 'error', message: string) => {
    const id = Date.now().toString() + Math.random().toString();
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Simulated Backend Auth Flow
  const login = (type: UserType) => {
    // In production, this would exchange credentials for a real JWT
    const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.simulated_token.${Date.now()}`;
    setAuthToken(mockToken);
    setUserType(type);
    triggerConfetti();
    addNotification('success', `Welcome back, ${type === 'donor' ? 'Partner' : 'Friend'}.`);
  };

  const logout = () => {
    setAuthToken(null);
    setUserType(null);
    addNotification('info', 'You have been logged out.');
  };

  const clearAllData = () => {
      setBeneficiaryProfile(DEFAULT_BENEFICIARY);
      setDonations([]);
      logout();
      resetIntakeSession();
      window.location.reload(); // Hard reset
  };

  const updateIntakeSession = (updates: Partial<IntakeSessionState>) => {
    setIntakeSession(prev => ({ ...prev, ...updates }));
  };

  const resetIntakeSession = () => {
    setIntakeSession(DEFAULT_INTAKE_SESSION);
  };

  return (
    <StoreContext.Provider value={{
      isCalmMode,
      toggleCalmMode,
      isSoundEnabled,
      toggleSound,
      isCrisisMode,
      setCrisisMode,
      showLegalDocs,
      setShowLegalDocs,
      authToken,
      donations,
      addDonation,
      notifications,
      addNotification,
      removeNotification,
      confettiTrigger,
      triggerConfetti,
      beneficiaryProfile,
      submitIntakeRequest,
      verifyInsurance,
      userType,
      isAuthenticated: !!authToken,
      login,
      logout,
      clearAllData,
      intakeSession,
      updateIntakeSession,
      resetIntakeSession
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};