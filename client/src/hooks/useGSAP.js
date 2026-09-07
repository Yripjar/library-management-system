import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * useGSAP hook - reuse animation logic.
 * Provide a function that receives a gsap context.
 */
export function useGSAP(buildAnimation, deps = []) {
  const ref = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      buildAnimation(gsap, ScrollTrigger);
    }, ref);

    return () => ctx.revert();
  }, deps);

  return ref;
}