import { useEffect, useRef } from 'react';
import SplitType from 'split-type';
import gsap from 'gsap';

interface TextRevealProps {
  children: string;
  className?: string;
  delay?: number;
}

export default function TextReveal({ children, className = '', delay = 0 }: TextRevealProps) {
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textRef.current) {
      const split = new SplitType(textRef.current, { types: 'chars,words' });

      gsap.from(split.chars, {
        opacity: 0,
        y: 20,
        rotationX: -90,
        stagger: 0.02,
        duration: 0.8,
        delay,
        ease:' power3.out',
      });

      return () => split.revert();
    }
  }, [delay]);

  return (
    <div ref={textRef} className={className}>
      {children}
    </div>
  );
}
