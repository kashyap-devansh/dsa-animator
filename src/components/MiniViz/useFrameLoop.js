import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

// Plays `build()`'s frames on a loop, one per `ms`, holding the last frame for
// `hold` ticks before building a fresh run. Pauses while scrolled off-screen;
// with reduced motion it shows a single representative frame.
export function useFrameLoop(build, ms, hold = 8) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [state, setState] = useState(() => ({ frames: build(), index: 0 }));

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.1 });
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || reduced) return;

    const timer = setInterval(() => {
      setState((s) => (s.index + 1 >= s.frames.length + hold ? { frames: build(), index: 0 } : { ...s, index: s.index + 1 }));
    }, ms);

    return () => clearInterval(timer);
  }, [visible, reduced, ms, hold, build]);

  const { frames, index } = state;
  const frame = reduced ? frames[Math.floor(frames.length * 0.6)] : frames[Math.min(index, frames.length - 1)];

  return [ref, frame];
}

export const pick = (list) => list[Math.floor(Math.random() * list.length)];

export function uniqueSorted(count, lo = 1, hi = 99) {
  const set = new Set();
  while (set.size < count) set.add(lo + Math.floor(Math.random() * (hi - lo + 1)));
  return [...set].sort((a, b) => a - b);
}
