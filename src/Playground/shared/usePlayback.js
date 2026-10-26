import { useEffect, useState } from "react";
import { SpeedDelay } from "./speedDelay";

export function usePlayback(stepsLength) {
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
      SpeedDelay[speed]
    );

    return () => clearTimeout(timer);
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
