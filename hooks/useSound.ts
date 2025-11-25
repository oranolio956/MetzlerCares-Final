
import { useCallback, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';

export const useSound = () => {
  const { isSoundEnabled } = useStore();
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const initAudio = () => {
        if (!audioContextRef.current) {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioCtx) {
                audioContextRef.current = new AudioCtx();
            }
        }
    };
    // Initialize on first interaction to bypass autoplay policies
    const handleInteraction = () => {
        initAudio();
        if (audioContextRef.current?.state === 'suspended') {
            audioContextRef.current.resume();
        }
        window.removeEventListener('click', handleInteraction);
        window.removeEventListener('keydown', handleInteraction);
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);

    return () => {
        window.removeEventListener('click', handleInteraction);
        window.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  const playOscillator = useCallback((type: 'sine' | 'square' | 'triangle', freq: number, duration: number, vol: number = 0.1) => {
    if (!isSoundEnabled || !audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(vol, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  }, [isSoundEnabled]);

  const playHover = useCallback(() => {
    // High pitched, very short blip
    playOscillator('sine', 800, 0.05, 0.02);
  }, [playOscillator]);

  const playClick = useCallback(() => {
    // Thock sound
    playOscillator('triangle', 150, 0.1, 0.05);
  }, [playOscillator]);

  const playSuccess = useCallback(() => {
    if (!isSoundEnabled || !audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    // Major Chord Sweep
    [440, 554.37, 659.25, 880].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.05);
        gain.gain.setValueAtTime(0, now + i * 0.05);
        gain.gain.linearRampToValueAtTime(0.1, now + i * 0.05 + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 1.5);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 1.5);
    });
  }, [isSoundEnabled]);

  const playTyping = useCallback(() => {
     // Subtle noise burst for typing
     if (!isSoundEnabled || !audioContextRef.current) return;
     const ctx = audioContextRef.current;
     const bufferSize = ctx.sampleRate * 0.05; // 50ms
     const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
     const data = buffer.getChannelData(0);

     for (let i = 0; i < bufferSize; i++) {
         data[i] = Math.random() * 2 - 1;
     }

     const noise = ctx.createBufferSource();
     noise.buffer = buffer;
     const gain = ctx.createGain();
     
     // Low pass filter to soften the noise
     const filter = ctx.createBiquadFilter();
     filter.type = 'lowpass';
     filter.frequency.value = 1000;

     gain.gain.setValueAtTime(0.02, ctx.currentTime);
     gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

     noise.connect(filter);
     filter.connect(gain);
     gain.connect(ctx.destination);
     noise.start();
  }, [isSoundEnabled]);

  return { playHover, playClick, playSuccess, playTyping };
};
