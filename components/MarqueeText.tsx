import React, { useRef, useEffect, useState } from 'react';

interface MarqueeTextProps {
  children: React.ReactNode;
  className?: string;
  speed?: number; // seconds for full scroll, default 4
}

/**
 * Scrolls text horizontally in a loop only when it overflows.
 * On desktop (≥640px), text is shown normally with truncation.
 * On mobile, text scrolls left until the last char is visible,
 * then fades out, jumps back, fades in, and loops.
 */
export default function MarqueeText({ children, className = '', speed = 4 }: MarqueeTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const measure = () => {
      if (!containerRef.current || !textRef.current) return;
      
      const container = containerRef.current;
      const span = textRef.current;
      
      // Temporarily remove factors that change scrollWidth to get the "true" content width
      const prevAnim = span.style.animation;
      const prevPadding = span.style.paddingRight;
      span.style.animation = 'none';
      span.style.paddingRight = '0px';
      
      const containerW = container.offsetWidth;
      const trueTextW = span.scrollWidth;
      
      // Restore styles
      span.style.animation = prevAnim;
      span.style.paddingRight = prevPadding;

      const overflow = trueTextW - containerW;
      // Buffer of 8px ensures it scrolls comfortably past the edge
      setOffset(overflow > 0 ? overflow + 8 : 0);
    };

    measure();
    // Delay to account for layout shifts
    const timer = setTimeout(measure, 150);
    
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('resize', measure);
      clearTimeout(timer);
    };
  }, [children]);

  const shouldScroll = offset > 0 && typeof window !== 'undefined' && window.innerWidth < 640;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden whitespace-nowrap sm:whitespace-normal ${className}`}
    >
      <span
        ref={textRef}
        className="inline-block"
        style={shouldScroll ? {
          animation: `marqueeLoop ${speed}s linear infinite`,
          '--marquee-offset': `-${offset}px`,
          paddingRight: '16px', // Matches the 16 we subtracted above
        } as React.CSSProperties : undefined}
      >
        {children}
      </span>
    </div>
  );
}
