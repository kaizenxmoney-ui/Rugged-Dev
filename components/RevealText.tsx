
import React, { useEffect, useRef, useState } from 'react';

interface RevealTextProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'none';
  delay?: number;
}

export const RevealText: React.FC<RevealTextProps> = ({ 
  children, 
  className = "", 
  direction = 'up',
  delay = 0 
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const directionClass = direction !== 'none' ? `reveal-${direction}` : '';

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`${className} reveal-hidden ${directionClass} ${isVisible ? 'reveal-visible' : ''}`}
    >
      {children}
    </div>
  );
};
