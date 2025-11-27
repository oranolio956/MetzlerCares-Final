import React from 'react';
import { Activity, ArrowUpRight, CheckCircle2, Building2, Bus, Laptop, Check } from 'lucide-react';
import { useSound } from '../hooks/useSound';
import { useStore } from '../context/StoreContext';

const TICKER_ITEMS = [
  { id: 1, label: "Rent / Oxford House Union", amount: "$500.00", time: "2m ago", icon: Building2 },
  { id: 2, label: "Bus Pass / RTD Denver", amount: "$88.00", time: "5m ago", icon: Bus },
  { id: 3, label: "Laptop / TechReuse", amount: "$249.00", time: "12m ago", icon: Laptop },
  { id: 4, label: "ID Voucher / CO DMV", amount: "$35.00", time: "18m ago", icon: CheckCircle2 },
  { id: 5, label: "Rent / Hazelbrook", amount: "$450.00", time: "24m ago", icon: Building2 },
  { id: 6, label: "Work Boots / Boot Barn", amount: "$120.00", time: "32m ago", icon: Activity },
  { id: 7, label: "Grocery / King Soopers", amount: "$75.00", time: "45m ago", icon: Activity },
];

export const ImpactTicker: React.FC = () => {
  const { playSuccess } = useSound();
  const { addNotification } = useStore();

  const handleVerify = (item: any) => {
      playSuccess();
      addNotification('success', `Verified: ${item.label} (${item.amount})`);
  };

  return (
    <div className="w-full bg-brand-navy border-b border-brand-teal/20 overflow-hidden h-10 flex items-center relative z-40">
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-brand-navy to-transparent z-10 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-brand-navy to-transparent z-10 pointer-events-none"></div>
      
      <div className="flex animate-slide-left hover:[animation-play-state:paused] whitespace-nowrap">
        {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => (
          <button 
            key={`${item.id}-${idx}`} 
            onClick={() => handleVerify(item)}
            className="flex items-center gap-2 px-6 border-r border-white/10 opacity-70 hover:opacity-100 hover:bg-white/5 transition-all cursor-pointer h-10 focus:outline-none focus:bg-white/10"
            title="Click to verify ledger entry"
          >
            <item.icon size={14} className="text-brand-teal" />
            <span className="text-xs font-bold text-brand-lavender uppercase tracking-wider">{item.label}</span>
            <span className="text-xs font-mono font-bold text-white">{item.amount}</span>
            <span className="text-[10px] font-bold text-brand-teal flex items-center gap-0.5">
               <ArrowUpRight size={10} /> Live
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};