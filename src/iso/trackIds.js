// Gives each value in a sequence of arrays a stable identity, so a value that
// moves between steps keeps its id and its cube slides instead of jumping.
// A value is matched to the nearest unused position holding the same value
// in the previous step; anything unmatched gets a fresh id.

export function trackIds(arrays) {
  let next = 0;
  let prevVals = [];
  let prevIds = [];

  return arrays.map((arr) => {
    const used = new Set();
    const ids = arr.map((value, i) => {
      let best = -1;
      let bestDist = Infinity;
      for (let j = 0; j < prevVals.length; j++) {
        if (used.has(j) || prevVals[j] !== value) continue;
        const dist = Math.abs(j - i);
        if (dist < bestDist) {
          best = j;
          bestDist = dist;
        }
      }
      if (best === -1) return next++;
      used.add(best);
      return prevIds[best];
    });

    prevVals = arr;
    prevIds = ids;
    return ids;
  });
}
