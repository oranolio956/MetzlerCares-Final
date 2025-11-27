
import React, { useState } from 'react';
import { Building2, ShieldCheck, CheckCircle2, ArrowRight, AlertCircle, Lock, FileText, BadgeCheck, Stethoscope, Receipt, CheckSquare } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useSound } from '../hooks/useSound';
import { Mascot } from './Mascot';

const STEPS = [
  { id: 'intro', label: 'Protocol' },
  { id: 'entity', label: 'Identity' },
  { id: 'compliance', label: 'Standards' },
  { id: 'payment', label: 'Contribution' },
  { id: 'review', label: 'Status' }
];

export const PartnerFlow: React.FC = () => {
  const { addNotification, triggerConfetti } = useStore();
  const { playClick, playSuccess } = useSound();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{name?: string; address?: string; ein?: string; compliance?: string}>({});

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    type: 'oxford',
    ein: '',
    bedCount: '',
    monthlyRent: '',
    acceptsMAT: false,
    hasNaloxone: false,
    hasInsurance: false,
    isRRAMember: false
  });

  const validateStep = (step: number) => {
    const newErrors: typeof errors = {};
    let isValid = true;

    if (step === 1) { // Entity Step
        if (!formData.name.trim()) {
            newErrors.name = 'Legal Entity Name is required';
            isValid = false;
        }
        if (!formData.address.trim()) {
            newErrors.address = 'Physical Address is required';
            isValid = false;
        }
        if (!formData.ein.trim()) {
            newErrors.ein = 'EIN is required';
            isValid = false;
        } else if (!/^\d{2}-\d{7}$/.test(formData.ein)) {
            newErrors.ein = 'Format must be XX-XXXXXXX';
            isValid = false;
        }
    }

    if (step === 2) { // Compliance Step
        if (!formData.hasNaloxone) {
            addNotification('error', 'Naloxone availability is mandatory.');
            isValid = false;
        }
        if (!formData.hasInsurance) {
             addNotification('error', 'Liability Insurance is required to proceed.');
             isValid = false;
        }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    playClick();

    if (!validateStep(currentStep)) {
        addNotification('error', 'Please fix the errors before proceeding.');
        return;
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      playSuccess();
      triggerConfetti();
      addNotification('success', 'Application Docketed.');
      setCurrentStep(5); // Success View
    }, 2000);
  };

  const renderStep = () => {
    switch(currentStep) {
      case 0: // INTRO
        return (
          <div className="flex flex-col items-start text-left animate-slide-up max-w-2xl mx-auto">
            
            <div className="bg-brand-navy/5 p-6 rounded-none border-l-4 border-brand-navy mb-8 w-full">
                <div className="flex items-center gap-3 mb-2">
                    <Building2 className="text-brand-navy" />
                    <span className="font-bold uppercase tracking-widest text-xs text-brand-navy/60">Partner Network</span>
                </div>
                <h2 className="font-display font-bold text-3xl md:text-4xl text-brand-navy leading-tight">
                    Join the Liquidity Pool.
                </h2>
            </div>

            <p className="text-brand-navy/80 text-lg mb-12 leading-relaxed font-medium">
              SecondWind is not a lead gen service. We are a <span className="text-brand-teal font-bold">funding protocol</span>. 
              We direct-deposit rent for vetted residents in exchange for strict safety standards and data transparency.
            </p>
            
            <div className="space-y-6 w-full mb-12 border-t-2 border-brand-navy/10 pt-8">
               <div className="flex gap-6 items-start group">
                  <div className="w-12 h-12 bg-white border-2 border-brand-navy text-brand-navy flex items-center justify-center font-display font-bold text-xl shrink-0 group-hover:bg-brand-navy group-hover:text-white transition-colors">1</div>
                  <div>
                    <h4 className="font-bold text-brand-navy text-xl">The Agreement</h4>
                    <p className="text-brand-navy/60 leading-relaxed mt-1">We fill your beds with pre-qualified residents. You provide a safe, sober environment.</p>
                  </div>
               </div>
               
               <div className="flex gap-6 items-start group">
                  <div className="w-12 h-12 bg-white border-2 border-brand-navy text-brand-navy flex items-center justify-center font-display font-bold text-xl shrink-0 group-hover:bg-brand-navy group-hover:text-white transition-colors">2</div>
                  <div>
                    <h4 className="font-bold text-brand-navy text-xl">The Standard</h4>
                    <p className="text-brand-navy/60 leading-relaxed mt-1">Mandatory Naloxone on-site. MAT friendly policies. Liability insurance active.</p>
                  </div>
               </div>

               <div className="flex gap-6 items-start group">
                  <div className="w-12 h-12 bg-white border-2 border-brand-navy text-brand-navy flex items-center justify-center font-display font-bold text-xl shrink-0 group-hover:bg-brand-navy group-hover:text-white transition-colors">3</div>
                  <div>
                    <h4 className="font-bold text-brand-navy text-xl">The Contribution</h4>
                    <p className="text-brand-navy/60 leading-relaxed mt-1">A $99/mo network fee supports the platform and verifies your entity's financial standing.</p>
                  </div>
               </div>
            </div>

            <button onClick={handleNext} className="w-full bg-brand-navy text-white py-5 px-8 font-bold text-lg hover:bg-brand-teal transition-colors flex items-center justify-between group shadow-[4px_4px_0px_0px_rgba(26,42,58,0.2)]">
              <span>Begin Verification</span>
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        );

      case 1: // ENTITY
        return (
          <div className="max-w-xl mx-auto animate-slide-up">
            <div className="mb-8 border-b-2 border-brand-navy/10 pb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-brand-navy/40 mb-2 block">Step 01</span>
                <h3 className="font-display font-bold text-3xl text-brand-navy">Legal Identity</h3>
            </div>

            <div className="space-y-6">
               <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-brand-navy/60 mb-2">Legal Entity Name <span className="text-brand-coral">*</span></label>
                  <input 
                    type="text" 
                    placeholder="e.g. Serenity House LLC" 
                    className={`w-full bg-white p-4 border-2 ${errors.name ? 'border-brand-coral text-brand-coral' : 'border-brand-navy/10 focus:border-brand-teal text-brand-navy'} outline-none font-bold placeholder:text-brand-navy/20 transition-colors`} 
                    value={formData.name} 
                    onChange={e => {
                        setFormData({...formData, name: e.target.value});
                        if (errors.name) setErrors({...errors, name: undefined});
                    }} 
                  />
                  {errors.name && (
                    <span className="text-xs text-brand-coral font-bold mt-2 flex items-center gap-1 animate-slide-up">
                        <AlertCircle size={12} /> {errors.name}
                    </span>
                  )}
               </div>

               <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-brand-navy/60 mb-2">Physical Address <span className="text-brand-coral">*</span></label>
                  <input 
                    type="text" 
                    placeholder="123 Recovery Rd, Denver CO" 
                    className={`w-full bg-white p-4 border-2 ${errors.address ? 'border-brand-coral text-brand-coral' : 'border-brand-navy/10 focus:border-brand-teal text-brand-navy'} outline-none font-medium placeholder:text-brand-navy/20 transition-colors`}
                    value={formData.address} 
                    onChange={e => {
                        setFormData({...formData, address: e.target.value});
                        if (errors.address) setErrors({...errors, address: undefined});
                    }} 
                  />
                  {errors.address && (
                    <span className="text-xs text-brand-coral font-bold mt-2 flex items-center gap-1 animate-slide-up">
                        <AlertCircle size={12} /> {errors.address}
                    </span>
                  )}
               </div>

               <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-brand-navy/60 mb-2">Facility Type</label>
                    <div className="relative">
                        <select 
                            className="w-full bg-white p-4 border-2 border-brand-navy/10 outline-none font-bold text-brand-navy appearance-none focus:border-brand-teal transition-colors rounded-none" 
                            value={formData.type} 
                            onChange={e => setFormData({...formData, type: e.target.value})}
                        >
                            <option value="oxford">Oxford House</option>
                            <option value="private">Private Ownership</option>
                            <option value="nonprofit">501(c)(3) Non-Profit</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-brand-navy/40">▼</div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-brand-navy/60 mb-2">EIN / Tax ID <span className="text-brand-coral">*</span></label>
                    <input 
                        type="text" 
                        placeholder="XX-XXXXXXX" 
                        maxLength={10}
                        className={`w-full bg-white p-4 border-2 ${errors.ein ? 'border-brand-coral text-brand-coral' : 'border-brand-navy/10 focus:border-brand-teal text-brand-navy'} outline-none font-bold transition-colors`}
                        value={formData.ein} 
                        onChange={e => {
                            // Basic formatting for EIN
                            let val = e.target.value.replace(/[^0-9]/g, '');
                            if (val.length > 2) val = val.substring(0, 2) + '-' + val.substring(2, 9);
                            setFormData({...formData, ein: val});
                            if (errors.ein) setErrors({...errors, ein: undefined});
                        }} 
                    />
                    {errors.ein && (
                        <span className="text-xs text-brand-coral font-bold mt-2 flex items-center gap-1 animate-slide-up">
                            <AlertCircle size={12} /> {errors.ein}
                        </span>
                    )}
                  </div>
               </div>
            </div>
            
            <div className="mt-12 flex justify-end">
               <button onClick={handleNext} className="bg-brand-navy text-white px-8 py-4 font-bold hover:bg-brand-teal transition-colors flex items-center gap-3 shadow-[4px_4px_0px_0px_rgba(26,42,58,0.1)]">
                 Verify & Continue <ArrowRight size={18} />
               </button>
            </div>
          </div>
        );

      case 2: // COMPLIANCE
        return (
          <div className="max-w-xl mx-auto animate-slide-up">
            <div className="mb-8 border-b-2 border-brand-navy/10 pb-4 flex justify-between items-end">
                <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-brand-navy/40 mb-2 block">Step 02</span>
                    <h3 className="font-display font-bold text-3xl text-brand-navy">Standard of Care</h3>
                </div>
                <div className="hidden md:block">
                    <Mascot expression="thinking" className="w-16 h-16" />
                </div>
            </div>
            
            <div className="bg-brand-cream border border-brand-navy/5 p-6 mb-8 text-sm text-brand-navy/70 leading-relaxed italic">
                "We confirm the following protocols are active and verifiable by on-site audit."
            </div>

            <div className="space-y-0 divide-y divide-brand-navy/10 border-y border-brand-navy/10">
               
               {/* MAT */}
               <label className="flex items-center gap-6 py-6 cursor-pointer group hover:bg-white transition-colors">
                  <div className={`w-6 h-6 border-2 flex items-center justify-center shrink-0 transition-all ${formData.acceptsMAT ? 'bg-brand-navy border-brand-navy text-white' : 'border-brand-navy/20 group-hover:border-brand-navy'}`}>
                     {formData.acceptsMAT && <CheckSquare size={14} />}
                  </div>
                  <input type="checkbox" className="hidden" checked={formData.acceptsMAT} onChange={() => setFormData({...formData, acceptsMAT: !formData.acceptsMAT})} />
                  <div className="flex-1">
                     <div className="font-bold text-brand-navy flex items-center gap-2">
                        MAT Protocol Active
                        {formData.acceptsMAT && <span className="text-[10px] font-bold uppercase bg-brand-teal/10 text-brand-teal px-2 py-0.5">Confirmed</span>}
                     </div>
                     <p className="text-sm text-brand-navy/50 mt-1">We support residents on prescribed Suboxone/Methadone maintenance.</p>
                  </div>
               </label>

               {/* Naloxone */}
               <label className="flex items-center gap-6 py-6 cursor-pointer group hover:bg-white transition-colors">
                  <div className={`w-6 h-6 border-2 flex items-center justify-center shrink-0 transition-all ${formData.hasNaloxone ? 'bg-brand-navy border-brand-navy text-white' : 'border-brand-navy/20 group-hover:border-brand-navy'}`}>
                     {formData.hasNaloxone && <CheckSquare size={14} />}
                  </div>
                  <input type="checkbox" className="hidden" checked={formData.hasNaloxone} onChange={() => setFormData({...formData, hasNaloxone: !formData.hasNaloxone})} />
                  <div className="flex-1">
                     <div className="font-bold text-brand-navy flex items-center gap-2">
                        Naloxone On-Site <span className="text-brand-coral">*</span>
                        {formData.hasNaloxone && <span className="text-[10px] font-bold uppercase bg-brand-teal/10 text-brand-teal px-2 py-0.5">Confirmed</span>}
                     </div>
                     <p className="text-sm text-brand-navy/50 mt-1">Emergency overdose kits are accessible in common areas.</p>
                  </div>
               </label>

               {/* Insurance */}
               <label className="flex items-center gap-6 py-6 cursor-pointer group hover:bg-white transition-colors">
                  <div className={`w-6 h-6 border-2 flex items-center justify-center shrink-0 transition-all ${formData.hasInsurance ? 'bg-brand-navy border-brand-navy text-white' : 'border-brand-navy/20 group-hover:border-brand-navy'}`}>
                     {formData.hasInsurance && <CheckSquare size={14} />}
                  </div>
                  <input type="checkbox" className="hidden" checked={formData.hasInsurance} onChange={() => setFormData({...formData, hasInsurance: !formData.hasInsurance})} />
                  <div className="flex-1">
                     <div className="font-bold text-brand-navy flex items-center gap-2">
                        Liability Insurance <span className="text-brand-coral">*</span>
                        {formData.hasInsurance && <span className="text-[10px] font-bold uppercase bg-brand-teal/10 text-brand-teal px-2 py-0.5">Confirmed</span>}
                     </div>
                     <p className="text-sm text-brand-navy/50 mt-1">Active Commercial General Liability coverage.</p>
                  </div>
               </label>
            </div>

            <div className="mt-6 flex flex-col gap-2">
                 {!formData.hasNaloxone && (
                    <div className="flex items-start gap-3 text-brand-navy/40 text-sm font-medium">
                        <AlertCircle size={16} className="mt-0.5 shrink-0" />
                        <span>Compliance: Naloxone availability is mandatory.</span>
                    </div>
                 )}
                 {!formData.hasInsurance && (
                    <div className="flex items-start gap-3 text-brand-navy/40 text-sm font-medium">
                        <AlertCircle size={16} className="mt-0.5 shrink-0" />
                        <span>Compliance: Liability Insurance is mandatory.</span>
                    </div>
                 )}
            </div>
            
            <div className="mt-12 flex justify-end">
               <button onClick={handleNext} className="bg-brand-navy text-white px-8 py-4 font-bold hover:bg-brand-teal transition-colors flex items-center gap-3 shadow-[4px_4px_0px_0px_rgba(26,42,58,0.1)]">
                 Certify Standards <ArrowRight size={18} />
               </button>
            </div>
          </div>
        );

      case 3: // PAYMENT
        return (
          <div className="max-w-xl mx-auto animate-slide-up">
            <div className="mb-8 border-b-2 border-brand-navy/10 pb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-brand-navy/40 mb-2 block">Step 03</span>
                <h3 className="font-display font-bold text-3xl text-brand-navy">Network Dues</h3>
            </div>

            {/* INVOICE UI */}
            <div className="bg-white border-2 border-brand-navy/10 p-8 shadow-xl relative overflow-hidden mb-8 group hover:border-brand-navy/30 transition-colors">
                {/* Dotted top */}
                <div className="absolute top-0 left-0 w-full h-1 bg-brand-navy/5" style={{backgroundImage: 'linear-gradient(to right, #1A2A3A 50%, transparent 50%)', backgroundSize: '10px 100%'}}></div>
                
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-brand-navy/40 mb-1">Bill To</div>
                        <h4 className="font-bold text-xl text-brand-navy">{formData.name || 'Your Facility'}</h4>
                        <p className="text-sm text-brand-navy/50">{new Date().toLocaleDateString()}</p>
                    </div>
                    <Receipt className="text-brand-navy/10" size={32} />
                </div>

                <div className="space-y-4 mb-8 border-y-2 border-brand-navy/5 py-6">
                    <div className="flex justify-between items-center">
                        <span className="text-brand-navy font-medium">Network Membership (Monthly)</span>
                        <span className="font-mono font-bold text-brand-navy">$99.00</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-brand-navy/60">
                        <span className="pl-4 border-l-2 border-brand-teal">Platform Access</span>
                        <span>Included</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-brand-navy/60">
                        <span className="pl-4 border-l-2 border-brand-teal">Direct Rent Deposits</span>
                        <span>Included</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-brand-navy/60">
                        <span className="pl-4 border-l-2 border-brand-teal">Safe Harbor Badge</span>
                        <span>Included</span>
                    </div>
                </div>

                <div className="flex justify-between items-end">
                    <span className="font-bold text-brand-navy text-lg">Total Due</span>
                    <span className="font-display font-bold text-4xl text-brand-navy">$99.00</span>
                </div>
            </div>
            
            <div className="mt-8 flex justify-end">
               <button onClick={handleNext} className="w-full bg-brand-navy text-white py-5 px-8 font-bold text-lg hover:bg-brand-teal transition-colors flex items-center justify-center gap-3 shadow-[4px_4px_0px_0px_rgba(26,42,58,0.2)]">
                 <Lock size={16} /> Process Contribution
               </button>
            </div>
            
            <div className="mt-6 flex justify-center gap-6 text-xs text-brand-navy/40 font-bold uppercase tracking-widest">
               <span className="flex items-center gap-1"><ShieldCheck size={12} /> Encrypted</span>
               <span className="flex items-center gap-1"><BadgeCheck size={12} /> Tax Deductible</span>
            </div>
          </div>
        );

      case 5: // SUCCESS
        return (
          <div className="flex flex-col items-center text-center animate-slide-up py-12 max-w-lg mx-auto">
            <div className="w-20 h-20 bg-brand-teal text-white flex items-center justify-center mb-8 shadow-[8px_8px_0px_0px_rgba(26,42,58,0.1)]">
               <CheckCircle2 size={40} />
            </div>
            <h2 className="font-display font-bold text-4xl text-brand-navy mb-4">Application Docketed.</h2>
            <p className="text-brand-navy/70 text-lg mb-8 leading-relaxed">
               Your facility <strong>{formData.name}</strong> is now in the review queue. <br/>
               Our compliance officer will contact you within 48 hours for the site audit.
            </p>
            
            <div className="w-full bg-brand-cream border-l-4 border-brand-navy p-6 text-left">
               <h4 className="font-bold text-brand-navy flex items-center gap-2 mb-2"><FileText size={16} /> Prepare for Audit</h4>
               <ul className="text-sm text-brand-navy/70 space-y-2 list-disc list-inside">
                  <li>Have your Liability Insurance certificate ready.</li>
                  <li>Ensure Naloxone kits are visible in common areas.</li>
                  <li>Have House Rules & Resident Agreements printed.</li>
               </ul>
            </div>
          </div>
        );
      
      default: return null;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-0 relative z-10 py-12">
      
      {/* Subtle Progress Bar */}
      {currentStep > 0 && currentStep < 5 && (
        <div className="mb-12 max-w-xl mx-auto">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-brand-navy/40 mb-2">
                <span>Progress</span>
                <span>Step {currentStep} of 4</span>
            </div>
            <div className="w-full h-1 bg-brand-navy/10">
                <div className="h-full bg-brand-navy transition-all duration-500" style={{ width: `${(currentStep / 4) * 100}%` }}></div>
            </div>
        </div>
      )}

      {isLoading ? (
         <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
            <div className="w-12 h-12 border-4 border-brand-navy/10 border-t-brand-teal animate-spin mb-6"></div>
            <h3 className="font-bold text-xl text-brand-navy">Processing Entity...</h3>
            <p className="text-brand-navy/40 text-sm mt-2">Verifying Ledger Entry</p>
         </div>
      ) : (
         renderStep()
      )}

    </div>
  );
};
