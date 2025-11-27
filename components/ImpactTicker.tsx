import React, { useMemo } from 'react';
import { Activity, ArrowUpRight, CheckCircle2, Building2, Bus, Laptop, Check, HeartHandshake } from 'lucide-react';
import { useSound } from '../hooks/useSound';
import { useStore } from '../context/StoreContext';

const TICKER_ITEMS = [
  { id: 'm1', label: "Rent / Oxford House Union", amount: "$500.00", time: "2m ago", icon: Building2 },
  { id: 'm2', label: "Bus Pass / RTD Denver", amount: "$88.00", time: "5m ago", icon: Bus },
  { id: 'm3', label: "Laptop / TechReuse", amount: "$249.00", time: "12m ago", icon: Laptop },
  { id: 'm4', label: "ID Voucher / CO DMV", amount: "$35.00", time: "18m ago", icon: CheckCircle2 },
  { id: 'm5', label: "Rent / Hazelbrook", amount: "$450.00", time: "24m ago", icon: Building2 },
  { id: 'm6', label: "Work Boots / Boot Barn", amount: "$120.00", time: "32m ago", icon: Activity },
  { id: 'm7', label: "Grocery / King Soopers", amount: "$75.00", time: "45m ago", icon: Activity },
];

export const ImpactTicker: React.FC = () => {
  const { playSuccess } = useSound();
  const { addNotification, donations } = useStore();

  // Merge Real Donations with Mock Data
  const activeItems = useMemo(() => {
      // Convert real donations to ticker format
      const realItems = donations.map(d => ({
          id: d.id,
          label: d.itemLabel,
          amount: `$${d.amount.toFixed(2)}`,
          time: "Just now",
          icon: HeartHandshake, // Unique icon for user actions
          isReal: true
      }));
      
      // Combine: Real items first, then mock items
      return [...realItems, ...TICKER_ITEMS, ...TICKER_ITEMS]; // Duplicate mock items for infinite scroll illusion
  }, [donations]);

  const handleVerify = (item: any) => {
      playSuccess();
      if (item.isReal) {
          addNotification('success', `Verifying Your Impact: ${item.label}`);
      } else {
          addNotification('success', `Verified: ${item.label} (${item.amount})`);
      }
  };

  return (
    <div className="w-full bg-brand-navy border-b border-brand-teal/20 overflow-hidden h-10 flex items-center relative z-40">
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-brand-navy to-transparent z-10 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-brand-navy to-transparent z-10 pointer-events-none"></div>
      
      <div className="flex animate-slide-left hover:[animation-play-state:paused] whitespace-nowrap">
        {activeItems.map((item, idx) => (
          <button 
            key={`${item.id}-${idx}`} 
            onClick={() => handleVerify(item)}
            className={`flex items-center gap-2 px-6 border-r border-white/10 opacity-70 hover:opacity-100 hover:bg-white/5 transition-all cursor-pointer h-10 focus:outline-none focus:bg-white/10 ${item.isReal ? 'bg-brand-teal/10' : ''}`}
            title="Click to verify ledger entry"
          >
            <item.icon size={14} className={item.isReal ? "text-brand-yellow animate-pulse" : "text-brand-teal"} />
            <span className={`text-xs font-bold uppercase tracking-wider ${item.isReal ? "text-brand-yellow" : "text-brand-lavender"}`}>{item.label}</span>
            <span className="text-xs font-mono font-bold text-white">{item.amount}</span>
            <span className="text-[10px] font-bold text-brand-teal flex items-center gap-0.5">
               <ArrowUpRight size={10} /> {item.isReal ? "Processing" : "Live"}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};