import React, { memo, useId, useState, useEffect } from 'react';

export interface MascotProps {
  expression?: 'happy' | 'thinking' | 'excited' | 'wink' | 'celebration' | 'confused';
  variant?: 'default' | 'tech' | 'home' | 'commute';
  className?: string;
  lookAt?: { x: number; y: number };
  reactToScroll?: boolean;
}

export const Mascot: React.FC<MascotProps> = memo(({ 
  expression = 'happy', 
  variant = 'default', 
  className = '',
  lookAt,
  reactToScroll = false
}) => {
  const uid = useId().replace(/:/g, ''); // Generate unique ID for SVG defs
  const [isBlinking, setIsBlinking] = useState(false);
  const [scrollExpression, setScrollExpression] = useState<MascotProps['expression'] | null>(null);
  
  // Eye tracking logic
  // We use CSS variables for global mouse, or props for fixed lookAt
  // Multiplier adjusted for subtle, realistic range
  const pupilX = lookAt ? lookAt.x * 8 : 'var(--mouse-x, 0) * 8';
  const pupilY = lookAt ? lookAt.y * 8 : 'var(--mouse-y, 0) * 8';
  
  const pupilStyle = {
    transform: `translate(calc(${pupilX}px), calc(${pupilY}px))`,
    transition: 'transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)' // Smooth dampening
  };

  // Organic Blinking Logic
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const triggerBlink = () => {
      // Don't blink if in a special expression state that overrides eyes
      if (['happy', 'excited', 'thinking', 'default'].includes(activeExpression)) {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 180); // Slightly slower blink for cuteness
      }
      
      // Schedule next blink randomly between 3s and 8s (less frantic)
      const nextBlink = Math.random() * 5000 + 3000;
      timeoutId = setTimeout(triggerBlink, nextBlink);
    };

    // Initial blink delay
    timeoutId = setTimeout(triggerBlink, 2000);

    return () => clearTimeout(timeoutId);
  }, [expression, scrollExpression]);

  // Scroll Reaction Logic
  useEffect(() => {
    if (!reactToScroll) return;

    let lastScrollY = window.scrollY;
    let timeoutId: ReturnType<typeof setTimeout>;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const diff = currentScrollY - lastScrollY;
          
          if (Math.abs(diff) > 5) {
            if (diff > 0) {
              // Scrolling Down - "Wink" / Nod
              setScrollExpression('wink');
            } else {
              // Scrolling Up - Return to neutral (null uses prop expression)
              setScrollExpression(null);
            }
            
            // Debounce reset
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
              setScrollExpression(null);
            }, 800);
          }
          
          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [reactToScroll]);

  // Determine active expression (Scroll overrides prop if active)
  const activeExpression = scrollExpression || expression;
  const showBlink = isBlinking && !['wink', 'confused', 'celebration'].includes(activeExpression);

  return (
    <svg 
      viewBox="0 0 400 400" 
      className={`w-full h-full ${className}`} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`Windy the Cloud Spirit looking ${activeExpression}`}
      style={{ overflow: 'visible' }}
    >
      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        @keyframes shimmer {
          0%, 100% { stop-color: #FDFBF7; }
          50% { stop-color: #E6F4F1; }
        }
        .mascot-breathe {
          animation: breathe 4s ease-in-out infinite;
          transform-origin: center center;
        }
        .mascot-transition {
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>

      <defs>
        {/* Main Body Gradient - Gives the 3D Sphere look */}
        <radialGradient id={`bodyGrad-${uid}`} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(160 160) rotate(90) scale(220)">
          <stop className="animate-pulse" style={{ animationDuration: '4s' }} stopColor="#FDFBF7" />
          <stop offset="0.4" stopColor="#E6F4F1" />
          <stop offset="1" stopColor="#2D9C8E" />
        </radialGradient>

        {/* Shadow Gradient */}
        <radialGradient id={`shadowGrad-${uid}`} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(200 380) rotate(90) scale(80 200)">
          <stop stopColor="#1A2A3A" stopOpacity="0.3"/>
          <stop offset="1" stopColor="#1A2A3A" stopOpacity="0"/>
        </radialGradient>

        {/* Blush Gradient */}
        <radialGradient id={`blushGrad-${uid}`}>
          <stop stopColor="#FF8A75" stopOpacity="0.6"/>
          <stop offset="1" stopColor="#FF8A75" stopOpacity="0"/>
        </radialGradient>

        {/* Goggle Lens Gradient */}
        <linearGradient id={`lensGrad-${uid}`} x1="0" y1="0" x2="0" y2="1">
           <stop stopColor="#2D9C8E" stopOpacity="0.6" />
           <stop offset="1" stopColor="#1A2A3A" stopOpacity="0.8" />
        </linearGradient>
        
        {/* Hologram Gradient */}
        <linearGradient id={`holoGrad-${uid}`} x1="0" y1="0" x2="1" y2="1">
           <stop stopColor="#A7ACD9" stopOpacity="0.8" />
           <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.9" />
           <stop offset="1" stopColor="#A7ACD9" stopOpacity="0.8" />
        </linearGradient>

        {/* Filters for Softness */}
        <filter id={`softGlow-${uid}`}>
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Drop Shadow - Scales inversely to float to ground it */}
      <ellipse cx="200" cy="360" rx="80" ry="15" fill={`url(#shadowGrad-${uid})`} className="animate-pulse" style={{ animationDuration: '6s' }} />

      {/* Main Character Group */}
      <g className="animate-float" style={{ transformOrigin: '200px 200px' }}>
        
        {/* === BODY & HEAD (Breathing) === */}
        <g className="mascot-breathe">
            {/* The "Tail" / Lower Body */}
            <path 
            d="M200 340 C150 340 140 280 140 250 C140 250 120 280 80 260 C60 250 160 380 200 380 C240 380 340 250 320 260 C280 280 260 250 260 250 C260 280 250 340 200 340 Z" 
            fill="#2D9C8E" 
            />

            {/* The Head - Soft spherical shape with a cowlick */}
            <path 
            d="M200 60 
                C120 60 60 120 60 200 
                C60 280 120 340 200 340 
                C280 340 340 280 340 200 
                C340 140 300 80 250 70
                C250 70 280 20 200 40 
                C180 45 200 60 200 60 Z"
            fill={`url(#bodyGrad-${uid})`}
            filter={`url(#softGlow-${uid})`}
            />
            
            {/* Highlight on Head (Glossy/Wet look) */}
            <ellipse cx="140" cy="120" rx="40" ry="25" fill="white" fillOpacity="0.4" transform="rotate(-30 140 120)" />
        </g>


        {/* === FACE === */}
        <g transform="translate(0, 10)">
           
           {/* Cheeks - Fade in/out based on expression */}
           <g className="transition-opacity duration-500" style={{ opacity: activeExpression === 'excited' || activeExpression === 'happy' ? 1 : 0.5 }}>
             <circle cx="110" cy="220" r="25" fill={`url(#blushGrad-${uid})`} />
             <circle cx="290" cy="220" r="25" fill={`url(#blushGrad-${uid})`} />
           </g>

           {/* Eyes Container */}
           <g transform="translate(0, 0)">
              {/* Left Eye */}
              <g transform="translate(140, 180)">
                 {activeExpression === 'wink' || activeExpression === 'confused' ? (
                     <path d="M-20 0 Q0 -10 20 0" stroke="#1A2A3A" strokeWidth="6" strokeLinecap="round" fill="none" className="mascot-transition" />
                 ) : activeExpression === 'celebration' ? (
                     <path d="M-20 0 Q0 -15 20 0" stroke="#1A2A3A" strokeWidth="4" strokeLinecap="round" fill="none" className="mascot-transition" />
                 ) : showBlink ? (
                     <path d="M-20 0 Q0 8 20 0" stroke="#1A2A3A" strokeWidth="4" strokeLinecap="round" fill="none" />
                 ) : (
                   <g>
                     <ellipse cx="0" cy="0" rx="28" ry="32" fill="white" stroke="#E5E7EB" strokeWidth="2" className="mascot-transition" />
                     <g style={pupilStyle}>
                       <circle cx="0" cy="0" r="14" fill="#1A2A3A" />
                       <circle cx="4" cy="-4" r="5" fill="white" />
                     </g>
                   </g>
                 )}
              </g>

              {/* Right Eye */}
              <g transform="translate(260, 180)">
                 {activeExpression === 'confused' ? (
                     <g className="animate-spin-slow" style={{ transformOrigin: '0 0' }}>
                        <path d="M-15 -15 L15 15 M-15 15 L15 -15" stroke="#1A2A3A" strokeWidth="6" strokeLinecap="round" />
                     </g>
                 ) : activeExpression === 'celebration' ? (
                     <path d="M-20 0 Q0 -15 20 0" stroke="#1A2A3A" strokeWidth="4" strokeLinecap="round" fill="none" className="mascot-transition" />
                 ) : showBlink ? (
                     <path d="M-20 0 Q0 8 20 0" stroke="#1A2A3A" strokeWidth="4" strokeLinecap="round" fill="none" />
                 ) : (
                   <g>
                     <ellipse cx="0" cy="0" rx="28" ry="32" fill="white" stroke="#E5E7EB" strokeWidth="2" 
                       className="mascot-transition"
                       style={{ ry: activeExpression === 'thinking' ? 22 : 32 }}
                     />
                     <g style={pupilStyle}>
                       <circle cx="0" cy="0" r="14" fill="#1A2A3A" />
                       <circle cx="4" cy="-4" r="5" fill="white" />
                     </g>
                   </g>
                 )}
              </g>

              {/* Eyebrows (Expression) */}
              <g className="mascot-transition" style={{ opacity: activeExpression === 'thinking' ? 1 : 0, transform: activeExpression === 'thinking' ? 'translateY(0)' : 'translateY(-10px)' }}>
                 <path d="M240 140 Q260 130 280 140" stroke="#1A2A3A" strokeWidth="4" strokeLinecap="round" fill="none" />
              </g>
              <g className="mascot-transition" style={{ opacity: activeExpression === 'excited' ? 1 : 0, transform: activeExpression === 'excited' ? 'translateY(0)' : 'translateY(10px)' }}>
                   <path d="M120 130 Q140 110 160 130" stroke="#1A2A3A" strokeWidth="4" strokeLinecap="round" fill="none" />
                   <path d="M240 130 Q260 110 280 130" stroke="#1A2A3A" strokeWidth="4" strokeLinecap="round" fill="none" />
              </g>
           </g>

           {/* Mouth */}
           <g transform="translate(200, 240)">
              {activeExpression === 'happy' && <path d="M-20 0 Q0 15 20 0" stroke="#1A2A3A" strokeWidth="4" strokeLinecap="round" fill="none" className="mascot-transition" />}
              {activeExpression === 'excited' && <path d="M-20 0 Q0 20 20 0 Z" fill="#1A2A3A" className="mascot-transition" />}
              {activeExpression === 'thinking' && <circle cx="15" cy="5" r="5" fill="#1A2A3A" className="mascot-transition" />}
              {activeExpression === 'confused' && <path d="M-15 5 Q0 0 15 5" stroke="#1A2A3A" strokeWidth="4" strokeLinecap="round" fill="none" className="mascot-transition" />}
              {activeExpression === 'celebration' && <path d="M-25 0 Q0 25 25 0 Z" fill="#1A2A3A" className="mascot-transition" />}
              {activeExpression === 'wink' && <path d="M-20 0 Q0 10 20 0" stroke="#1A2A3A" strokeWidth="4" strokeLinecap="round" fill="none" className="mascot-transition" />}
           </g>

        </g>

        {/* === ARMS === */}
        {/* Little nubby arms that move based on expression with smoother transitions */}
        <g className="mascot-transition">
           {/* Left Arm */}
           <ellipse 
              cx={activeExpression === 'thinking' ? 160 : activeExpression === 'celebration' ? 80 : 100} 
              cy={activeExpression === 'thinking' ? 280 : activeExpression === 'celebration' ? 180 : 250} 
              rx="20" ry="35" 
              fill="#2D9C8E" 
              className="mascot-transition"
              transform={activeExpression === 'thinking' ? "rotate(45 160 280)" : activeExpression === 'celebration' ? "rotate(45 80 180)" : "rotate(-20 100 250)"}
           />
           {/* Right Arm */}
           <ellipse 
              cx={activeExpression === 'celebration' ? 320 : 300} 
              cy={activeExpression === 'celebration' ? 180 : 250} 
              rx="20" ry="35" 
              fill="#2D9C8E" 
              className="mascot-transition"
              transform={activeExpression === 'celebration' ? "rotate(-45 320 180)" : "rotate(20 300 250)"}
           />
        </g>


        {/* === ACCESSORIES (Variants) === */}

        {/* COMMUTE VARIANT: Goggles & Scarf */}
        {variant === 'commute' && (
           <g className="animate-slide-up">
              {/* Scarf with gentle wave */}
              <path d="M120 300 Q200 340 280 300 L290 330 Q200 380 110 330 Z" fill="#FF8A75" />
              <path d="M270 310 L320 360 L350 350 L290 300 Z" fill="#FF8A75">
                 <animate attributeName="d" values="M270 310 L320 360 L350 350 L290 300 Z; M270 310 L330 350 L360 340 L290 300 Z; M270 310 L320 360 L350 350 L290 300 Z" dur="3s" repeatCount="indefinite" />
              </path>
              
              {/* Goggles */}
              <g transform="translate(0, -10)">
                <path d="M100 150 H300 V180 H100 Z" fill="#1A2A3A" opacity="0.2" /> {/* Strap */}
                {/* Lenses with moving reflection */}
                <circle cx="140" cy="180" r="35" fill={`url(#lensGrad-${uid})`} stroke="#A7ACD9" strokeWidth="4" />
                <circle cx="260" cy="180" r="35" fill={`url(#lensGrad-${uid})`} stroke="#A7ACD9" strokeWidth="4" />
                <path d="M175 180 L225 180" stroke="#1A2A3A" strokeWidth="8" /> {/* Bridge */}
                
                {/* Dynamic Shine */}
                <g opacity="0.6">
                    <path d="M120 170 L150 150" stroke="white" strokeWidth="4" strokeLinecap="round" />
                    <path d="M240 170 L270 150" stroke="white" strokeWidth="4" strokeLinecap="round" />
                </g>
              </g>
           </g>
        )}

        {/* TECH VARIANT: AR Visor & Data */}
        {variant === 'tech' && (
           <g>
              {/* Visor Glass */}
              <path d="M110 160 Q200 140 290 160 L280 210 Q200 230 120 210 Z" fill={`url(#holoGrad-${uid})`} stroke="#A7ACD9" strokeWidth="2" opacity="0.9" />
              
              {/* Scanning Line */}
              <rect x="120" y="160" width="160" height="2" fill="#2D9C8E" opacity="0.8">
                 <animate attributeName="y" values="160; 200; 160" dur="2s" repeatCount="indefinite" />
              </rect>

              {/* Hardware bits */}
              <path d="M100 170 L90 190" stroke="#1A2A3A" strokeWidth="4" />
              <path d="M300 170 L310 190" stroke="#1A2A3A" strokeWidth="4" />
              
              {/* Floating Data Bits */}
              <rect x="320" y="140" width="10" height="10" fill="#2D9C8E" opacity="0.6">
                 <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" />
                 <animate attributeName="y" values="140; 120" dur="1.5s" repeatCount="indefinite" />
              </rect>
              <rect x="340" y="160" width="6" height="6" fill="#2D9C8E" opacity="0.4">
                 <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" delay="0.5s" />
                 <animate attributeName="y" values="160; 140" dur="2s" repeatCount="indefinite" />
              </rect>
           </g>
        )}

        {/* HOME VARIANT: Golden Key & Sparkle */}
        {variant === 'home' && (
           <g transform="translate(280, 240) rotate(-10)">
              {/* Key */}
              <g className="animate-float" style={{ animationDuration: '3s' }}>
                  <circle cx="0" cy="0" r="18" stroke="#F4D35E" strokeWidth="6" fill="none" />
                  <path d="M18 0 L60 0 L60 12 M45 0 L45 12" stroke="#F4D35E" strokeWidth="6" strokeLinecap="round" />
                  {/* Key Shine */}
                  <circle cx="-5" cy="-5" r="4" fill="white" opacity="0.6" />
              </g>
              
              {/* Sparkle */}
              <path d="M60 -20 L65 -30 L70 -20 L80 -15 L70 -10 L65 0 L60 -10 L50 -15 Z" fill="#F4D35E" opacity="0.8">
                 <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
                 <animate attributeName="transform" type="scale" values="0.5; 1.2; 0.5" dur="2s" repeatCount="indefinite" />
              </path>
           </g>
        )}

      </g>
    </svg>
  );
});