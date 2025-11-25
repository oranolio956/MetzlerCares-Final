
import React, { useEffect, useState } from 'react';
import { CheckCircle2, Info, XCircle, X } from 'lucide-react';
import { Notification } from '../types';

interface NotificationSystemProps {
  notifications: Notification[];
  removeNotification: (id: string) => void;
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({ notifications, removeNotification }) => {
  return (
    <div className="fixed bottom-24 md:bottom-8 left-0 right-0 z-[100] flex flex-col items-center gap-3 pointer-events-none px-4">
      {notifications.map((note) => (
        <div 
          key={note.id}
          className="pointer-events-auto bg-brand-navy text-white px-6 py-4 rounded-2xl shadow-2xl border-2 border-brand-teal flex items-center gap-4 animate-slide-up max-w-md w-full md:w-auto"
        >
          {note.type === 'success' && <CheckCircle2 className="text-brand-teal shrink-0" />}
          {note.type === 'info' && <Info className="text-brand-lavender shrink-0" />}
          {note.type === 'error' && <XCircle className="text-brand-coral shrink-0" />}
          
          <p className="font-bold text-sm grow">{note.message}</p>
          
          <button 
            onClick={() => removeNotification(note.id)}
            className="text-white/40 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      ))}
    </div>
  );
};
