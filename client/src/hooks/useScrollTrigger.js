import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useScrollTrigger(triggerRef, animationFn) {
  useEffect(() => {
    if (!triggerRef.current) return;
    const ctx = gsap.context(() => {
      animationFn();
    }, triggerRef);
    return () => ctx.revert();
  }, [triggerRef, animationFn]);
}