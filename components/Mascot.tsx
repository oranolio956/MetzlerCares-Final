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
  // Use explicit prop if provided, otherwise fallback to CSS variables injected by parent (HeroSection)
  const pupilStyle = lookAt ? {
    transform: `translate(${lookAt.x * 6}px, ${lookAt.y * 6}px)`
  } : {
    transform: `translate(calc(var(--mouse-x, 0) * 6px), calc(var(--mouse-y, 0) * 6px))`
  };

  const getAriaLabel = () => {
    switch (expression) {
        case 'happy': return 'Windy the mascot smiling warmly';
        case 'thinking': return 'Windy the mascot thinking processing information';
        case 'excited': return 'Windy the mascot looking excited';
        case 'wink': return 'Windy the mascot winking playfully';
        case 'celebration': return 'Windy the mascot celebrating with confetti';
        case 'confused': return 'Windy the mascot looking confused';
        default: return 'Windy the mascot';
    }
  };

  return (
    <svg 
      viewBox="-40 -40 280 280" 
      className={`w-full h-full ${className}`} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible' }}
      role="img"
      aria-label={getAriaLabel()}
    >
      <g style={{ 
        transformOrigin: '100px 100px',
        animation: expression === 'celebration' ? 'blob 3s infinite' : expression === 'confused' ? 'none' : 'blob 7s infinite',
        transform: expression === 'confused' ? 'rotate(-5deg) translateY(10px)' : 'none'
      }}>
          
          {/* Background Glow */}
          {variant === 'tech' && <circle cx="100" cy="100" r="90" fill="#2D9C8E" fillOpacity="0.1" className="transition-all duration-500" />}
          {variant === 'home' && <circle cx="100" cy="100" r="90" fill="#FF8A75" fillOpacity="0.1" className="transition-all duration-500" />}
          {variant === 'commute' && <circle cx="100" cy="100" r="90" fill="#A7ACD9" fillOpacity="0.1" className="transition-all duration-500" />}
          {expression === 'celebration' && <circle cx="100" cy="100" r="95" fill="#F4D35E" fillOpacity="0.2" className="animate-pulse" />}
          {expression === 'confused' && <circle cx="100" cy="100" r="85" fill="#1A2A3A" fillOpacity="0.05" />}

          {/* Body */}
          <path 
            d="M100 180C144.183 180 180 144.183 180 100C180 55.8172 144.183 20 100 20C55.8172 20 20 55.8172 20 100C20 144.183 55.8172 180 100 180Z" 
            className="transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]" 
            style={{ 
              fill: expression === 'thinking' ? '#A7ACD9' : expression === 'excited' || expression === 'celebration' ? '#FF8A75' : expression === 'confused' ? '#A7ACD9' : '#2D9C8E',
              transformOrigin: 'center'
            }}
          />
          
          {/* Eyes Container */}
          <g className="transition-all duration-500 ease-in-out">
              {/* Whites */}
              <circle cx="70" cy="90" r="10" fill="white" className="transition-all duration-500" />
              <circle cx="130" cy="90" r="10" fill="white" className="transition-all duration-500" />
              
              {/* Pupils with Optimized Tracking */}
              <circle 
                cx={(expression === 'thinking' ? 74 : expression === 'confused' ? 72 : 70)} 
                cy={(expression === 'thinking' ? 86 : expression === 'confused' ? 88 : 90)} 
                r="4" 
                fill="#1A2A3A" 
                className="transition-transform duration-75 ease-out"
                style={pupilStyle}
              />
              <circle 
                cx={(expression === 'thinking' ? 134 : expression === 'confused' ? 128 : 130)} 
                cy={(expression === 'thinking' ? 86 : expression === 'confused' ? 92 : 90)} 
                r="4" 
                fill="#1A2A3A" 
                className="transition-transform duration-75 ease-out"
                style={pupilStyle}
              />
          </g>

          {/* Expressions */}
          {expression === 'happy' && (
            <path d="M70 120C70 120 85 135 100 135C115 135 130 120 130 120" stroke="white" strokeWidth="6" strokeLinecap="round" className="animate-pulse" />
          )}
          {expression === 'thinking' && (
            <path d="M85 125H115" stroke="white" strokeWidth="6" strokeLinecap="round" />
          )}
          {expression === 'excited' && (
            <path d="M70 120C70 120 85 145 100 145C115 145 130 120 130 120" stroke="white" strokeWidth="6" strokeLinecap="round" fill="white" />
          )}
          {expression === 'celebration' && (
            <>
              <path d="M60 120C60 120 80 155 100 155C120 155 140 120 140 120" stroke="white" strokeWidth="6" strokeLinecap="round" fill="white" />
              <circle cx="40" cy="60" r="6" fill="#F4D35E" className="animate-ping" style={{animationDuration: '1s'}} />
              <circle cx="160" cy="50" r="5" fill="#A7ACD9" className="animate-ping" style={{animationDuration: '1.5s', animationDelay: '0.2s'}} />
              <circle cx="170" cy="120" r="4" fill="#2D9C8E" className="animate-ping" style={{animationDuration: '1.2s', animationDelay: '0.5s'}} />
              <circle cx="30" cy="110" r="5" fill="#FF8A75" className="animate-ping" style={{animationDuration: '0.8s', animationDelay: '0.1s'}} />
            </>
          )}
          {expression === 'wink' && (
            <>
              <path d="M70 120C70 120 85 135 100 135C115 135 130 120 130 120" stroke="white" strokeWidth="6" strokeLinecap="round" />
              <path d="M120 85L140 95" stroke="#1A2A3A" strokeWidth="4" strokeLinecap="round" />
            </>
          )}
          {expression === 'confused' && (
            <>
               <path d="M70 130 Q 85 120, 100 130 T 130 130" stroke="white" strokeWidth="5" strokeLinecap="round" />
               <path d="M60 75 L 80 85" stroke="#1A2A3A" strokeWidth="3" strokeLinecap="round" />
               <path d="M120 85 L 140 75" stroke="#1A2A3A" strokeWidth="3" strokeLinecap="round" />
               <text x="130" y="60" fill="#1A2A3A" fontSize="40" fontFamily="sans-serif" fontWeight="bold" transform="rotate(10 130 60)">?</text>
            </>
          )}

          {/* Variants */}
          {variant === 'tech' && (
            <rect x="120" y="110" width="60" height="40" rx="4" fill="#1A2A3A" stroke="white" strokeWidth="2" transform="rotate(-10 150 130)" className="animate-float" />
          )}
          {variant === 'home' && (
            <path d="M140 100 L160 80 L180 100 V140 H140 V100" fill="#FF8A75" stroke="white" strokeWidth="2" className="animate-float" />
          )}
          {variant === 'commute' && (
            <circle cx="160" cy="130" r="20" fill="#F4D35E" stroke="white" strokeWidth="2" className="animate-spin-slow" />
          )}
      </g>

      {/* Decor */}
      {expression !== 'confused' && (
        <>
          <path d="M160 50C160 50 170 40 185 45" stroke="#F4D35E" strokeWidth="4" strokeLinecap="round" className="animate-pulse" />
          <path d="M30 150C30 150 20 160 10 155" stroke="#F4D35E" strokeWidth="4" strokeLinecap="round" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
        </>
      )}
    </svg>
  );
});