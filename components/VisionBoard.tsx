import React, { useState } from 'react';
import { Image, Sparkles, Download, RefreshCw, Loader2, Maximize2 } from 'lucide-react';
import { generateVisionImage } from '../services/geminiService';
import { useSound } from '../hooks/useSound';
import { useStore } from '../context/StoreContext';

const SIZES = ['1K', '2K', '4K'] as const;

export const VisionBoard: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedSize, setSelectedSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { playClick, playSuccess } = useSound();
  const { addNotification } = useStore();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    playClick();
    
    try {
        const result = await generateVisionImage(prompt, selectedSize);
        setImage(result);
        playSuccess();
    } catch (e) {
        addNotification('error', 'Failed to generate vision. Please try again.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (image) {
        const link = document.createElement('a');
        link.download = `SecondWind-Vision-${Date.now()}.png`;
        link.href = image;
        link.click();
        playClick();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#FDFBF7] rounded-[2rem] shadow-2xl overflow-hidden border-4 border-white flex flex-col md:flex-row h-auto md:h-[700px]">
        
        {/* Controls */}
        <div className="w-full md:w-1/3 bg-brand-navy p-8 text-white flex flex-col relative overflow-hidden shrink-0">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-teal/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            
            <div className="mb-8 relative z-10">
                <div className="flex items-center gap-3 mb-2 text-brand-teal">
                    <Sparkles size={24} />
                    <span className="font-bold uppercase tracking-widest text-xs">AI Visualization</span>
                </div>
                <h3 className="font-display font-bold text-3xl">Vision Board</h3>
                <p className="text-brand-lavender/60 text-sm mt-2">Visualize your recovery goals. See the future you are building.</p>
            </div>

            <div className="space-y-6 relative z-10 flex-1">
                <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-brand-lavender/40 mb-2 block">Your Vision</label>
                    <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g. A peaceful cabin in the mountains, sunrise, cozy interior, books and coffee..."
                        className="w-full bg-white/10 border-2 border-white/20 rounded-xl p-4 text-lg text-white placeholder:text-white/20 focus:outline-none focus:border-brand-yellow focus:bg-white/20 transition-all resize-none h-40"
                    />
                </div>

                <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-brand-lavender/40 mb-2 block">Resolution</label>
                    <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
                        {SIZES.map(s => (
                            <button
                                key={s}
                                onClick={() => { setSelectedSize(s); playClick(); }}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${selectedSize === s ? 'bg-brand-teal text-white shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/10'}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <button 
                onClick={handleGenerate}
                disabled={isLoading || !prompt.trim()}
                className="mt-8 w-full bg-white text-brand-navy font-bold py-4 rounded-xl hover:bg-brand-yellow hover:text-brand-navy transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:bg-white disabled:cursor-not-allowed group relative z-10"
            >
                {isLoading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />}
                {isLoading ? 'Dreaming...' : 'Generate Vision'}
            </button>
        </div>

        {/* Canvas - Enforced Height on Mobile */}
        <div className="flex-1 bg-[#151515] relative flex items-center justify-center p-8 overflow-hidden min-h-[400px] md:min-h-0">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            
            {image ? (
                <div className="relative group w-full h-full flex items-center justify-center">
                    <img src={image} alt="Generated Vision" className="max-w-full max-h-full rounded-lg shadow-2xl object-contain animate-in zoom-in-95 duration-500" />
                    <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={handleDownload} className="bg-brand-navy/80 hover:bg-brand-teal text-white p-3 rounded-full backdrop-blur-md transition-colors" title="Download">
                            <Download size={20} />
                        </button>
                        <button onClick={() => window.open(image, '_blank')} className="bg-brand-navy/80 hover:bg-brand-teal text-white p-3 rounded-full backdrop-blur-md transition-colors" title="Full Screen">
                            <Maximize2 size={20} />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-center opacity-30">
                    <Image size={64} className="mx-auto mb-4 text-white" />
                    <p className="text-white font-mono text-sm">Waiting for input...</p>
                </div>
            )}
        </div>

    </div>
  );
};