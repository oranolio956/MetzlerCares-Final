
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Donation, Notification, RequestItem, BeneficiaryProfile } from '../types';

interface StoreContextType {
  isCalmMode: boolean;
  toggleCalmMode: () => void;
  isSoundEnabled: boolean;
  toggleSound: () => void;
  donations: Donation[];
  addDonation: (donation: Donation) => void;
  notifications: Notification[];
  addNotification: (type: 'success' | 'info' | 'error', message: string) => void;
  removeNotification: (id: string) => void;
  confettiTrigger: number;
  triggerConfetti: () => void;
  // New Beneficiary State
  beneficiaryProfile: BeneficiaryProfile;
  submitIntakeRequest: (data: { type: string; details: string }) => void;
}

const DEFAULT_BENEFICIARY: BeneficiaryProfile = {
  name: "Alex",
  daysSober: 42,
  nextMilestone: 60,
  requests: [
    { id: '1', type: 'Rent Assistance (October)', date: '2 days ago', status: 'reviewing' },
    { id: '2', type: 'Bus Pass (Monthly)', date: 'Sep 28, 2024', status: 'funded' },
    { id: '3', type: 'Work Laptop', date: 'Sep 15, 2024', status: 'action_needed', note: 'Upload Offer Letter' }
  ]
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isCalmMode, setIsCalmMode] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [beneficiaryProfile, setBeneficiaryProfile] = useState<BeneficiaryProfile>(DEFAULT_BENEFICIARY);

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

  const addNotification = (type: 'success' | 'info' | 'error', message: string) => {
    const id = Date.now().toString() + Math.random().toString();
    setNotifications(prev => [...prev, { id, type, message }]);
    
    // Auto remove
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <StoreContext.Provider value={{
      isCalmMode,
      toggleCalmMode,
      isSoundEnabled,
      toggleSound,
      donations,
      addDonation,
      notifications,
      addNotification,
      removeNotification,
      confettiTrigger,
      triggerConfetti,
      beneficiaryProfile,
      submitIntakeRequest
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
