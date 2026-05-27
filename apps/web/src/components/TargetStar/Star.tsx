'use client';
import { useEffect, useRef } from 'react';
import styles from './Star.module.css';

interface TargetStarProps {
  maxScrollDistance?: number;
  maxZoomScale?: number;
  leftPosition?: string;
  topPosition?: string;
  /** Show star from scroll position 0 to this distance (in viewport heights) */
  visibleUntilDistance?: number;
}

export default function TargetStar({
  maxScrollDistance = 2,
  maxZoomScale = 20,
  leftPosition = '25%',
  topPosition = '45%',
  visibleUntilDistance = 2.5 // Hide after scrolling 2.5 viewport heights
}: TargetStarProps) {
  const starRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const hidePoint = window.innerHeight * visibleUntilDistance;
      
      const targetStar = starRef.current;
      const glowElement = glowRef.current;
      
      // Check if we should show or hide the star
      if (scrollY > hidePoint) {
        // Hide the star when scrolled past the visible range
        if (targetStar) {
          targetStar.style.opacity = '0';
          targetStar.style.pointerEvents = 'none';
        }
        return; // Exit early, don't calculate scaling
      }
      
      // Show the star and calculate scaling within the visible range
      if (targetStar) {
        targetStar.style.opacity = '1';
        targetStar.style.pointerEvents = 'auto';
      }
      
      // Normal scaling behavior within visible range
      const maxScroll = window.innerHeight * maxScrollDistance;
      const scrollProgress = Math.min(scrollY / maxScroll, 1);
      
      // Calculate zoom scale (1x to maxZoomScale)
      const zoomScale = 1 + (scrollProgress * (maxZoomScale - 1));
      
      // Calculate glow intensity
      const baseGlow = 15;
      const maxGlow = 80;
      const currentGlow = baseGlow + (scrollProgress * (maxGlow - baseGlow));
      
      if (targetStar) {
        targetStar.style.transform = `scale(${zoomScale})`;
      }
      
      if (glowElement) {
        glowElement.style.filter = `
          drop-shadow(0 0 ${currentGlow}px #60a5fa) 
          drop-shadow(0 0 ${currentGlow * 2}px rgba(96, 165, 250, 0.4))
          drop-shadow(0 0 ${currentGlow * 3}px rgba(96, 165, 250, 0.2))
        `;
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, [maxScrollDistance, maxZoomScale, visibleUntilDistance]);

  return (
    <div 
      ref={starRef}
      className={styles.targetStar}
      style={{ 
        left: leftPosition, 
        top: topPosition,
        transition: 'opacity 0.3s ease-out' // Smooth fade in/out
      }}
      aria-hidden="true"
    >
      <div ref={glowRef} className={`${styles.starGlow} ${styles.pulsing}`}>
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 20 20" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Star shape */}
          <path
            d="M10 2L12.245 7.755L18 10L12.245 12.245L10 18L7.755 12.245L2 10L7.755 7.755L10 2Z"
            fill="url(#starGradient)"
            stroke="url(#starStroke)"
            strokeWidth="0.5"
          />
          
          {/* Gradient definitions */}
          <defs>
            <radialGradient id="starGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="1" />
              <stop offset="70%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#1e40af" stopOpacity="0.3" />
            </radialGradient>
            <linearGradient id="starStroke" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.4" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}
