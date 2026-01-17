import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [cursorVariant, setCursorVariant] = useState<'default' | 'hover' | 'magnetic'>('default');
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;

      // Check if hovering over interactive elements
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.classList.contains('cursor-hover')) {
        setCursorVariant('hover');
      } else if (target.classList.contains('cursor-magnetic')) {
        setCursorVariant('magnetic');
      } else {
        setCursorVariant('default');
      }
    };

    const animate = () => {
      // Smooth lerp (linear interpolation)
      const lerp = 0.15;
      currentX += (targetX - currentX) * lerp;
      currentY += (targetY - currentY) * lerp;

      setPosition({ x: currentX, y: currentY });
      requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const variants = {
    default: {
      width: 40,
      height: 40,
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      border: '2px solid rgba(59, 130, 246, 0.8)',
    },
    hover: {
      width: 80,
      height: 80,
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      border: '2px solid rgba(59, 130, 246, 1)',
    },
    magnetic: {
      width: 60,
      height: 60,
      backgroundColor: 'rgba(168, 85, 247, 0.2)',
      border: '2px solid rgba(168, 85, 247, 1)',
    },
  };

  return (
    <motion.div
      ref={cursorRef}
      className="custom-cursor pointer-events-none fixed z-[9999] rounded-full mix-blend-difference hidden md:block"
      style={{
        left: position.x,
        top: position.y,
        x: '-50%',
        y: '-50%',
      }}
      variants={variants}
      animate={cursorVariant}
      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
    />
  );
}
