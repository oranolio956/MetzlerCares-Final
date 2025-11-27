
import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck, ArrowDownLeft, FileText, ExternalLink, Filter, Check, RefreshCw, Receipt } from 'lucide-react';
import { LedgerItem } from '../types';
import { useStore } from '../context/StoreContext';

const MOCK_LEDGER: LedgerItem[] = [
  { id: 'TX-9921', timestamp: 'Oct 24, 14:32', category: 'RENT', amount: 850.00, recipientHash: '0x8a...2b1', vendor: 'Oxford House', status: 'CLEARED' },
  { id: 'TX-9920', timestamp: 'Oct 24, 12:15', category: 'TRANSPORT', amount: 45.00, recipientHash: '0x3c...99a', vendor: 'City Metro Auth', status: 'CLEARED' },
  { id: 'TX-9919', timestamp: 'Oct 24, 10:05', category: 'TECH', amount: 249.99, recipientHash: '0x1f...d44', vendor: 'TechReuse Corp', status: 'PENDING' },
  { id: 'TX-9918', timestamp: 'Oct 23, 16:45', category: 'RENT', amount: 600.00, recipientHash: '0x9b...11x', vendor: 'SafeHaven Props', status: 'CLEARED' },
  { id: 'TX-9917', timestamp: 'Oct 23, 09:12', category: 'TRANSPORT', amount: 45.00, recipientHash: '0x2a...88p', vendor: 'City Metro Auth', status: 'CLEARED' },
  { id: 'TX-9916', timestamp: 'Oct 22, 11:30', category: 'TECH', amount: 199.50, recipientHash: '0x7e...22k', vendor: 'BestBuy Biz', status: 'CLEARED' },
  { id: 'TX-9915', timestamp: 'Oct 22, 09:15', category: 'RENT', amount: 750.00, recipientHash: '0x4a...33z', vendor: 'Oakwood Living', status: 'CLEARED' },
  { id: 'TX-9914', timestamp: 'Oct 21, 15:45', category: 'TRANSPORT', amount: 30.00, recipientHash: '0x1b...77q', vendor: 'Uber Health', status: 'CLEARED' },
];

const ReceiptCard: React.FC<{ item: LedgerItem; style: React.CSSProperties }> = ({ item, style }) => (
  <div 
    className="absolute bg-white p-4 w-48 shadow-lg border border-brand-navy/5 flex flex-col gap-2 rotate-1 hover:rotate-0 transition-transform duration-300 pointer-events-auto hover:z-50 hover:scale-105"
    style={{
        ...style,
        fontFamily: '"Space Grotesk", monospace',
        backgroundImage: 'radial-gradient(#1A2A3A 1px, transparent 0)',
        backgroundSize: '10px 10px',
        backgroundColor: '#fff',
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 5% 95%, 10% 100%, 15% 95%, 20% 100%, 25% 95%, 30% 100%, 35% 95%, 40% 100%, 45% 95%, 50% 100%, 55% 95%, 60% 100%, 65% 95%, 70% 100%, 75% 95%, 80% 100%, 85% 95%, 90% 100%, 95% 95%, 100% 100%)'
    }}
  >
    <div className="flex justify-between items-start border-b border-dashed border-brand-navy/20 pb-2">
        <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase text-brand-navy/40">VENDOR</span>
            <span className="text-xs font-bold text-brand-navy truncate max-w-[100px]">{item.vendor}</span>
        </div>
        <Receipt size={16} className="text-brand-teal opacity-50" />
    </div>
    <div className="flex justify-between items-end py-1">
        <span className="text-[10px] font-bold text-brand-navy/40">{item.category}</span>
        <span className="text-lg font-bold text-brand-navy">${item.amount.toFixed(2)}</span>
    </div>
    <div className="text-[8px] text-center font-mono text-brand-navy/30 pt-2 border-t border-dashed border-brand-navy/20">
        VERIFIED • {item.id}
    </div>
  </div>
);

const ReceiptStream: React.FC = () => {
    const [receipts, setReceipts] = useState<{ id: string; item: LedgerItem; x: number; y: number; speed: number; delay: number }[]>([]);
    
    useEffect(() => {
        // Generate floating receipts based on mock data
        const items = MOCK_LEDGER.map((item, i) => ({
            id: item.id,
            item,
            x: Math.random() * 80 + 10, // 10% to 90% width
            y: 120 + (i * 25), // Staggered start off-screen
            speed: 0.2 + Math.random() * 0.3,
            delay: i * 2
        }));
        setReceipts(items);
    }, []);

    return (
        <div className="relative w-full h-full overflow-hidden bg-brand-cream/50">
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#1A2A3A 1px, transparent 1px), linear-gradient(90deg, #1A2A3A 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            
            {/* Floating Receipts */}
            {receipts.map((r, i) => (
                <div 
                    key={r.id} 
                    className="absolute animate-float-up"
                    style={{
                        left: `${r.x}%`,
                        bottom: '-150px',
                        animation: `floatUp ${15 / r.speed}s linear infinite`,
                        animationDelay: `${r.delay}s`,
                        zIndex: Math.floor(r.speed * 10)
                    }}
                >
                    <ReceiptCard item={r.item} style={{ transform: `rotate(${Math.random() * 10 - 5}deg) scale(${0.8 + r.speed})` }} />
                </div>
            ))}
            
            <style>{`
                @keyframes floatUp {
                    0% { transform: translateY(0px) rotate(0deg); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { transform: translateY(-800px) rotate(10deg); opacity: 0; }
                }
            `}</style>

            {/* Overlay Gradient for depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-brand-cream via-transparent to-brand-cream pointer-events-none"></div>
        </div>
    );
};

export const TransparencyLedger: React.FC = () => {
  const [activeTx, setActiveTx] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Auto-refresh simulation
  useEffect(() => {
     const interval = setInterval(() => {
        setIsUpdating(true);
        setTimeout(() => setIsUpdating(false), 1000);
     }, 5000);
     return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-0">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12">
         <div>
            <div className="flex items-center gap-2 text-brand-teal mb-2 md:mb-4">
               <ShieldCheck size={24} />
               <span className="font-bold uppercase tracking-widest text-xs">Verified Ledger</span>
            </div>
            <h2 className="font-display font-bold text-3xl md:text-5xl text-brand-navy leading-none">Colorado Impact Ledger.</h2>
            <p className="text-brand-navy/60 text-base md:text-lg mt-4 max-w-lg">Radical transparency. Every cent is tracked from donation to vendor payment. <span className="font-bold text-brand-navy">The only public recovery audit in Colorado.</span></p>
         </div>
         <div className="flex gap-4 mt-6 md:mt-0 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-brand-navy/10 font-bold text-brand-navy hover:bg-brand-cream transition-colors text-sm"><FileText size={18} /> CSV</button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-navy text-white font-bold hover:bg-brand-teal transition-colors shadow-lg text-sm"><ExternalLink size={18} /> Audit</button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          
          {/* VISUAL RECEIPT STREAM (Replacing generic map) */}
          <div className="lg:col-span-3 bg-[#EAEBED] border-2 border-brand-navy/5 rounded-[2.5rem] h-64 md:h-96 relative overflow-hidden shadow-inner group">
             <div className="absolute top-6 left-6 z-10">
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full border border-brand-navy/10 shadow-sm">
                   <div className={`w-2 h-2 rounded-full bg-brand-teal ${isUpdating ? 'animate-ping' : ''}`}></div>
                   <span className="text-[10px] font-bold uppercase tracking-widest text-brand-navy">Live Transaction Stream</span>
                </div>
             </div>
             
             <ReceiptStream />
             
          </div>

          <div className="lg:col-span-3 bg-white rounded-[2.5rem] shadow-xl border border-brand-navy/10 overflow-hidden flex flex-col">
            
            <div className="border-b border-brand-navy/5 p-4 md:p-6 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full bg-green-500 ${isUpdating ? 'opacity-100' : 'opacity-50'}`}></div>
                  <span className="text-xs font-bold uppercase tracking-widest text-brand-navy/60">Live Feed</span>
                </div>
                <div className="flex gap-2">
                  <button className="text-brand-navy/40 hover:text-brand-navy transition-colors p-1"><RefreshCw size={16} className={isUpdating ? "animate-spin" : ""} /></button>
                  <button className="text-brand-navy/40 hover:text-brand-navy transition-colors p-1"><Filter size={16} /></button>
                </div>
            </div>

            <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-4 bg-white border-b border-brand-navy/5 text-[10px] font-bold uppercase tracking-widest text-brand-navy/30">
                <div className="col-span-2">Timestamp</div>
                <div className="col-span-3">Vendor / Recipient</div>
                <div className="col-span-3">Category</div>
                <div className="col-span-2 text-right">Amount</div>
                <div className="col-span-2 text-right">Status</div>
            </div>

            <div className="divide-y divide-brand-navy/5 max-h-[500px] overflow-y-auto custom-scrollbar">
                {MOCK_LEDGER.map((item, index) => (
                <div 
                   key={item.id} 
                   className={`grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-6 md:px-8 py-4 md:py-5 items-start md:items-center hover:bg-brand-cream/30 transition-colors group cursor-default ${activeTx === item.id ? 'bg-brand-teal/5 ring-1 ring-inset ring-brand-teal/20' : index % 2 === 0 ? 'bg-gray-50/30' : 'bg-white'}`} 
                   onMouseEnter={() => setActiveTx(item.id)} 
                   onMouseLeave={() => setActiveTx(null)}
                >
                    
                    <div className="col-span-2 flex justify-between md:block w-full">
                        <div className="md:hidden text-[10px] font-bold text-brand-navy/30 uppercase tracking-widest mb-1">Time</div>
                        <div>
                           <span className="font-mono font-bold text-brand-navy text-xs md:text-sm block">{item.timestamp.split(',')[1]}</span>
                           <span className="text-[10px] text-brand-navy/40">{item.timestamp.split(',')[0]}</span>
                        </div>
                        <div className="md:hidden text-right flex flex-col items-end">
                            <span className="font-mono font-bold text-brand-navy text-lg">${item.amount.toFixed(2)}</span>
                            {item.status === 'CLEARED' ? <span className="text-[10px] font-bold text-brand-teal flex items-center gap-1"><Check size={10} /> Cleared</span> : <span className="text-[10px] font-bold text-brand-yellow">Pending</span>}
                        </div>
                    </div>

                    <div className="col-span-3 mt-2 md:mt-0 w-full">
                         <div className="md:hidden text-[10px] font-bold text-brand-navy/30 uppercase tracking-widest mb-1">Vendor</div>
                         <div className="flex items-center gap-2 md:gap-3">
                            <div className="hidden md:flex w-8 h-8 rounded-full bg-brand-navy/5 items-center justify-center text-brand-navy/40 group-hover:bg-brand-navy group-hover:text-white transition-colors shrink-0"><ArrowDownLeft size={14} /></div>
                            <div className="text-left">
                               <span className="block font-bold text-brand-navy text-sm">{item.vendor}</span>
                               <span className="font-mono text-[10px] text-brand-navy/30 hidden md:block">{item.id}</span>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-3 flex justify-between md:justify-start items-center mt-2 md:mt-0 w-full">
                        <div className="md:hidden text-[10px] font-bold text-brand-navy/30 uppercase tracking-widest">Category</div>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${item.category === 'RENT' ? 'bg-brand-coral/5 border-brand-coral/20 text-brand-coral' : item.category === 'TECH' ? 'bg-brand-teal/5 border-brand-teal/20 text-brand-teal' : 'bg-brand-lavender/10 border-brand-lavender/20 text-brand-navy'}`}>{item.category}</span>
                    </div>

                    <div className="col-span-2 text-right hidden md:block"><span className="font-mono font-bold text-brand-navy text-sm tracking-tight">${item.amount.toFixed(2)}</span></div>

                    <div className="col-span-2 text-right hidden md:flex justify-between md:justify-end items-center mt-2 md:mt-0 w-full border-t border-brand-navy/5 pt-3 md:border-0 md:pt-0">
                        <div className="md:hidden text-[10px] font-bold text-brand-navy/30 uppercase tracking-widest">Status</div>
                        {item.status === 'CLEARED' ? <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-brand-teal bg-brand-teal/5 px-2 py-1 rounded-md"><Check className="w-3 h-3" /> Cleared</div> : <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-brand-yellow bg-brand-yellow/10 px-2 py-1 rounded-md"><div className="w-1.5 h-1.5 rounded-full bg-brand-yellow animate-ping"></div> Pending</div>}
                    </div>
                </div>
                ))}
            </div>

            <div className="p-4 md:p-6 bg-gray-50/50 border-t border-brand-navy/5 text-center">
                <span className="text-[10px] md:text-xs font-bold text-brand-navy/30 uppercase tracking-widest flex items-center justify-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-teal"></div> End of Live Record</span>
            </div>
          </div>
      </div>
    </div>
  );
};
