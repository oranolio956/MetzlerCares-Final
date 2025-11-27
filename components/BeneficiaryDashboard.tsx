import React, { useState } from 'react';
import { CheckCircle2, Clock, AlertCircle, Calendar, UploadCloud, ChevronRight, Star, LifeBuoy, Sparkles, Image } from 'lucide-react';
import { Mascot } from './Mascot';
import { ApplicationStatus } from '../types';
import { useStore } from '../context/StoreContext';
import { useRouter } from '../hooks/useRouter';

export const BeneficiaryDashboard: React.FC = () => {
  const { beneficiaryProfile, verifyInsurance, submitIntakeRequest, setCrisisMode } = useStore();
  const [isVerifying, setIsVerifying] = useState(false);
  const { navigate } = useRouter();

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case 'approved': return 'bg-brand-teal text-white';
      case 'funded': return 'bg-brand-teal text-white';
      case 'action_needed': return 'bg-brand-coral text-brand-navy';
      default: return 'bg-brand-lavender text-brand-navy';
    }
  };

  const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case 'approved': case 'funded': return <CheckCircle2 size={18} />;
      case 'action_needed': return <AlertCircle size={18} />;
      default: return <Clock size={18} />;
    }
  };

  const handleVerifyInsurance = () => {
      setIsVerifying(true);
      setTimeout(() => {
          verifyInsurance('verified');
          setIsVerifying(false);
      }, 2000);
  };

  const handleApplyMedicaid = () => {
      submitIntakeRequest({ type: 'Medicaid Application', details: 'Assistance applying for Colorado Medicaid to access Peer Coaching services.' });
  };

  return (
    <>
      <button 
        onClick={() => setCrisisMode(true)}
        className="fixed bottom-6 left-6 md:bottom-10 md:left-10 z-[80] bg-brand-coral text-white px-6 py-4 rounded-full shadow-[0_10px_40px_-10px_rgba(255,138,117,0.6)] hover:scale-105 transition-all flex items-center gap-3 font-bold group border-4 border-white/20 hover:border-white"
        aria-label="Get crisis help"
      >
        <LifeBuoy className="animate-pulse" />
        <span>Need Help?</span>
      </button>

      <div className="w-full max-w-6xl mx-auto animate-float" style={{ animationDuration: '0.8s', animationIterationCount: 1 }}>
        
        <div className="flex flex-col lg:flex-row items-end gap-6 mb-12">
          <div className="bg-brand-navy text-white p-6 md:p-8 rounded-[2.5rem] rounded-bl-none shadow-xl flex-1 relative overflow-hidden w-full">
             <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-brand-teal opacity-20 rounded-full blur-2xl"></div>
             <div className="relative z-10">
               <div className="flex items-center gap-4 mb-2">
                 <h2 className="font-display font-bold text-3xl md:text-4xl">Welcome home, {beneficiaryProfile.name}.</h2>
                 <Mascot expression="happy" className="w-10 h-10 md:w-12 md:h-12 shrink-0" />
               </div>
               <p className="text-brand-lavender text-base md:text-lg">Your recovery is the priority. We handle the logistics.</p>
             </div>
          </div>

          <div className="bg-white border-4 border-brand-teal p-6 rounded-[2.5rem] rounded-br-none shadow-xl w-full lg:w-auto lg:min-w-[280px]">
             <div className="flex items-center justify-between mb-2">
               <span className="text-xs font-bold uppercase tracking-widest text-brand-navy/60">Sober Streak</span>
               <Star className="text-brand-yellow fill-brand-yellow" size={20} />
             </div>
             <div className="text-6xl font-display font-bold text-brand-navy leading-none">
               {beneficiaryProfile.daysSober}<span className="text-2xl text-brand-teal">days</span>
             </div>
             <div className="mt-4 w-full bg-brand-navy/5 h-2 rounded-full overflow-hidden">
               <div className="h-full bg-brand-teal w-[70%]"></div>
             </div>
             <p className="text-xs text-brand-navy/60 mt-2 text-right">{60 - beneficiaryProfile.daysSober} days to next chip</p>
          </div>
        </div>

        {/* AI Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <button 
                onClick={() => navigate('coach')}
                className="bg-brand-yellow text-brand-navy p-6 rounded-3xl border-2 border-brand-navy/10 hover:border-brand-navy hover:shadow-lg transition-all flex items-center justify-between group"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Sparkles size={24} />
                    </div>
                    <div className="text-left">
                        <h4 className="font-bold text-xl">Recovery Coach Pro</h4>
                        <p className="text-brand-navy/60 text-sm">Advanced AI Career & Life Planning</p>
                    </div>
                </div>
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-brand-navy group-hover:text-white transition-colors">
                    <ChevronRight size={20} />
                </div>
            </button>

            <button 
                onClick={() => navigate('vision')}
                className="bg-brand-teal text-white p-6 rounded-3xl border-2 border-transparent hover:border-white hover:shadow-lg transition-all flex items-center justify-between group"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Image size={24} />
                    </div>
                    <div className="text-left">
                        <h4 className="font-bold text-xl">Vision Board</h4>
                        <p className="text-white/80 text-sm">Visualize your goals with Nano Banana Pro</p>
                    </div>
                </div>
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white group-hover:text-brand-teal transition-colors">
                    <ChevronRight size={20} />
                </div>
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
             <h3 className="font-display font-bold text-2xl text-brand-navy ml-4 flex items-center gap-2">
               Active Requests <span className="bg-brand-navy/5 px-2 py-1 rounded-full text-sm font-bold text-brand-navy/50">{beneficiaryProfile.requests.length}</span>
             </h3>
             {beneficiaryProfile.requests.map((req) => (
               <div key={req.id} className="group bg-white p-6 rounded-3xl border-2 border-brand-navy/5 hover:border-brand-navy transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${getStatusColor(req.status)}`}>{getStatusIcon(req.status)}</div>
                    <div>
                      <h4 className="font-bold text-lg text-brand-navy">{req.type}</h4>
                      <span className="text-xs font-medium text-brand-navy/50">{req.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                    {req.status === 'action_needed' && (
                      <button className="bg-brand-coral text-brand-navy px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-brand-coral/80 transition-colors w-full sm:w-auto justify-center"><UploadCloud size={16} />{req.note}</button>
                    )}
                    {req.status === 'reviewing' && <span className="bg-brand-lavender/20 text-brand-navy px-4 py-2 rounded-xl font-bold text-sm">In Review</span>}
                  </div>
               </div>
             ))}
             <button className="w-full py-4 rounded-3xl border-2 border-dashed border-brand-navy/20 text-brand-navy/40 font-bold hover:border-brand-teal hover:text-brand-teal hover:bg-brand-teal/5 transition-all flex items-center justify-center gap-2 group">
               <div className="w-8 h-8 rounded-full bg-brand-navy/10 flex items-center justify-center group-hover:bg-brand-teal group-hover:text-white transition-colors">+</div>
               Open New Request
             </button>
          </div>

          <div className="space-y-6">
             <div className="bg-brand-navy text-white p-6 rounded-3xl relative overflow-hidden group cursor-pointer hover:shadow-xl transition-all" onClick={() => setCrisisMode(true)}>
               <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>
               <h4 className="font-bold text-xl mb-1 relative z-10">Need to talk?</h4>
               <p className="text-brand-lavender text-sm mb-4 relative z-10">Speak with peer support or access crisis line.</p>
               <div className="flex justify-end"><div className="bg-white/20 p-2 rounded-full"><ChevronRight /></div></div>
             </div>
             
             <div className="bg-brand-cream p-6 rounded-3xl border border-brand-navy/10">
                <div className="flex items-start gap-4 mb-6">
                   <Calendar className="text-brand-navy shrink-0" />
                   <div>
                     <h4 className="font-bold text-brand-navy">Upcoming Meeting</h4>
                     <p className="text-sm text-brand-navy/60">Tuesday, 7:00 PM</p>
                   </div>
                </div>
                <div className="w-full h-px bg-brand-navy/5 mb-6"></div>
                <h5 className="font-bold text-sm text-brand-navy mb-3">Community Updates</h5>
                <ul className="space-y-3">
                  <li className="text-sm text-brand-navy/70 flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-coral mt-1.5 shrink-0"></span>New job workshop this Saturday</li>
                </ul>
             </div>
          </div>
        </div>
      </div>
    </>
  );
};