import { useRef, useEffect } from 'react';
import gsap from 'gsap';

export function useGSAPTimeline(buildTimeline) {
  const timelineRef = useRef(null);

  useEffect(() => {
    if (timelineRef.current) timelineRef.current.kill();
    timelineRef.current = gsap.timeline();
    buildTimeline(timelineRef.current);
    return () => timelineRef.current?.kill();
  }, [buildTimeline]);

  return timelineRef;
}