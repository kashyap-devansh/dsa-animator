import { useEffect } from "react";
import { SpeedDelay } from "./speedDelay";

export function useAutoAdvance({ playing, index, setIndex, setPlaying, speed, stepsLength }) {
  useEffect(() => {
    if (!playing) return;

    const timer = setTimeout(() => {
      if (index < stepsLength - 1) {
        setIndex(prev => prev + 1);
      }
      else {
        setPlaying(false);
      }
    }, SpeedDelay[speed]);

    return () => clearTimeout(timer);
  }, [playing, index, speed, stepsLength]);
}
