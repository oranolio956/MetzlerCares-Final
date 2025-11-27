import React, { useState } from 'react';
import { MapPin, Users, Building, Activity, ArrowRight, Home } from 'lucide-react';
import { useSound } from '../hooks/useSound';

const ZONES = [
  { id: 'denver', label: 'Denver Metro', cx: 300, cy: 150, r: 40, color: '#2D9C8E', demand: 'High', grants: 12, housing: 8 },
  { id: 'boulder', label: 'Boulder', cx: 180, cy: 100, r: 30, color: '#FF8A75', demand: 'Med', grants: 5, housing: 4 },
  { id: 'springs', label: 'Colo Springs', cx: 320, cy: 300, r: 35, color: '#F4D35E', demand: 'High', grants: 9, housing: 3 },
  { id: 'aurora', label: 'Aurora', cx: 380, cy: 160, r: 30, color: '#A7ACD9', demand: 'Low', grants: 3, housing: 6 },
  { id: 'ftcollins', label: 'Ft. Collins', cx: 200, cy: 40, r: 25, color: '#1A2A3A', demand: 'Low', grants: 2, housing: 2 },
];

export const HyperLocalMap: React.FC = () => {
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const { playHover, playClick } = useSound();

  const activeData = ZONES.find(z => z.id === activeZone);

  return (
    <div className="w-full bg-[#1A2A3A] py-16 border-t border-white/5 relative overflow-hidden">
       {/* Background Grid */}
       <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

       <div className="max-w-6xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-12">
          
          {/* MAP VISUAL */}
          <div className="flex-1 w-full max-w-lg relative aspect-square">
             <svg viewBox="0 0 500 400" className="w-full h-full drop-shadow-2xl">
                {/* Colorado Outline (Abstract) */}
                <path d="M50 50 L450 50 L450 350 L50 350 Z" fill="none" stroke="#ffffff" strokeOpacity="0.1" strokeWidth="2" />
                
                {/* Connecting Lines */}
                <path d="M200 40 L180 100 L300 150 L380 160 L320 300" stroke="#ffffff" strokeOpacity="0.1" strokeWidth="1" strokeDasharray="4 4" />

                {/* Zones */}
                {ZONES.map(zone => (
                    <g 
                        key={zone.id} 
                        onMouseEnter={() => { setActiveZone(zone.id); playHover(); }}
                        onClick={() => playClick()}
                        className="cursor-pointer group transition-all duration-300"
                        style={{ opacity: activeZone && activeZone !== zone.id ? 0.4 : 1 }}
                    >
                        {/* Pulse Effect */}
                        <circle cx={zone.cx} cy={zone.cy} r={zone.r + 10} fill={zone.color} opacity="0.2" className="animate-pulse" />
                        
                        {/* Core Circle */}
                        <circle 
                            cx={zone.cx} 
                            cy={zone.cy} 
                            r={zone.r} 
                            fill={zone.color} 
                            className="transition-all duration-300 group-hover:scale-110" 
                        />
                        
                        {/* Icon */}
                        <foreignObject x={zone.cx - 10} y={zone.cy - 10} width="20" height="20" className="pointer-events-none">
                            <div className="flex items-center justify-center w-full h-full text-brand-navy">
                                <MapPin size={16} fill="currentColor" />
                            </div>
                        </foreignObject>

                        {/* Label */}
                        <text x={zone.cx} y={zone.cy + zone.r + 20} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" className="uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
                            {zone.label}
                        </text>
                    </g>
                ))}
             </svg>
          </div>

          {/* DATA PANEL */}
          <div className="flex-1 w-full">
             <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-6">Neighborhood Watch.</h2>
             <p className="text-brand-lavender/60 mb-8 leading-relaxed">
                Recovery happens locally. We monitor housing availability and funding gaps in real-time across the Front Range. Hover over a zone to see active needs.
             </p>

             <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 min-h-[200px] transition-all duration-300">
                {activeData ? (
                    <div className="animate-slide-up">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-widest text-brand-teal mb-1 block">Active Zone</span>
                                <h3 className="font-display font-bold text-3xl text-white">{activeData.label}</h3>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${activeData.demand === 'High' ? 'border-brand-coral text-brand-coral bg-brand-coral/10' : 'border-brand-teal text-brand-teal bg-brand-teal/10'}`}>
                                {activeData.demand} Demand
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 p-4 rounded-xl">
                                <div className="flex items-center gap-2 text-brand-lavender text-xs font-bold uppercase mb-2">
                                    <Activity size={14} /> Active Grants
                                </div>
                                <div className="text-2xl font-bold text-white">{activeData.grants}</div>
                            </div>
                            <div className="bg-white/5 p-4 rounded-xl">
                                <div className="flex items-center gap-2 text-brand-lavender text-xs font-bold uppercase mb-2">
                                    <Home size={14} /> Open Beds
                                </div>
                                <div className="text-2xl font-bold text-white">{activeData.housing}</div>
                            </div>
                        </div>
                        
                        <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
                            <span className="text-xs text-white/40 font-mono">ID: {activeData.id.toUpperCase()}_NODE_01</span>
                            <button className="text-brand-teal font-bold text-sm flex items-center gap-2 hover:text-white transition-colors">
                                View Partners <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                        <MapPin size={48} className="mb-4 text-white" />
                        <p className="text-white font-medium">Select a zone to view live network stats.</p>
                    </div>
                )}
             </div>
          </div>

       </div>
    </div>
  );
};