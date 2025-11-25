
import React from 'react';
import { TrendingUp, ArrowUpRight, Heart, Users, Activity, Bell } from 'lucide-react';
import { Mascot } from './Mascot';
import { ImpactStory, DonorStats } from '../types';

const MOCK_STATS: DonorStats = {
  totalInvested: 1250,
  livesImpacted: 8,
  activeProjects: 3,
  socialRoi: 420 // 4.2x impact multiplier
};

const MOCK_STORIES: ImpactStory[] = [
  { id: '1', beneficiary: "Sarah M.", action: "used the bus pass", outcome: "attended 2 job interviews this week", date: "Today, 9:00 AM", type: 'commute' },
  { id: '2', beneficiary: "David K.", action: "moved into", outcome: "Oxford House (Safe Rent Secured)", date: "Yesterday", type: 'home' },
  { id: '3', beneficiary: "Marcus J.", action: "received laptop", outcome: "Enrolled in GED courses", date: "Oct 2", type: 'tech' }
];

export const DonorDashboard: React.FC = () => {
  return (
    <div className="w-full max-w-6xl mx-auto animate-float" style={{ animationDuration: '0.8s', animationIterationCount: 1 }}>
      
      {/* Portfolio Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
             <div className="bg-brand-navy p-2 rounded-lg text-white">
               <TrendingUp size={24} />
             </div>
             <span className="text-xs font-bold uppercase tracking-widest text-brand-navy/50">Impact Portfolio</span>
           </div>
           <h2 className="font-display font-bold text-5xl text-brand-navy">Your Returns.</h2>
           <p className="text-brand-navy/60 mt-2 text-lg">Tracking the real-world dividends of your investment.</p>
        </div>
        
        <div className="flex gap-2">
           <button className="bg-white border-2 border-brand-navy/10 px-6 py-3 rounded-xl font-bold text-brand-navy hover:bg-brand-cream transition-colors flex items-center gap-2">
             <Bell size={18} />
             Alerts On
           </button>
           <button className="bg-brand-navy text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-teal transition-colors flex items-center gap-2 shadow-lg">
             <ArrowUpRight size={18} />
             Re-Invest
           </button>
        </div>
      </div>

      {/* Financial Style Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
         {/* Total Invested */}
         <div className="bg-white p-6 rounded-3xl border border-brand-navy/10 shadow-sm relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <Activity size={60} />
            </div>
            <span className="text-xs font-bold uppercase text-brand-navy/40">Total Invested</span>
            <div className="text-4xl font-display font-bold text-brand-navy mt-1">
              ${MOCK_STATS.totalInvested.toLocaleString()}
            </div>
            <div className="text-xs font-bold text-brand-teal mt-2 flex items-center gap-1">
               <div className="w-4 h-4 bg-brand-teal/20 rounded-full flex items-center justify-center">
                 <ArrowUpRight size={10} />
               </div>
               +12% this month
            </div>
         </div>

         {/* Social ROI */}
         <div className="bg-brand-navy p-6 rounded-3xl border border-brand-navy shadow-lg text-white relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-brand-yellow/20 rounded-full blur-xl"></div>
            <span className="text-xs font-bold uppercase text-brand-lavender">Social ROI</span>
            <div className="text-4xl font-display font-bold text-brand-yellow mt-1">
              {(MOCK_STATS.socialRoi / 100).toFixed(1)}x
            </div>
            <div className="text-xs font-bold text-brand-lavender/60 mt-2">
               Community Multiplier Effect
            </div>
         </div>

         {/* Lives Impacted */}
         <div className="bg-brand-coral p-6 rounded-3xl border border-brand-coral shadow-lg text-brand-navy relative overflow-hidden">
             <Mascot expression="happy" className="absolute -right-2 -bottom-2 w-24 h-24 opacity-20" />
            <span className="text-xs font-bold uppercase text-brand-navy/60">Lives Impacted</span>
            <div className="text-4xl font-display font-bold text-white mt-1">
              {MOCK_STATS.livesImpacted}
            </div>
            <div className="text-xs font-bold text-brand-navy/60 mt-2">
               Direct beneficiaries
            </div>
         </div>

         {/* Active Projects */}
         <div className="bg-white p-6 rounded-3xl border border-brand-navy/10 shadow-sm">
            <span className="text-xs font-bold uppercase text-brand-navy/40">Active Projects</span>
            <div className="text-4xl font-display font-bold text-brand-navy mt-1">
              {MOCK_STATS.activeProjects}
            </div>
             <div className="flex -space-x-2 mt-3">
                <div className="w-8 h-8 rounded-full bg-brand-teal border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">SM</div>
                <div className="w-8 h-8 rounded-full bg-brand-lavender border-2 border-white flex items-center justify-center text-[10px] text-brand-navy font-bold">JD</div>
                <div className="w-8 h-8 rounded-full bg-brand-yellow border-2 border-white flex items-center justify-center text-[10px] text-brand-navy font-bold">+1</div>
             </div>
         </div>
      </div>

      {/* The "Dividends" Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2">
            <h3 className="font-display font-bold text-2xl text-brand-navy mb-6 flex items-center gap-2">
               Latest Dividends <span className="bg-brand-teal/10 text-brand-teal text-xs px-2 py-1 rounded-md">Real-time</span>
            </h3>
            
            <div className="space-y-4">
               {MOCK_STORIES.map((story) => (
                  <div key={story.id} className="bg-white p-6 rounded-3xl border-l-4 border-brand-teal shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center hover:shadow-md transition-shadow">
                     <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${story.type === 'commute' ? 'bg-brand-lavender' : story.type === 'home' ? 'bg-brand-coral' : 'bg-brand-teal'}`}>
                        <Mascot variant={story.type} expression="excited" className="w-8 h-8" />
                     </div>
                     <div className="flex-1">
                        <p className="text-lg text-brand-navy font-medium">
                           <span className="font-bold">{story.beneficiary}</span> {story.action} and <span className="text-brand-teal font-bold">{story.outcome}</span>.
                        </p>
                        <p className="text-xs text-brand-navy/40 font-bold uppercase tracking-wider mt-1">{story.date}</p>
                     </div>
                     <button className="text-brand-navy/20 hover:text-brand-coral transition-colors">
                        <Heart size={20} />
                     </button>
                  </div>
               ))}
            </div>

            <div className="mt-6 p-6 rounded-3xl bg-brand-navy/5 border border-dashed border-brand-navy/10 text-center">
               <p className="text-brand-navy/60 font-medium">Viewing 3 of 42 impact events</p>
            </div>
         </div>

         {/* Share / Viral Loop */}
         <div className="bg-brand-teal text-white p-8 rounded-[2.5rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
            
            <h3 className="font-display font-bold text-3xl mb-4 relative z-10">Invite a Partner.</h3>
            <p className="mb-8 opacity-90 relative z-10">Social investors often syndicate deals. Bring a friend into the portfolio and match your impact.</p>
            
            <button className="w-full bg-white text-brand-teal font-bold py-4 rounded-xl hover:bg-brand-yellow hover:text-brand-navy transition-colors shadow-lg relative z-10">
               Share Portfolio Link
            </button>

            <div className="mt-8 flex items-center justify-center gap-4 opacity-60">
               <Users size={16} />
               <span className="text-xs font-bold uppercase tracking-widest">Syndicate ID: #8821A</span>
            </div>
         </div>
      </div>
    </div>
  );
};
