import { createContext, useContext } from "react";
import { SpeedDelay } from "../Playground/shared/speedDelay";

// Playback speed, shared with every moving piece of a diagram so motion keeps
// pace with the steps: quicker at 2× and 4×, a little calmer at 0.5×.
// The Lesson page provides it; diagrams outside a lesson move at 1×.
export const SpeedContext = createContext(5);

export const useSpeed = () => useContext(SpeedContext);

// Time scale relative to 1× (speed 5, 500ms per step).
export const paceOf = (speed = 5) => Math.min(1.35, Math.max(0.45, (SpeedDelay[speed] ?? 500) / 500));

// A spring that settles in about `base` seconds at 1×, with no overshoot.
// Springs keep their velocity when retargeted mid-move, so a step that lands
// before the last one finished bends smoothly instead of stopping and restarting.
export const springFor = (speed, base = 0.55) => ({ type: "spring", bounce: 0, visualDuration: base * paceOf(speed) });
