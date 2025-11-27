
import React, { useState } from 'react';
import { CheckCircle2, Clock, AlertCircle, Calendar, UploadCloud, ChevronRight, Star, LifeBuoy, Phone, MessageSquare, X, Shield, Lock, Users, FileCheck, Sparkles, Zap } from 'lucide-react';
import { Mascot } from './Mascot';
import { ApplicationStatus } from '../types';
import { useStore } from '../context/StoreContext';

export const BeneficiaryDashboard: React.FC = () => {
  const { beneficiaryProfile, verifyInsurance, submitIntakeRequest } = useStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'requests'>('overview');
  const [showCrisis, setShowCrisis] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

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
      // Simulate API call
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
      {/* Crisis Overlay */}
      {showCrisis && (
        <div className="fixed inset-0 bg-brand-coral/95 backdrop-blur-sm z-[100] flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300">
           <button onClick={() => setShowCrisis(false)} className="absolute top-6 right-6 text-white hover:bg-white/20 p-2 rounded-full"><X size={32} /></button>
           <LifeBuoy size={64} className="text-white mb-6 animate-pulse" />
           <h3 className="font-display font-bold text-3xl text-white mb-2">Immediate Help</h3>
           <p className="text-white/80 mb-8 max-w-xs">If you are in danger or need immediate support, please connect with a human now.</p>
           <div className="flex flex-col w-full max-w-sm gap-3">
              <a href="tel:988" className="bg-white text-brand-coral font-bold py-4 rounded-xl flex items-center justify-center gap-3 shadow-lg hover:scale-105 transition-transform"><Phone size={20} /> Call 988 (Crisis Line)</a>
              <a href="sms:741741" className="bg-brand-navy text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 shadow-lg hover:scale-105 transition-transform"><MessageSquare size={20} /> Text HOME to 741741</a>
           </div>
        </div>
      )}

      {/* Floating Crisis Button */}
      <button 
        onClick={() => setShowCrisis(true)}
        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-50 bg-brand-coral text-white px-6 py-4 rounded-full shadow-[0_10px_40px_-10px_rgba(255,138,117,0.6)] hover:scale-105 transition-all flex items-center gap-3 font-bold group border-4 border-white/20 hover:border-white"
      >
        <LifeBuoy className="animate-pulse" />
        <span>Need Help?</span>
      </button>

      <div className="w-full max-w-6xl mx-auto animate-float" style={{ animationDuration: '0.8s', animationIterationCount: 1 }}>
        
        {/* Welcome Header */}
        <div className="flex flex-col lg:flex-row items-end gap-6 mb-12">
          <div className="bg-brand-navy text-white p-6 md:p-8 rounded-[2.5rem] rounded-bl-none shadow-xl flex-1 relative overflow-hidden w-full">
             {/* Decorative circles */}
             <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-brand-teal opacity-20 rounded-full blur-2xl"></div>
             
             <div className="relative z-10">
               <div className="flex items-center gap-4 mb-2">
                 <h2 className="font-display font-bold text-3xl md:text-4xl">Welcome home, {beneficiaryProfile.name}.</h2>
                 <Mascot expression="happy" className="w-10 h-10 md:w-12 md:h-12 shrink-0" />
               </div>
               <p className="text-brand-lavender text-base md:text-lg">Your recovery is the priority. We handle the logistics.</p>
             </div>
          </div>

          {/* Milestone Tracker */}
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

        {/* GAMIFIED INSURANCE VERIFICATION */}
        {beneficiaryProfile.insuranceStatus !== 'verified' ? (
            <div className="relative bg-brand-cream border border-brand-navy/5 rounded-3xl p-1 overflow-hidden mb-8 shadow-lg group">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-teal/10 via-brand-yellow/10 to-brand-coral/10 opacity-50"></div>
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-brand-yellow/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                
                <div className="relative bg-white/60 backdrop-blur-sm rounded-[1.3rem] p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-8 border border-white/50">
                    <div className="w-20 h-20 bg-brand-navy text-brand-yellow rounded-2xl flex items-center justify-center shadow-xl shrink-0 rotate-3 border-2 border-brand-navy/5">
                        <Sparkles size={40} className="animate-pulse" />
                    </div>
                    
                    <div className="flex-1 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-coral text-white text-[10px] font-bold uppercase tracking-widest mb-2">
                            <Lock size={10} /> Action Required
                        </div>
                        <h3 className="font-display font-bold text-2xl text-brand-navy mb-2">Unlock the Peer Coaching Suite</h3>
                        <p className="text-brand-navy/60 text-sm md:text-base max-w-lg">
                            Verify your Medicaid status to instantly access free ID retrieval, SNAP assistance, and job coaching. It's free with insurance.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto min-w-[200px]">
                        <button 
                            onClick={handleVerifyInsurance}
                            disabled={isVerifying}
                            className="bg-brand-navy text-white px-6 py-4 rounded-xl font-bold hover:bg-brand-teal transition-all disabled:opacity-50 shadow-[0_8px_20px_-6px_rgba(26,42,58,0.3)] hover:shadow-none hover:translate-y-1 flex items-center justify-center gap-2"
                        >
                            {isVerifying ? <><Sparkles className="animate-spin" /> Verifying...</> : 'Verify Now'}
                        </button>
                        <button 
                            onClick={handleApplyMedicaid}
                            className="bg-white border-2 border-brand-navy/10 text-brand-navy px-6 py-4 rounded-xl font-bold hover:bg-brand-cream transition-colors"
                        >
                            I Need To Apply
                        </button>
                    </div>
                </div>
            </div>
        ) : (
            <div className="bg-brand-teal/10 border-2 border-brand-teal/20 rounded-3xl p-6 mb-8 flex items-center gap-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/40 backdrop-blur-sm -skew-x-12 -translate-x-full animate-[shimmer_2s_infinite]"></div>
                <div className="bg-brand-teal text-white p-2 rounded-full relative z-10"><CheckCircle2 size={20} /></div>
                <span className="font-bold text-brand-navy relative z-10">Medicaid Verified. Premium Support Unlocked.</span>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Col: Action Center */}
          <div className="lg:col-span-2 space-y-6">
             <h3 className="font-display font-bold text-2xl text-brand-navy ml-4 flex items-center gap-2">
               Active Requests 
               <span className="bg-brand-navy/5 px-2 py-1 rounded-full text-sm font-bold text-brand-navy/50">{beneficiaryProfile.requests.length}</span>
             </h3>
             
             {beneficiaryProfile.requests.map((req) => (
               <div key={req.id} className="group bg-white p-6 rounded-3xl border-2 border-brand-navy/5 hover:border-brand-navy transition-all hover:shadow-[4px_4px_0px_0px_rgba(26,42,58,1)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${getStatusColor(req.status)}`}>
                      {getStatusIcon(req.status)}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-brand-navy">{req.type}</h4>
                      <span className="text-xs font-medium text-brand-navy/50">{req.date}</span>
                      {req.details && <p className="text-xs text-brand-navy/40 mt-1 max-w-md truncate">{req.details}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                    {req.status === 'action_needed' && (
                      <button className="bg-brand-coral text-brand-navy px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-brand-coral/80 transition-colors w-full sm:w-auto justify-center">
                        <UploadCloud size={16} />
                        {req.note}
                      </button>
                    )}
                    {req.status === 'funded' && (
                       <span className="bg-brand-teal/10 text-brand-teal px-4 py-2 rounded-xl font-bold text-sm">
                         Complete
                       </span>
                    )}
                    {req.status === 'reviewing' && (
                       <span className="bg-brand-lavender/20 text-brand-navy px-4 py-2 rounded-xl font-bold text-sm">
                         In Review
                       </span>
                    )}
                  </div>
               </div>
             ))}

             {/* New Request Button */}
             <button className="w-full py-4 rounded-3xl border-2 border-dashed border-brand-navy/20 text-brand-navy/40 font-bold hover:border-brand-teal hover:text-brand-teal hover:bg-brand-teal/5 transition-all flex items-center justify-center gap-2 group">
               <div className="w-8 h-8 rounded-full bg-brand-navy/10 flex items-center justify-center group-hover:bg-brand-teal group-hover:text-white transition-colors">+</div>
               Open New Request
             </button>
          </div>

          {/* Right Col: Resources & Quick Links */}
          <div className="space-y-6">
             <h3 className="font-display font-bold text-2xl text-brand-navy ml-4">My Resources</h3>
             
             {/* UPGRADED PEER COACHING CARD */}
             <div className={`p-1 rounded-[2rem] relative transition-all group ${beneficiaryProfile.insuranceStatus === 'verified' ? 'bg-gradient-to-b from-brand-teal/20 to-transparent hover:scale-[1.02]' : 'bg-gray-100'}`}>
                
                <div className="bg-white rounded-[1.8rem] p-6 h-full relative overflow-hidden border border-white/50">
                    {/* Verification Lock Overlay */}
                    {beneficiaryProfile.insuranceStatus !== 'verified' && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center z-20 text-center p-6">
                            <div className="bg-brand-navy text-white w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-lg">
                                <Lock size={20} />
                            </div>
                            <p className="font-bold text-brand-navy text-sm mb-1">Locked Resource</p>
                            <p className="text-xs text-brand-navy/60">Verify Medicaid to unlock</p>
                        </div>
                    )}
                    
                    {/* Card Header */}
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-brand-navy text-white p-3 rounded-xl shadow-md group-hover:rotate-3 transition-transform">
                            <Users size={24} />
                        </div>
                        {beneficiaryProfile.insuranceStatus === 'verified' && (
                            <div className="bg-brand-teal/10 text-brand-teal px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">Active</div>
                        )}
                    </div>

                    <h4 className="font-display font-bold text-xl text-brand-navy mb-1">Peer Coaching</h4>
                    <p className="text-xs font-bold text-brand-teal uppercase tracking-widest mb-4">Free with Medicaid</p>
                    
                    <div className="space-y-3 mb-6 relative z-10">
                         <div className="flex items-center gap-3 text-sm text-brand-navy/70 p-2 bg-brand-cream rounded-lg border border-brand-navy/5"><FileCheck size={16} className="text-brand-teal shrink-0" /> ID & Documents</div>
                         <div className="flex items-center gap-3 text-sm text-brand-navy/70 p-2 bg-brand-cream rounded-lg border border-brand-navy/5"><FileCheck size={16} className="text-brand-teal shrink-0" /> SNAP Application</div>
                         <div className="flex items-center gap-3 text-sm text-brand-navy/70 p-2 bg-brand-cream rounded-lg border border-brand-navy/5"><FileCheck size={16} className="text-brand-teal shrink-0" /> Job Search</div>
                    </div>

                    <button 
                        disabled={beneficiaryProfile.insuranceStatus !== 'verified'}
                        className="w-full bg-brand-navy text-white py-3 rounded-xl font-bold disabled:opacity-0 hover:bg-brand-teal transition-colors shadow-lg flex items-center justify-center gap-2"
                    >
                        Connect Coach <ChevronRight size={16} />
                    </button>
                </div>
             </div>

             <div className="bg-brand-cream p-6 rounded-3xl border border-brand-navy/10">
                <div className="flex items-start gap-4 mb-6">
                   <Calendar className="text-brand-navy shrink-0" />
                   <div>
                     <h4 className="font-bold text-brand-navy">Upcoming Meeting</h4>
                     <p className="text-sm text-brand-navy/60">Tuesday, 7:00 PM</p>
                     <p className="text-xs text-brand-teal font-bold mt-1">Sober Living Common Room</p>
                   </div>
                </div>
                <div className="w-full h-px bg-brand-navy/5 mb-6"></div>
                
                <h5 className="font-bold text-sm text-brand-navy mb-3">Community Updates</h5>
                <ul className="space-y-3">
                  <li className="text-sm text-brand-navy/70 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-coral mt-1.5 shrink-0"></span>
                    New job workshop this Saturday
                  </li>
                  <li className="text-sm text-brand-navy/70 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-teal mt-1.5 shrink-0"></span>
                    Grocery pantry restocked
                  </li>
                </ul>
             </div>

             <div className="bg-brand-navy text-white p-6 rounded-3xl relative overflow-hidden group cursor-pointer hover:shadow-xl transition-all" onClick={() => setShowCrisis(true)}>
               <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>
               <h4 className="font-bold text-xl mb-1 relative z-10">Need to talk?</h4>
               <p className="text-brand-lavender text-sm mb-4 relative z-10">Speak with peer support or access crisis line.</p>
               <div className="flex justify-end">
                 <div className="bg-white/20 p-2 rounded-full">
                   <ChevronRight />
                 </div>
               </div>
             </div>
          </div>

        </div>
      </div>
    </>
  );
};
