import React, { memo } from 'react';

interface MascotProps {
  expression?: 'happy' | 'thinking' | 'excited' | 'wink' | 'celebration' | 'confused';
  variant?: 'default' | 'tech' | 'home' | 'commute';
  className?: string;
  lookAt?: { x: number; y: number }; // Optional state-based override
}

export const Mascot: React.FC<MascotProps> = memo(({ 
  expression = 'happy', 
  variant = 'default', 
  className = '',
  lookAt
}) => {
  // Eye tracking logic
  const pupilStyle = lookAt ? {
    transform: `translate(${lookAt.x * 4}px, ${lookAt.y * 4}px)`
  } : {
    transform: `translate(calc(var(--mouse-x, 0) * 4px), calc(var(--mouse-y, 0) * 4px))`
  };

  const getAriaLabel = () => {
    switch (expression) {
        case 'happy': return 'Windy the Energy Wisp smiling warmly';
        case 'thinking': return 'Windy processing information';
        case 'excited': return 'Windy glowing with excitement';
        case 'wink': return 'Windy winking playfully';
        case 'celebration': return 'Windy celebrating with sparks';
        case 'confused': return 'Windy looking puzzled';
        default: return 'Windy the Energy Wisp';
    }
  };

  // Dynamic body shapes based on variant/context
  const getBodyPath = () => {
    switch (variant) {
      case 'tech': 
        // Hexagonal/Blocky "Digital" Form
        return "M100 180 L40 140 L40 60 L100 20 L160 60 L160 140 Z"; 
      case 'home':
        // Shelter/House-like Form
        return "M100 20 L170 80 C170 80 170 180 100 180 C30 180 30 80 30 80 Z";
      case 'commute':
        // Aerodynamic/Wind-blown Form
        return "M100 180 C40 180 20 100 20 100 C20 100 60 20 120 30 C180 40 180 120 160 150 C140 180 100 180 100 180 Z";
      default:
        // The Standard "Teardrop/Wisp" Form
        return "M100 180 C50 180 20 130 20 90 C20 40 60 10 100 10 C140 10 180 40 180 90 C180 130 150 180 100 180 Z";
    }
  };

  return (
    <svg 
      viewBox="0 0 200 200" 
      className={`w-full h-full ${className}`} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible' }}
      role="img"
      aria-label={getAriaLabel()}
    >
      <defs>
        <linearGradient id="windBodyGrad" x1="20" y1="20" x2="180" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2D9C8E" />
          <stop offset="100%" stopColor="#1A2A3A" />
        </linearGradient>
        <radialGradient id="glowGrad" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(100 100) rotate(90) scale(90)">
          <stop stopColor="#2D9C8E" stopOpacity="0.2"/>
          <stop offset="1" stopColor="#2D9C8E" stopOpacity="0"/>
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Outer Glow for "Energy" Feel */}
      <circle cx="100" cy="100" r="80" fill="url(#glowGrad)" className="animate-pulse" style={{ animationDuration: '3s' }} />

      <g style={{ 
        transformOrigin: '100px 100px',
        animation: expression === 'celebration' ? 'bounce 0.5s infinite alternate' : 'float 6s ease-in-out infinite',
      }}>
          
          {/* THE BODY - Morphs based on context */}
          <path 
            d={getBodyPath()}
            className="transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]" 
            fill="url(#windBodyGrad)"
            stroke={variant === 'tech' ? '#A7ACD9' : 'none'}
            strokeWidth="2"
            filter="url(#glow)"
            style={{ 
              transformOrigin: 'center'
            }}
          />

          {/* THE COWLICK (Brand Signature) - The "Windy" Hair */}
          <path 
            d="M100 10 C100 10 110 -20 140 -10 C140 -10 120 -5 120 20"
            fill="#2D9C8E"
            className="transition-all duration-500"
            style={{
               transform: variant === 'commute' ? 'rotate(-20deg) translate(-10px, 10px)' : 'none'
            }}
          />

          {/* FACE CONTAINER */}
          <g transform="translate(0, 10)">
            
            {/* Left Eye */}
            <g transform="translate(65, 80)">
               <ellipse cx="0" cy="0" rx="14" ry="18" fill="white" className="transition-all duration-300" 
                  style={{ ry: expression === 'wink' ? 2 : 18 }} 
               />
               {expression !== 'wink' && (
                 <circle cx="0" cy="0" r="6" fill="#1A2A3A" style={pupilStyle} />
               )}
            </g>

            {/* Right Eye */}
            <g transform="translate(135, 80)">
               <ellipse cx="0" cy="0" rx="14" ry="18" fill="white" className="transition-all duration-300" 
                  style={{ ry: expression === 'thinking' ? 12 : 18 }}
               />
               <circle cx="0" cy="0" r="6" fill="#1A2A3A" style={pupilStyle} />
            </g>

            {/* Expressions (Eyebrows / Mouth hints) */}
            {expression === 'happy' && (
               <path d="M90 110 Q100 115 110 110" stroke="#1A2A3A" strokeWidth="3" strokeLinecap="round" opacity="0.5" fill="none" />
            )}
            {expression === 'confused' && (
               <path d="M125 55 L145 60" stroke="white" strokeWidth="4" strokeLinecap="round" />
            )}
            {expression === 'excited' && (
               <>
                 <path d="M55 55 Q65 45 75 55" stroke="white" strokeWidth="3" strokeLinecap="round" />
                 <path d="M125 55 Q135 45 145 55" stroke="white" strokeWidth="3" strokeLinecap="round" />
               </>
            )}
          </g>

          {/* VARIANT ORBITALS - Floating Props */}
          {variant === 'tech' && (
            <g className="animate-spin-slow" style={{ transformOrigin: '100px 100px' }}>
               <rect x="20" y="90" width="20" height="20" rx="4" fill="#A7ACD9" opacity="0.8" />
               <rect x="160" y="50" width="15" height="15" rx="3" fill="#A7ACD9" opacity="0.6" />
            </g>
          )}
          {variant === 'home' && (
            <path d="M160 120 L170 110 L180 120" stroke="#FF8A75" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="animate-bounce" />
          )}
          {variant === 'commute' && (
            <g className="animate-slide-left" style={{ opacity: 0.5 }}>
               <path d="M10 100 H-40" stroke="white" strokeWidth="2" strokeDasharray="5,5" />
               <path d="M10 120 H-20" stroke="white" strokeWidth="2" strokeDasharray="5,5" />
            </g>
          )}

          {/* Celebration Particles */}
          {expression === 'celebration' && (
             <g>
               <circle cx="40" cy="40" r="5" fill="#F4D35E" className="animate-ping" />
               <circle cx="160" cy="30" r="4" fill="#FF8A75" className="animate-ping" style={{ animationDelay: '0.2s' }} />
               <circle cx="170" cy="140" r="3" fill="#A7ACD9" className="animate-ping" style={{ animationDelay: '0.4s' }} />
             </g>
          )}

      </g>
    </svg>
  );
});
