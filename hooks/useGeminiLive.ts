
import { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type } from "@google/genai";
import { useStore } from '../context/StoreContext';

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
      disqualification_reason: {
        type: Type.STRING,
        description: 'If disqualified or coaching only, why? (e.g. "Not in CO", "Active Use", "Cash Request", "Crisis"). If fully qualified, leave empty.',
      },
      need_type: {
        type: Type.STRING,
        description: 'The type of assistance needed (e.g., Rent, Laptop, Bus Pass).',
      },
      urgency: {
        type: Type.STRING,
        description: 'How urgent the request is (e.g., Immediate, Next Week).',
      },
      has_medicaid: {
        type: Type.BOOLEAN,
        description: 'Whether the user has active Medicaid insurance.',
      },
      details: {
        type: Type.STRING,
        description: 'Summary of the user\'s situation, sobriety date, living arrangement, and recovery plan.',
      }
    },
    required: ['qualification_status', 'need_type', 'details', 'has_medicaid']
  }
};

export const useGeminiLive = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeakingState] = useState(false);
  const isSpeakingRef = useRef(false);
  const [volume, setVolume] = useState(0);
  const { submitIntakeRequest, addNotification } = useStore();

  const audioContextRef = useRef<AudioContext | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const wsRef = useRef<any>(null); // To store session
  const nextStartTimeRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const setIsSpeaking = (val: boolean) => {
    setIsSpeakingState(val);
    isSpeakingRef.current = val;
  };

  // Audio Processing Helpers
  const createBlob = (data: Float32Array) => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    const bytes = new Uint8Array(int16.buffer);
    let binary = '';
    for(let i=0; i<bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return {
      data: btoa(binary),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const decodeAudioData = async (base64: string, ctx: AudioContext) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const dataInt16 = new Int16Array(bytes.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
  };

  const connect = useCallback(async () => {
    if (isConnected) return;

    try {
      // 1. Setup Audio Context
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx({ sampleRate: 24000 }); // Output rate
      audioContextRef.current = ctx;
      
      // Analyser for visualization
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      // 2. Setup Input Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: 16000, channelCount: 1 } });
      const inputCtx = new AudioCtx({ sampleRate: 16000 }); // Separate context for input if needed, or reuse if sample rates align
      const source = inputCtx.createMediaStreamSource(stream);
      inputSourceRef.current = source;
      
      // Processor
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      // 3. Connect Gemini
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: {
             parts: [{ text: "You are Windy, a strict but kind Intake Specialist for SecondWind. Your job is to SCREEN applicants. \n\nPROTOCOL:\n1. Ask Location (CO only).\n2. Ask Safety (If crisis, direct to 988 and STOP).\n3. Ask Sobriety Date (>30 days preferred).\n4. Ask Housing Status.\n5. Ask Medicaid Status.\n6. Ask Specific Vendor Need (No cash).\n\nDISQUALIFICATION RULES:\n- If Suicidal/Crisis -> STOP immediately, tell them to call 988.\n- If Active Use -> Disqualify for cash, offer Peer Coaching if Medicaid.\n- If Cash request -> Disqualify.\n\nKeep conversation on track. If they veer off-topic, gently guide them back to the intake steps." }]
          },
          tools: [{ functionDeclarations: [submitApplicationTool] }]
        },
        callbacks: {
          onopen: () => {
            console.log("Gemini Live Connected");
            setIsConnected(true);
            
            // Start Streaming Audio
            processor.onaudioprocess = (e) => {
               const inputData = e.inputBuffer.getChannelData(0);
               const blob = createBlob(inputData);
               
               // Calculate input volume for visualizer only if not speaking to avoid noise
               if (!isSpeakingRef.current) {
                  let sum = 0;
                  for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
                  const rms = Math.sqrt(sum / inputData.length);
                  setVolume(Math.min(1, rms * 8)); // Boost input gain visually
               }

               sessionPromise.then(session => session.sendRealtimeInput({ media: blob }));
            };
            source.connect(processor);
            processor.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
             // 1. Handle Tool Calls
             if (msg.toolCall) {
                for (const fc of msg.toolCall.functionCalls) {
                   if (fc.name === 'submit_application') {
                      const args = fc.args as any;
                      const status = args.qualification_status;
                      const reason = args.disqualification_reason || 'Met all criteria';
                      
                      // Format for the dashboard
                      let details = `${args.details} \n\n[STATUS: ${status}]`;
                      if (status !== 'QUALIFIED_FUNDING') details += `\n[REASON: ${reason}]`;
                      
                      submitIntakeRequest({
                         type: args.need_type,
                         details: details
                      });

                      // Show immediate feedback toast based on decision
                      if (status === 'QUALIFIED_FUNDING') {
                          addNotification('success', 'Application Qualified & Submitted for Review');
                      } else if (status === 'QUALIFIED_COACHING') {
                          addNotification('info', 'Routing to Peer Coaching (Medicaid Eligible)');
                      } else {
                          addNotification('error', 'Application Disqualified: ' + reason);
                      }

                      // Respond to model
                      sessionPromise.then(session => session.sendToolResponse({
                        functionResponses: {
                           name: fc.name,
                           id: fc.id,
                           response: { result: 'Submission Recorded' }
                        }
                      }));
                   }
                }
             }

             // 2. Handle Audio Output
             const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
             if (audioData && audioContextRef.current) {
                setIsSpeaking(true);
                const buffer = await decodeAudioData(audioData, audioContextRef.current);
                
                const source = audioContextRef.current.createBufferSource();
                source.buffer = buffer;
                
                // Connect to analyser for output visualization
                source.connect(analyserRef.current!); 
                analyserRef.current!.connect(audioContextRef.current.destination);

                const now = audioContextRef.current.currentTime;
                // Schedule next chunk
                const start = Math.max(now, nextStartTimeRef.current);
                source.start(start);
                nextStartTimeRef.current = start + buffer.duration;
                
                source.onended = () => {
                   if (audioContextRef.current && audioContextRef.current.currentTime >= nextStartTimeRef.current) {
                      setIsSpeaking(false);
                   }
                };
             }
          },
          onclose: () => {
             setIsConnected(false);
          },
          onerror: (err) => {
             console.error("Gemini Live Error", err);
             setIsConnected(false);
          }
        }
      });

      wsRef.current = sessionPromise;

    } catch (e) {
       console.error("Failed to connect live", e);
    }
  }, [isConnected, submitIntakeRequest, addNotification]);

  const disconnect = useCallback(() => {
     if (processorRef.current) processorRef.current.disconnect();
     if (inputSourceRef.current) inputSourceRef.current.disconnect();
     if (audioContextRef.current) audioContextRef.current.close();
     // Close session logic if exposed, otherwise rely on cleanup
     wsRef.current = null;
     setIsConnected(false);
     setVolume(0);
     setIsSpeaking(false);
  }, []);

  // Visualizer loop
  useEffect(() => {
    let raf: number;
    const updateVol = () => {
       if (analyserRef.current && isSpeakingRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for(const a of dataArray) sum += a;
          const avg = sum / dataArray.length;
          setVolume(avg / 128); // Normalize roughly 0-1
       }
       raf = requestAnimationFrame(updateVol);
    };
    raf = requestAnimationFrame(updateVol);
    return () => cancelAnimationFrame(raf);
  }, [isSpeaking]);

  return { connect, disconnect, isConnected, isSpeaking, volume };
};
