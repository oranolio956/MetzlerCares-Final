import React, { useEffect, useRef, useState, useMemo } from 'react';
import { ShieldCheck, Lock, ArrowDownLeft, FileText, ExternalLink, Filter, MapPin, Globe, Check } from 'lucide-react';
import { LedgerItem } from '../types';
import { useStore } from '../context/StoreContext';

const MOCK_LEDGER: LedgerItem[] = [
  { id: 'TX-9921', timestamp: 'Oct 24, 14:32', category: 'RENT', amount: 850.00, recipientHash: '0x8a...2b1', vendor: 'Oxford House', status: 'CLEARED' },
  { id: 'TX-9920', timestamp: 'Oct 24, 12:15', category: 'TRANSPORT', amount: 45.00, recipientHash: '0x3c...99a', vendor: 'City Metro Auth', status: 'CLEARED' },
  { id: 'TX-9919', timestamp: 'Oct 24, 10:05', category: 'TECH', amount: 249.99, recipientHash: '0x1f...d44', vendor: 'TechReuse Corp', status: 'PENDING' },
  { id: 'TX-9918', timestamp: 'Oct 23, 16:45', category: 'RENT', amount: 600.00, recipientHash: '0x9b...11x', vendor: 'SafeHaven Props', status: 'CLEARED' },
  { id: 'TX-9917', timestamp: 'Oct 23, 09:12', category: 'TRANSPORT', amount: 45.00, recipientHash: '0x2a...88p', vendor: 'City Metro Auth', status: 'CLEARED' },
  { id: 'TX-9916', timestamp: 'Oct 22, 11:30', category: 'TECH', amount: 199.50, recipientHash: '0x7e...22k', vendor: 'BestBuy Biz', status: 'CLEARED' },
];

// --- WORLD MAP COMPONENT ---
const WorldMap: React.FC<{ activeTx: string | null }> = ({ activeTx }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isCalmMode } = useStore();

  // Simplified Dot Map Coords (Rough World Shape)
  const dots = useMemo(() => {
    const d = [];
    // North America
    for(let x=20; x<45; x+=2) for(let y=20; y<40; y+=2) if(Math.random()>0.3) d.push({x,y});
    // South America
    for(let x=30; x<45; x+=2) for(let y=50; y<80; y+=2) if(Math.random()>0.3) d.push({x,y});
    // Europe
    for(let x=50; x<65; x+=2) for(let y=20; y<35; y+=2) if(Math.random()>0.1) d.push({x,y});
    // Africa
    for(let x=50; x<70; x+=2) for(let y=40; y<70; y+=2) if(Math.random()>0.2) d.push({x,y});
    // Asia
    for(let x=65; x<90; x+=2) for(let y=20; y<50; y+=2) if(Math.random()>0.2) d.push({x,y});
    // Australia
    for(let x=80; x<95; x+=2) for(let y=65; y<80; y+=2) if(Math.random()>0.4) d.push({x,y});
    return d;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize Observer to handle window resizing cleanly
    const resizeObserver = new ResizeObserver(() => {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
    });
    resizeObserver.observe(container);

    const render = () => {
       ctx.clearRect(0, 0, canvas.width, canvas.height);
       
       const w = canvas.width;
       const h = canvas.height;
       
       // Draw Dots
       dots.forEach(dot => {
          const px = (dot.x / 100) * w;
          const py = (dot.y / 100) * h;
          
          ctx.beginPath();
          ctx.arc(px, py, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = isCalmMode ? '#1A2A3A' : 'rgba(26, 42, 58, 0.2)';
          ctx.fill();
       });

       // Draw Pulse if active
       if (activeTx && !isCalmMode) {
          const time = Date.now() / 1000;
          const targetDot = dots[Math.floor(time * 10) % dots.length];
          if (targetDot) {
            const px = (targetDot.x / 100) * w;
            const py = (targetDot.y / 100) * h;
            
            // Rings
            for(let i=0; i<3; i++) {
               ctx.beginPath();
               // Ensure positive radius
               const radius = Math.max(0.1, (i * 10) + 6 + (Math.sin(time * 5) * 4));
               
               ctx.arc(px, py, radius, 0, Math.PI * 2);
               ctx.strokeStyle = `rgba(45, 156, 142, ${1 - (i * 0.3)})`;
               ctx.lineWidth = 1;
               ctx.stroke();
            }
            
            // Center
            ctx.beginPath();
            ctx.arc(px, py, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#2D9C8E';
            ctx.fill();
          }
       }
    };

    const interval = setInterval(render, 50);
    return () => {
        clearInterval(interval);
        resizeObserver.disconnect();
    };

  }, [dots, activeTx, isCalmMode]);

  return (
    <div ref={containerRef} className="w-full h-full">
        <canvas 
        ref={canvasRef} 
        className="w-full h-full object-contain opacity-60 mix-blend-multiply"
        />
    </div>
  );
};

export const TransparencyLedger: React.FC = () => {
  const [activeTx, setActiveTx] = useState<string | null>(null);

  // Auto-cycle pulses for demo effect
  useEffect(() => {
     const interval = setInterval(() => {
        const randomTx = MOCK_LEDGER[Math.floor(Math.random() * MOCK_LEDGER.length)].id;
        setActiveTx(randomTx);
        setTimeout(() => setActiveTx(null), 2000);
     }, 3000);
     return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-0">
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12">
         <div>
            <div className="flex items-center gap-2 text-brand-teal mb-4">
               <ShieldCheck size={24} />
               <span className="font-bold uppercase tracking-widest text-xs">Verified Ledger</span>
            </div>
            <h2 className="font-display font-bold text-4xl md:text-5xl text-brand-navy leading-none">
              Open Books.
            </h2>
            <p className="text-brand-navy/60 text-lg mt-4 max-w-lg">
              Radical transparency. Every cent is tracked from donation to vendor payment in real-time.
            </p>
         </div>
         <div className="flex gap-4 mt-6 md:mt-0 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-brand-navy/10 font-bold text-brand-navy hover:bg-brand-cream transition-colors">
               <FileText size={18} />
               Download CSV
            </button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-navy text-white font-bold hover:bg-brand-teal transition-colors shadow-lg">
               <ExternalLink size={18} />
               Audit
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* MAP CARD */}
          <div className="lg:col-span-3 bg-brand-cream border-2 border-brand-navy/5 rounded-[2.5rem] h-64 md:h-96 relative overflow-hidden flex items-center justify-center shadow-inner">
             <div className="absolute top-6 left-6 z-10">
                <div className="flex items-center gap-2 bg-white/50 backdrop-blur px-3 py-1 rounded-full border border-brand-navy/5">
                   <Globe size={14} className="text-brand-navy" />
                   <span className="text-[10px] font-bold uppercase tracking-widest text-brand-navy">Live Activity</span>
                </div>
             </div>
             <WorldMap activeTx={activeTx} />
             
             {/* Floating Recent Card */}
             {activeTx && (
                <div className="absolute bottom-6 right-6 left-6 md:left-auto bg-white/90 backdrop-blur p-4 rounded-xl shadow-lg border-l-4 border-brand-teal animate-slide-up max-w-sm">
                   <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-brand-teal animate-pulse"></div>
                      <span className="text-[10px] font-bold uppercase text-brand-navy/50">Just Cleared</span>
                   </div>
                   <p className="text-sm font-bold text-brand-navy">
                      Payment of ${MOCK_LEDGER.find(t => t.id === activeTx)?.amount} routed to {MOCK_LEDGER.find(t => t.id === activeTx)?.vendor}.
                   </p>
                </div>
             )}
          </div>

          {/* TABLE CARD */}
          <div className="lg:col-span-3 bg-white rounded-[2.5rem] shadow-xl border border-brand-navy/5 overflow-hidden">
            
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
            <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-4 bg-white border-b border-brand-navy/5 text-xs font-bold uppercase tracking-widest text-brand-navy/30">
                <div className="col-span-2">Time</div>
                <div className="col-span-3">Vendor / Recipient</div>
                <div className="col-span-3">Category</div>
                <div className="col-span-2 text-right">Amount</div>
                <div className="col-span-2 text-right">Status</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-brand-navy/5">
                {MOCK_LEDGER.map((item) => (
                <div 
                    key={item.id} 
                    className={`grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 md:px-8 py-6 items-center hover:bg-brand-cream/50 transition-colors group cursor-default ${activeTx === item.id ? 'bg-brand-teal/5' : ''}`}
                    onMouseEnter={() => setActiveTx(item.id)}
                    onMouseLeave={() => setActiveTx(null)}
                >
                    
                    {/* Time */}
                    <div className="col-span-2 flex flex-row md:flex-col justify-between md:justify-start">
                        <span className="md:hidden text-xs font-bold text-brand-navy/30">Time</span>
                        <div>
                           <span className="font-mono font-bold text-brand-navy text-sm">{item.timestamp.split(',')[1]}</span>
                           <span className="text-xs text-brand-navy/40 ml-2 md:ml-0">{item.timestamp.split(',')[0]}</span>
                        </div>
                    </div>

                    {/* Vendor */}
                    <div className="col-span-3 flex flex-row md:flex-col justify-between md:justify-start gap-3">
                         <div className="flex items-center gap-3">
                            <div className="hidden md:flex w-8 h-8 rounded-full bg-brand-navy/5 items-center justify-center text-brand-navy group-hover:bg-brand-navy group-hover:text-white transition-colors shrink-0">
                                <ArrowDownLeft size={14} />
                            </div>
                            <div>
                                <span className="block font-bold text-brand-navy text-sm text-right md:text-left">{item.vendor}</span>
                                <span className="font-mono text-[10px] text-brand-navy/30 hidden md:block">{item.id}</span>
                            </div>
                        </div>
                    </div>

                    {/* Category Badge */}
                    <div className="col-span-3 flex justify-between md:justify-start items-center">
                        <span className="md:hidden text-xs font-bold text-brand-navy/30">Category</span>
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
                    <div className="col-span-2 text-left md:text-right flex justify-between md:block">
                        <span className="md:hidden text-xs font-bold text-brand-navy/30">Value</span>
                        <span className="font-mono font-bold text-brand-navy text-lg tracking-tight">
                            ${item.amount.toFixed(2)}
                        </span>
                    </div>

                    {/* Status */}
                    <div className="col-span-2 text-right flex justify-between md:justify-end items-center">
                        <span className="md:hidden text-xs font-bold text-brand-navy/30">Status</span>
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

      </div>
      
      {/* Security Footer */}
      <div className="mt-8 flex flex-col md:flex-row justify-center gap-4 md:gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500 text-center">
         <div className="flex items-center justify-center gap-2">
            <Lock size={14} className="text-brand-navy" />
            <span className="text-xs font-bold text-brand-navy">End-to-End Encryption</span>
         </div>
         <div className="flex items-center justify-center gap-2">
            <ShieldCheck size={14} className="text-brand-navy" />
            <span className="text-xs font-bold text-brand-navy">SOC2 Compliant</span>
         </div>
      </div>

    </div>
  );
};