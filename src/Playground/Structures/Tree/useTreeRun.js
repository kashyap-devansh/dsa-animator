import { useMemo } from "react";
import { useRunChain } from "../../shared/useRunChain";
import { reachOf } from "./treeEngine";

// Tree sessions: chained runs (see useRunChain) plus the sizes the stage needs
// to hold one frame, and the root one spot, for the whole session.
export function useTreeRun(generate, initialRun, { minBounds = {}, ...options } = {}) {
  const chain = useRunChain(generate, initialRun, options);
  const { runs, resultOf } = chain;

  // half: widest reach either side of the root; reach: deepest level used.
  const bounds = useMemo(() => {
    const all = runs.flatMap((r) => resultOf(r).steps);
    const reach = Math.max(0, ...all.flatMap((s) => s.nodes.map((n) => n.depth)));
    return {
      count: Math.max(minBounds.count ?? 1, ...all.map((s) => s.nodes.length)),
      depth: Math.max(minBounds.depth ?? 0, reach),
      reach,
      half: Math.max(0, ...all.map((s) => reachOf(s.nodes))),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runs]);

  return { ...chain, bounds };
}
