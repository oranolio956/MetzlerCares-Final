import React from 'react';
import { ShieldCheck, Lock, ArrowDownLeft, FileText, ExternalLink, Filter } from 'lucide-react';
import { LedgerItem } from '../types';

const MOCK_LEDGER: LedgerItem[] = [
  { id: 'TX-9921', timestamp: 'Oct 24, 14:32', category: 'RENT', amount: 850.00, recipientHash: '0x8a...2b1', vendor: 'Oxford House', status: 'CLEARED' },
  { id: 'TX-9920', timestamp: 'Oct 24, 12:15', category: 'TRANSPORT', amount: 45.00, recipientHash: '0x3c...99a', vendor: 'City Metro Auth', status: 'CLEARED' },
  { id: 'TX-9919', timestamp: 'Oct 24, 10:05', category: 'TECH', amount: 249.99, recipientHash: '0x1f...d44', vendor: 'TechReuse Corp', status: 'PENDING' },
  { id: 'TX-9918', timestamp: 'Oct 23, 16:45', category: 'RENT', amount: 600.00, recipientHash: '0x9b...11x', vendor: 'SafeHaven Props', status: 'CLEARED' },
  { id: 'TX-9917', timestamp: 'Oct 23, 09:12', category: 'TRANSPORT', amount: 45.00, recipientHash: '0x2a...88p', vendor: 'City Metro Auth', status: 'CLEARED' },
  { id: 'TX-9916', timestamp: 'Oct 22, 11:30', category: 'TECH', amount: 199.50, recipientHash: '0x7e...22k', vendor: 'BestBuy Biz', status: 'CLEARED' },
];

export const TransparencyLedger: React.FC = () => {
  return (
    <div className="w-full max-w-5xl mx-auto">
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12">
         <div>
            <div className="flex items-center gap-2 text-brand-teal mb-4">
               <ShieldCheck size={24} />
               <span className="font-bold uppercase tracking-widest text-xs">Verified Ledger</span>
            </div>
            <h2 className="font-display font-bold text-5xl text-brand-navy leading-none">
              Open Books.
            </h2>
            <p className="text-brand-navy/60 text-lg mt-4 max-w-lg">
              Radical transparency. Every cent is tracked from donation to vendor payment in real-time.
            </p>
         </div>
         <div className="flex gap-4 mt-6 md:mt-0">
            <button className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-brand-navy/10 font-bold text-brand-navy hover:bg-brand-cream transition-colors">
               <FileText size={18} />
               Download CSV
            </button>
            <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-navy text-white font-bold hover:bg-brand-teal transition-colors shadow-lg">
               <ExternalLink size={18} />
               View Audit
            </button>
         </div>
      </div>

      {/* 2. The Swiss Table Card */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-brand-navy/5 overflow-hidden">
         
         {/* Filter Bar */}
         <div className="border-b border-brand-navy/5 p-6 flex items-center justify-between bg-brand-cream/30">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
               <span className="text-xs font-bold uppercase tracking-widest text-brand-navy/40">Live Feed</span>
            </div>
            <button className="text-brand-navy/40 hover:text-brand-navy transition-colors">
               <Filter size={20} />
            </button>
         </div>

         {/* Table Header */}
         <div className="grid grid-cols-12 gap-4 px-8 py-4 bg-white border-b border-brand-navy/5 text-xs font-bold uppercase tracking-widest text-brand-navy/30">
            <div className="col-span-2">Time</div>
            <div className="col-span-3">Vendor / Recipient</div>
            <div className="col-span-3">Category</div>
            <div className="col-span-2 text-right">Amount</div>
            <div className="col-span-2 text-right">Status</div>
         </div>

         {/* Table Body */}
         <div className="divide-y divide-brand-navy/5">
            {MOCK_LEDGER.map((item) => (
               <div key={item.id} className="grid grid-cols-12 gap-4 px-8 py-6 items-center hover:bg-brand-cream/50 transition-colors group cursor-default">
                  
                  {/* Time */}
                  <div className="col-span-2 flex flex-col">
                     <span className="font-mono font-bold text-brand-navy text-sm">{item.timestamp.split(',')[1]}</span>
                     <span className="text-xs text-brand-navy/40">{item.timestamp.split(',')[0]}</span>
                  </div>

                  {/* Vendor */}
                  <div className="col-span-3">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-navy/5 flex items-center justify-center text-brand-navy group-hover:bg-brand-navy group-hover:text-white transition-colors">
                           <ArrowDownLeft size={14} />
                        </div>
                        <div>
                           <span className="block font-bold text-brand-navy text-sm">{item.vendor}</span>
                           <span className="font-mono text-[10px] text-brand-navy/30">{item.id}</span>
                        </div>
                     </div>
                  </div>

                  {/* Category Badge */}
                  <div className="col-span-3">
                     <span className={`
                        inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                        ${item.category === 'RENT' ? 'bg-brand-coral/10 text-brand-coral' : 
                          item.category === 'TECH' ? 'bg-brand-teal/10 text-brand-teal' : 
                          'bg-brand-lavender/20 text-brand-navy'}
                     `}>
                        {item.category}
                     </span>
                  </div>

                  {/* Amount */}
                  <div className="col-span-2 text-right">
                     <span className="font-mono font-bold text-brand-navy text-lg tracking-tight">
                        ${item.amount.toFixed(2)}
                     </span>
                  </div>

                  {/* Status */}
                  <div className="col-span-2 text-right flex justify-end">
                     {item.status === 'CLEARED' ? (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-brand-teal bg-brand-teal/5 px-2 py-1 rounded-md">
                           <Check className="w-3 h-3" />
                           Cleared
                        </div>
                     ) : (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-brand-yellow bg-brand-yellow/10 px-2 py-1 rounded-md">
                           <div className="w-1.5 h-1.5 rounded-full bg-brand-yellow animate-ping"></div>
                           Pending
                        </div>
                     )}
                  </div>
               </div>
            ))}
         </div>

         {/* Footer */}
         <div className="p-6 bg-brand-cream/30 border-t border-brand-navy/5 text-center">
            <span className="text-xs font-bold text-brand-navy/30 uppercase tracking-widest">
               End of Live Record • Showing last 6 transactions
            </span>
         </div>
      </div>
      
      {/* Security Footer */}
      <div className="mt-8 flex justify-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
         <div className="flex items-center gap-2">
            <Lock size={14} className="text-brand-navy" />
            <span className="text-xs font-bold text-brand-navy">End-to-End Encryption</span>
         </div>
         <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-brand-navy" />
            <span className="text-xs font-bold text-brand-navy">SOC2 Compliant</span>
         </div>
      </div>

    </div>
  );
};

const Check = ({ className }: { className?: string }) => (
   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12"></polyline>
   </svg>
);