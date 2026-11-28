import { useEffect, useState } from "react";
import { SpeedDelay } from "./speedDelay";

// holdFor(i), optional: how many times longer step i stays on screen during
// playback (e.g. 1.8 for swaps, so the exchange can be followed).
export function usePlayback(stepsLength, holdFor) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(5);

  useEffect(() => {
    if (!playing || index >= stepsLength - 1) {
      if (index >= stepsLength - 1) {
        setPlaying(false);
      }
      return;
    }

    const timer = setTimeout(
      () => setIndex(i => i + 1),
      SpeedDelay[speed] * (holdFor?.(index) ?? 1)
    );

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, index, speed, stepsLength]);

  const reset = () => {
    setPlaying(false);
    setIndex(0);
  };

  const stepForward = () => {
    setPlaying(false);

    if (index < stepsLength - 1) {
      setIndex(index + 1);
    }
  };

  const stepBack = () => {
    setPlaying(false);

    if (index > 0) {
      setIndex(index - 1);
    }
  };

  const togglePlay = () => {
    if (index === stepsLength - 1) {
      setIndex(0);
    }

    setPlaying(!playing);
  };

  return { index, setIndex, playing, speed, setSpeed, reset, stepForward, stepBack, togglePlay };
}
