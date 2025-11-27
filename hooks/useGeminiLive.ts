import { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type } from "@google/genai";
import { useStore } from '../context/StoreContext';
import { SYSTEM_INSTRUCTION } from '../services/geminiService';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const submitApplicationTool: FunctionDeclaration = {
  name: 'submit_application',
  description: 'Submit the user\'s application after the comprehensive screening is complete. Call this ONLY after determining qualification status.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      qualification_status: {
        type: Type.STRING,
        description: 'The final decision: "QUALIFIED_FUNDING", "QUALIFIED_COACHING", or "DISQUALIFIED".',
      },
      reasoning: {
        type: Type.STRING,
        description: 'Brief reason for the decision.',
      }
    },
    required: ['qualification_status', 'reasoning'],
  },
};

export const useGeminiLive = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [volume, setVolume] = useState(0);
    const { addNotification, submitIntakeRequest } = useStore();
    const [connected, setConnected] = useState(false);
    
    // Audio Context Refs
    const audioContextRef = useRef<AudioContext | null>(null);
    const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const outputNodeRef = useRef<GainNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    
    // Session
    const sessionRef = useRef<any>(null); // Type is roughly LiveSession
    const nextStartTimeRef = useRef<number>(0);

    const connect = useCallback(async () => {
        try {
            // Check for API Key or Backend Token
            if (!GEMINI_API_KEY) {
                throw new Error("Voice mode requires VITE_GEMINI_API_KEY to be set.");
            }

            const client = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
            
            // Setup Audio Contexts
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioCtx({ sampleRate: 24000 }); // Output rate
            audioContextRef.current = ctx;
            
            // Output Node
            const outputNode = ctx.createGain();
            outputNode.connect(ctx.destination);
            outputNodeRef.current = outputNode;

            // Input Stream with explicit error handling for permissions
            let stream;
            try {
                stream = await navigator.mediaDevices.getUserMedia({ audio: {
                    sampleRate: 16000,
                    channelCount: 1,
                    echoCancellation: true,
                    autoGainControl: true,
                    noiseSuppression: true
                }});
            } catch (err: any) {
                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    throw new Error("Microphone access denied. Please allow permission in your browser settings.");
                } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                     throw new Error("No microphone device found.");
                } else {
                     throw new Error("Could not access microphone.");
                }
            }
            
            streamRef.current = stream;

            // Input Processing
            const inputCtx = new AudioCtx({ sampleRate: 16000 });
            const source = inputCtx.createMediaStreamSource(stream);
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            inputSourceRef.current = source as any; 
            processorRef.current = processor;

            source.connect(processor);
            processor.connect(inputCtx.destination);

            // Start Session
            const sessionPromise = client.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        console.log("Live Session Connected");
                        setConnected(true);
                        addNotification('success', 'Voice connection established');
                        
                        // Start sending audio
                        processor.onaudioprocess = (e) => {
                            const inputData = e.inputBuffer.getChannelData(0);
                            
                            // Calculate Volume for UI Visualization
                            let sum = 0;
                            for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
                            const rms = Math.sqrt(sum / inputData.length);
                            setVolume(Math.min(rms * 5, 1)); 
                            
                            // Convert to PCM16
                            const pcmData = new Int16Array(inputData.length);
                            for (let i = 0; i < inputData.length; i++) {
                                let s = Math.max(-1, Math.min(1, inputData[i]));
                                pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                            }
                            
                            // Encode base64 manually
                            let binary = '';
                            const bytes = new Uint8Array(pcmData.buffer);
                            const len = bytes.byteLength;
                            for (let i = 0; i < len; i++) {
                                binary += String.fromCharCode(bytes[i]);
                            }
                            const base64 = btoa(binary);
                            
                            sessionPromise.then(session => {
                                session.sendRealtimeInput({
                                    media: {
                                        mimeType: 'audio/pcm;rate=16000',
                                        data: base64
                                    }
                                });
                            });
                        };
                    },
                    onmessage: async (msg: LiveServerMessage) => {
                        const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                        if (audioData) {
                            setIsSpeaking(true);
                            if (audioContextRef.current) {
                                const ctx = audioContextRef.current;
                                const byteStr = atob(audioData);
                                const bytes = new Uint8Array(byteStr.length);
                                for (let i = 0; i < byteStr.length; i++) bytes[i] = byteStr.charCodeAt(i);
                                
                                const dataInt16 = new Int16Array(bytes.buffer);
                                const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
                                const channelData = buffer.getChannelData(0);
                                for (let i = 0; i < dataInt16.length; i++) {
                                    channelData[i] = dataInt16[i] / 32768.0;
                                }

                                const source = ctx.createBufferSource();
                                source.buffer = buffer;
                                source.connect(outputNodeRef.current!);
                                
                                const now = ctx.currentTime;
                                const start = Math.max(now, nextStartTimeRef.current);
                                source.start(start);
                                nextStartTimeRef.current = start + buffer.duration;
                                
                                source.onended = () => {
                                    if (ctx.currentTime >= nextStartTimeRef.current - 0.1) {
                                        setIsSpeaking(false);
                                    }
                                };
                            }
                        }

                        if (msg.serverContent?.turnComplete) setIsSpeaking(false);
                        
                        if (msg.serverContent?.interrupted) {
                             nextStartTimeRef.current = 0;
                             setIsSpeaking(false);
                        }

                        if (msg.toolCall) {
                             for (const fc of msg.toolCall.functionCalls) {
                                 if (fc.name === 'submit_application') {
                                     const args = fc.args as any;
                                     submitIntakeRequest({
                                         type: `Voice Intake: ${args.qualification_status}`,
                                         details: args.reasoning
                                     });
                                     
                                     sessionPromise.then(s => s.sendToolResponse({
                                         functionResponses: {
                                             id: fc.id,
                                             name: fc.name,
                                             response: { result: 'Application Submitted' }
                                         }
                                     }));
                                     
                                     addNotification('success', `Intake Completed: ${args.qualification_status}`);
                                 }
                             }
                        }
                    },
                    onclose: () => {
                        console.log("Session Closed");
                        setConnected(false);
                    },
                    onerror: (e) => {
                        console.error("Session Error", e);
                        addNotification('error', 'Voice connection interrupted.');
                        setConnected(false);
                    }
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
                    },
                    systemInstruction: SYSTEM_INSTRUCTION,
                    tools: [{ functionDeclarations: [submitApplicationTool] }]
                }
            });
            
            sessionRef.current = sessionPromise;

        } catch (error: any) {
            console.error(error);
            addNotification('error', error.message || 'Failed to initialize voice mode');
        }
    }, [addNotification, submitIntakeRequest]);

    const disconnect = useCallback(() => {
        if (sessionRef.current) {
            sessionRef.current.then((s: any) => s.close());
            sessionRef.current = null;
        }
        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current.onaudioprocess = null;
            processorRef.current = null;
        }
        if (inputSourceRef.current) {
            inputSourceRef.current.disconnect();
            inputSourceRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        setConnected(false);
        setIsSpeaking(false);
        setVolume(0);
    }, []);

    return { connect, disconnect, isSpeaking, volume, connected };
};