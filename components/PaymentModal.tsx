import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Lock, X, ChevronRight, CreditCard, Download, Check, AlertCircle } from 'lucide-react';
import { Mascot } from './Mascot';
import { useSound } from '../hooks/useSound';
import { useStore } from '../context/StoreContext';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: { label: string; sub: string; variant: any; };
  quantity: number;
  totalAmount: number;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, item, quantity, totalAmount, onSuccess }) => {
  const [step, setStep] = useState<'details' | 'processing' | 'success'>('details');
  const [processingStatus, setProcessingStatus] = useState("Securing Funds...");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  
  // Fake Card State (Simulating Stripe Elements)
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [zip, setZip] = useState('');
  const [errors, setErrors] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { playSuccess, playClick } = useSound();
  const { setShowLegalDocs } = useStore();
  
  const handleExecute = () => {
    if (!acceptedTerms) {
        setErrors("You must accept the Terms of Service to proceed.");
        playClick(); // Error sound
        return;
    }
    if (cardNumber.replace(/\s/g, '').length < 15) {
        setErrors("Please enter a valid card number (Mock: 4242...)");
        return;
    }
    if (!expiry || !cvc || !zip) {
        setErrors("Please fill in all payment fields.");
        return;
    }
    
    setErrors(null);
    setStep('processing');
    
    // NARRATIVE LOADING SEQUENCE
    setTimeout(() => setProcessingStatus("Securing Details..."), 800);
    setTimeout(() => setProcessingStatus(`Verifying ${item.sub} Vendor ID...`), 1600);
    setTimeout(() => setProcessingStatus("Generating Receipt..."), 2400);
    
    // Simulate API Latency
    setTimeout(() => {
      setStep('success');
      generateShareCard();
      onSuccess();
    }, 3000);
  };

  useEffect(() => { 
      if (isOpen) { 
          setStep('details'); 
          setProcessingStatus("Securing Funds...");
          setErrors(null); 
          setAcceptedTerms(false); 
          setCardNumber('');
          setExpiry('');
          setCvc('');
          setZip('');
      } 
  }, [isOpen]);

  const generateShareCard = () => {
     const canvas = canvasRef.current;
     if (!canvas) return;
     const ctx = canvas.getContext('2d');
     if (!ctx) return;
     canvas.width = 1200; canvas.height = 630;
     ctx.fillStyle = '#1A2A3A'; ctx.fillRect(0, 0, canvas.width, canvas.height);
     // Simple texture
     for(let i=0; i<5000; i++) { ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.05})`; ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2); }
     
     ctx.strokeStyle = '#FDFBF7'; ctx.lineWidth = 4; ctx.strokeRect(40, 40, 1120, 550);
     ctx.fillStyle = '#FDFBF7'; ctx.font = 'bold 30px sans-serif'; ctx.fillText('CERTIFIED IMPACT PORTFOLIO', 80, 90);
     ctx.fillStyle = '#2D9C8E'; ctx.font = 'bold 120px sans-serif'; ctx.fillText(`${quantity}x ${item.label}`, 80, 250);
     ctx.fillStyle = 'rgba(253, 251, 247, 0.6)'; ctx.font = '40px sans-serif'; ctx.fillText(`Directed to: ${item.sub}`, 80, 310);
     ctx.fillStyle = '#F4D35E'; ctx.fillRect(80, 450, 300, 80);
     ctx.fillStyle = '#1A2A3A'; ctx.font = 'bold 40px sans-serif'; ctx.fillText(`$${totalAmount.toFixed(2)}`, 130, 505);
     ctx.fillStyle = 'rgba(253, 251, 247, 0.1)'; ctx.font = 'bold 200px sans-serif'; ctx.fillText('SecondWind', 600, 500);
     ctx.fillStyle = '#FDFBF7'; ctx.font = '24px monospace'; ctx.fillText(`ISSUED: ${new Date().toLocaleDateString()}  |  ID: ${Math.floor(Math.random()*1000000)}`, 80, 560);
     setDownloadUrl(canvas.toDataURL('image/png'));
  };

  const handleDownload = () => {
     if (downloadUrl) {
        const link = document.createElement('a'); link.download = `SecondWind-Impact-${Date.now()}.png`; link.href = downloadUrl; link.click(); playSuccess();
     }
  };

  const formatCard = (val: string) => {
      const v = val.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
      const matches = v.match(/\d{4,16}/g);
      const match = matches && matches[0] || '';
      const parts = [];
      for (let i=0, len=match.length; i<len; i+=4) {
          parts.push(match.substring(i, i+4));
      }
      if (parts.length) return parts.join(' ');
      return val;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-4">
      <canvas ref={canvasRef} className="hidden" />
      <div className="absolute inset-0 bg-brand-navy/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className={`w-full max-w-2xl bg-white rounded-t-[2rem] md:rounded-3xl shadow-2xl relative overflow-hidden flex flex-col transition-all duration-500 max-h-[90dvh] h-full md:h-auto ${step === 'success' ? 'scale-100 md:scale-105' : 'scale-100'}`}>
        
        <div className="flex items-center justify-between px-6 py-4 md:px-8 md:py-6 border-b border-brand-navy/5 bg-brand-cream shrink-0">
          <div className="flex items-center gap-3"><div className="bg-brand-navy p-2 rounded-lg text-white"><ShieldCheck size={20} /></div><span className="font-bold text-brand-navy text-sm md:text-base">Secure Checkout</span></div>
          <button onClick={onClose} className="text-brand-navy/40 hover:text-brand-navy transition-colors p-2"><X size={24} /></button>
        </div>

        <div className="p-6 md:p-12 relative flex-1 overflow-y-auto flex flex-col pb-12 md:pb-12">
          {step === 'details' && (
            <div className="flex-1 flex flex-col animate-slide-up">
              <h3 className="font-display font-bold text-2xl md:text-3xl text-brand-navy mb-2">Secure Payment</h3>
              <p className="text-brand-navy/60 mb-8">Funding <strong className="text-brand-navy">{quantity} units</strong> of <strong className="text-brand-teal">{item.label}</strong>.</p>
              
              <div className="bg-brand-cream border border-brand-navy/5 rounded-2xl p-4 md:p-6 mb-8 flex items-center justify-between">
                <div><span className="text-xs font-bold uppercase tracking-widest text-brand-navy/40">Total Due</span><div className="text-3xl md:text-4xl font-display font-bold text-brand-navy">${totalAmount.toFixed(2)}</div></div>
                <div className="text-right"><span className="text-xs font-bold uppercase tracking-widest text-brand-navy/40">Tax Receipt</span><div className="text-brand-teal font-bold flex items-center justify-end gap-1"><Check size={16} strokeWidth={4} /> Automated</div></div>
              </div>

              {/* Simulated Stripe Elements Container */}
              <div className="bg-white border border-brand-navy/10 rounded-xl p-4 mb-4 shadow-inner space-y-3">
                  <div className="flex items-center gap-2 mb-1 text-xs font-bold uppercase tracking-widest text-brand-navy/40">
                      <CreditCard size={14} /> Card Information
                  </div>
                  
                  {/* Card Number */}
                  <div className="border border-brand-navy/10 rounded-lg px-3 py-2 flex items-center gap-3 focus-within:ring-2 focus-within:ring-brand-teal/20 transition-all">
                      <CreditCard className="text-brand-navy/30" size={20} />
                      <input 
                        type="text" 
                        placeholder="0000 0000 0000 0000" 
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCard(e.target.value))}
                        className="w-full bg-transparent text-lg font-mono text-brand-navy placeholder:text-brand-navy/20 outline-none"
                        maxLength={19}
                      />
                  </div>

                  <div className="flex gap-3">
                      <div className="flex-1 border border-brand-navy/10 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-brand-teal/20">
                          <input 
                            type="text" 
                            placeholder="MM / YY"
                            maxLength={5}
                            value={expiry}
                            onChange={(e) => setExpiry(e.target.value)}
                            className="w-full bg-transparent text-base font-mono text-brand-navy placeholder:text-brand-navy/20 outline-none" 
                          />
                      </div>
                      <div className="flex-1 border border-brand-navy/10 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-brand-teal/20">
                           <input 
                            type="text" 
                            placeholder="CVC" 
                            maxLength={4}
                            value={cvc}
                            onChange={(e) => setCvc(e.target.value)}
                            className="w-full bg-transparent text-base font-mono text-brand-navy placeholder:text-brand-navy/20 outline-none" 
                          />
                      </div>
                      <div className="flex-1 border border-brand-navy/10 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-brand-teal/20">
                           <input 
                            type="text" 
                            placeholder="ZIP" 
                            maxLength={5}
                            value={zip}
                            onChange={(e) => setZip(e.target.value)}
                            className="w-full bg-transparent text-base font-mono text-brand-navy placeholder:text-brand-navy/20 outline-none" 
                          />
                      </div>
                  </div>
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start gap-3 mb-6 cursor-pointer group bg-brand-navy/5 p-3 rounded-lg border border-transparent hover:border-brand-navy/10 transition-colors">
                  <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${acceptedTerms ? 'bg-brand-navy border-brand-navy text-white' : 'border-brand-navy/20 group-hover:border-brand-navy'}`}>
                      {acceptedTerms && <Check size={12} />}
                  </div>
                  <input type="checkbox" className="hidden" checked={acceptedTerms} onChange={() => setAcceptedTerms(!acceptedTerms)} />
                  <span className="text-xs text-brand-navy/60">
                    I agree to the <button onClick={(e) => { e.preventDefault(); setShowLegalDocs(true); }} className="underline text-brand-navy hover:text-brand-teal font-bold">Terms of Service</button>. 
                    I understand this is a non-refundable charitable contribution.
                  </span>
              </label>

              {errors && (
                  <div className="mb-4 bg-brand-coral/10 text-brand-coral p-3 rounded-lg text-sm font-bold flex items-center gap-2 animate-slide-up">
                      <AlertCircle size={16} /> {errors}
                  </div>
              )}

              <button onClick={() => { playClick(); handleExecute(); }} className="mt-auto w-full bg-brand-teal text-white font-bold py-4 rounded-xl shadow-[0_10px_20px_-5px_rgba(45,156,142,0.4)] hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shrink-0 min-h-[50px]">Complete Transaction <ChevronRight /></button>
              <div className="mt-4 text-center shrink-0"><span className="text-xs text-brand-navy/40 flex items-center justify-center gap-1"><Lock size={10} /> PCI-DSS Compliant via Stripe</span></div>
            </div>
          )}

          {step === 'processing' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center animate-slide-up min-h-[300px]">
               <div className="w-32 h-32 md:w-48 md:h-48 mb-6 relative"><div className="absolute inset-0 bg-brand-teal/20 rounded-full animate-ping"></div><Mascot expression="thinking" className="relative z-10" /></div>
               <h3 className="font-display font-bold text-2xl text-brand-navy mb-2 animate-pulse">{processingStatus}</h3>
               <p className="text-brand-navy/60 max-w-sm">We are routing this directly to the {item.sub} verified vendor account.</p>
            </div>
          )}

          {step === 'success' && (
            <div className="flex-1 flex flex-col items-center animate-slide-up">
               <div className="w-20 h-20 md:w-24 md:h-24 mb-4 relative"><div className="absolute inset-0 bg-brand-yellow/20 rounded-full animate-pulse"></div><Mascot expression="celebration" className="relative z-10" /></div>
               <h3 className="font-display font-bold text-2xl md:text-3xl text-brand-navy mb-2 text-center">Investment Deployed!</h3>
               
               {downloadUrl ? (
                   <div className="w-full max-w-sm aspect-video bg-brand-navy rounded-xl shadow-lg mb-6 overflow-hidden relative group cursor-pointer border-4 border-brand-cream" onClick={handleDownload}><img src={downloadUrl} alt="Certificate" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" /><div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"><Download className="text-white" size={32} /></div></div>
               ) : (<div className="w-full max-w-sm h-32 bg-brand-navy/10 rounded-xl animate-pulse mb-6"></div>)}

               <div className="flex flex-col sm:flex-row gap-3 w-full shrink-0">
                  <button onClick={handleDownload} className="flex-1 bg-brand-navy text-white font-bold py-3 rounded-xl shadow-lg hover:bg-brand-teal transition-colors flex items-center justify-center gap-2 min-h-[50px]"><Download size={18} /> Save Receipt</button>
                  <button onClick={onClose} className="px-6 py-3 border-2 border-brand-navy/10 rounded-xl font-bold text-brand-navy hover:bg-brand-cream transition-colors min-h-[50px]">Close</button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};