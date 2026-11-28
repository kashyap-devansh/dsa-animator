import { useLayoutEffect, useRef } from "react";
import { animate, motionValue } from "framer-motion";

// Shared motion values for pieces that other pieces must stay glued to
// (tree nodes and their edges, list nodes and their pointers).
//
// targets: [[id, [x, y, lift]], …]  screen x / y of the piece on the floor,
// and its lift in world units. Returns id → { x, y, lift } motion values.
// Values are created during render so children can bind to them on their
// first frame, and animated after commit so React and the springs never fight.
export function useNodeMotion(targets, transition) {
  const store = useRef(new Map());
  const map = store.current;

  for (const [id, [x, y, lift]] of targets) {
    if (!map.has(id)) map.set(id, { x: motionValue(x), y: motionValue(y), lift: motionValue(lift), target: [x, y, lift] });
  }

  useLayoutEffect(() => {
    for (const [id, t] of targets) {
      const rec = map.get(id);
      if (rec.target[0] === t[0] && rec.target[1] === t[1] && rec.target[2] === t[2]) continue;
      rec.target = t;
      animate(rec.x, t[0], transition);
      animate(rec.y, t[1], transition);
      animate(rec.lift, t[2], transition);
    }

    // Forget pieces that are long gone (a new tree or list was loaded).
    if (map.size > 400) {
      const live = new Set(targets.map(([id]) => id));
      for (const id of map.keys()) if (!live.has(id)) map.delete(id);
    }
  });

  return map;
}
