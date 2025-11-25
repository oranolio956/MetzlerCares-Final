
import { useState, useEffect } from 'react';

export const useTypewriter = (text: string, speed = 30, shouldAnimate = true) => {
  const [displayedText, setDisplayedText] = useState(shouldAnimate ? '' : text);

  useEffect(() => {
    if (!shouldAnimate) {
      setDisplayedText(text);
      return;
    }

    setDisplayedText('');
    let i = 0;
    
    // Use requestAnimationFrame for smoother performance than setInterval
    let rafId: number;
    let lastTime = performance.now();
    
    const animate = (time: number) => {
      if (time - lastTime >= speed) {
        setDisplayedText((prev) => text.slice(0, prev.length + 1));
        lastTime = time;
      }
      
      if (i < text.length) {
        i++; // Logic handled by slice via displayedText length check mostly
        if (displayedText.length < text.length) {
            rafId = requestAnimationFrame(animate);
        }
      }
    };

    rafId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafId);
  }, [text, speed, shouldAnimate]);

  return displayedText;
};
