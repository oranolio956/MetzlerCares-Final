
import { useState, useEffect, useRef } from 'react';

export const useTypewriter = (text: string, speed = 30, shouldAnimate = true) => {
  const [displayedText, setDisplayedText] = useState(shouldAnimate ? '' : text);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Immediate update if animation is disabled
    if (!shouldAnimate) {
      setDisplayedText(text);
      return;
    }

    // Reset if text changes
    setDisplayedText('');
    startTimeRef.current = null;
    
    const animate = () => {
      if (!startTimeRef.current) startTimeRef.current = Date.now();
      
      const now = Date.now();
      const elapsed = now - startTimeRef.current;
      
      // Calculate how many characters should be shown based on real time passed
      const charIndex = Math.floor(elapsed / speed);
      
      if (charIndex >= text.length) {
        setDisplayedText(text);
        return;
      }

      setDisplayedText(text.slice(0, charIndex + 1));
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [text, speed, shouldAnimate]);

  return displayedText;
};
