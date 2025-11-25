
import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Lock, X, ChevronRight, CreditCard, Banknote, PenTool } from 'lucide-react';
import { Mascot } from './Mascot';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    label: string;
    sub: string;
    variant: any;
  };
  quantity: number;
  totalAmount: number;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, item, quantity, totalAmount }) => {
  const [step, setStep] = useState<'details' | 'processing' | 'success'>('details');
  const [note, setNote] = useState('');
  
  // Fake processing delay
  const handleExecute = () => {
    setStep('processing');
    setTimeout(() => {
      setStep('success');
    }, 2500);
  };

  // Reset on open
  useEffect(() => {
    if (isOpen) setStep('details');
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brand-navy/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className={`w-full max-w-2xl bg-white rounded-3xl shadow-2xl relative overflow-hidden flex flex-col transition-all duration-500 ${step === 'success' ? 'scale-105' : 'scale-100'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-brand-navy/5 bg-brand-cream">
          <div className="flex items-center gap-3">
             <div className="bg-brand-navy p-2 rounded-lg text-white">
               <ShieldCheck size={20} />
             </div>
             <span className="font-bold text-brand-navy">Secure Transaction</span>
          </div>
          <button onClick={onClose} className="text-brand-navy/40 hover:text-brand-navy transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-8 md:p-12 relative min-h-[400px] flex flex-col">
          
          {step === 'details' && (
            <div className="flex-1 flex flex-col animate-slide-up">
              <h3 className="font-display font-bold text-3xl text-brand-navy mb-2">Confirm Investment</h3>
              <p className="text-brand-navy/60 mb-8">You are funding <strong className="text-brand-navy">{quantity} units</strong> of <strong className="text-brand-teal">{item.label}</strong>.</p>
              
              <div className="bg-brand-cream border border-brand-navy/5 rounded-2xl p-6 mb-8 flex items-center justify-between">
                <div>
                   <span className="text-xs font-bold uppercase tracking-widest text-brand-navy/40">Total Amount</span>
                   <div className="text-4xl font-display font-bold text-brand-navy">${totalAmount.toFixed(2)}</div>
                </div>
                <div className="text-right">
                   <span className="text-xs font-bold uppercase tracking-widest text-brand-navy/40">Tax Deductible</span>
                   <div className="text-brand-teal font-bold flex items-center justify-end gap-1">
                      <CheckIcon /> Yes
                   </div>
                </div>
              </div>

              {/* Payment Method Tabs (Mock) */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                 <button className="flex items-center justify-center gap-2 py-4 border-2 border-brand-navy rounded-xl bg-brand-navy text-white font-bold shadow-md">
                    <CreditCard size={20} />
                    Card / Apple Pay
                 </button>
                 <button className="flex items-center justify-center gap-2 py-4 border-2 border-brand-navy/10 rounded-xl text-brand-navy/60 font-bold hover:bg-brand-cream hover:text-brand-navy transition-colors">
                    <Banknote size={20} />
                    Bank Transfer
                 </button>
              </div>

              {/* Optional Note */}
              <div className="mb-8">
                 <label className="text-xs font-bold uppercase tracking-widest text-brand-navy/40 mb-2 block flex items-center gap-2">
                    <PenTool size={12} />
                    Add a note (Optional)
                 </label>
                 <input 
                   type="text" 
                   value={note}
                   onChange={(e) => setNote(e.target.value)}
                   placeholder="e.g. For someone starting a new job..."
                   className="w-full border-b-2 border-brand-navy/10 bg-transparent py-2 text-brand-navy font-bold focus:border-brand-teal outline-none transition-colors"
                 />
              </div>

              <button 
                onClick={handleExecute}
                className="mt-auto w-full bg-brand-teal text-white font-bold py-4 rounded-xl shadow-[0_10px_20px_-5px_rgba(45,156,142,0.4)] hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              >
                Complete Transaction <ChevronRight />
              </button>
              
              <div className="mt-4 text-center">
                <span className="text-xs text-brand-navy/40 flex items-center justify-center gap-1">
                   <Lock size={10} />
                   Processed securely via Stripe. Funds go directly to vendor.
                </span>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center animate-slide-up">
               <div className="w-48 h-48 mb-6 relative">
                  <div className="absolute inset-0 bg-brand-teal/20 rounded-full animate-ping"></div>
                  <Mascot expression="thinking" className="relative z-10" />
               </div>
               <h3 className="font-display font-bold text-2xl text-brand-navy mb-2">Securing Funds...</h3>
               <p className="text-brand-navy/60 max-w-sm">
                 We are routing this directly to the {item.sub} vendor account. 
                 <br/>Creating ledger entry...
               </p>
            </div>
          )}

          {step === 'success' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center animate-slide-up">
               <div className="w-48 h-48 mb-6 relative">
                  <div className="absolute inset-0 bg-brand-yellow/20 rounded-full animate-pulse"></div>
                  <Mascot expression="celebration" className="relative z-10" />
               </div>
               <h3 className="font-display font-bold text-4xl text-brand-navy mb-2">You're Amazing!</h3>
               <p className="text-brand-navy/60 max-w-sm mb-8 text-lg">
                 The funds have been deployed. You just removed a real barrier for someone.
               </p>
               
               <div className="bg-brand-cream p-4 rounded-xl border border-brand-navy/10 w-full mb-8">
                  <p className="text-xs font-bold uppercase text-brand-navy/40 mb-1">Receipt ID</p>
                  <p className="font-mono font-bold text-brand-navy">#SW-{Math.floor(Math.random() * 99999)}</p>
               </div>

               <button 
                 onClick={onClose}
                 className="w-full bg-brand-navy text-white font-bold py-4 rounded-xl shadow-lg hover:bg-brand-teal transition-colors"
               >
                 Close & Return to Portfolio
               </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-brand-teal"><polyline points="20 6 9 17 4 12"></polyline></svg>
);
