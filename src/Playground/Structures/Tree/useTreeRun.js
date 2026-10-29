import { useEffect, useMemo, useRef, useState } from "react";
import { SpeedDelay } from "../../shared/speedDelay";

// One "run" = a starting tree + one operation key. Runs are kept as a history
// so playback can flow from one operation into the next (and step back across
// them). With `nextKey`, a finished run automatically chains into another one
// on its result tree until `shouldStop(result)` says the session is complete.
export function useTreeRun(generate, initialRun, { nextKey, shouldStop = () => false, restart, minBounds = {} } = {}) {
  const [state, setState] = useState(() => ({ runs: [initialRun()], pos: 0, index: 0 }));
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(5);

  // Cache by run object so a run's freshly created node ids never change.
  const cache = useRef(new WeakMap());
  const resultOf = (r) => {
    if (!cache.current.has(r)) cache.current.set(r, generate(r.tree, r.key));
    return cache.current.get(r);
  };

  const { steps, result } = resultOf(state.runs[state.pos]);
  const index = Math.min(state.index, steps.length - 1);
  const current = steps[index];
  const atEnd = index === steps.length - 1;
  const atLastRun = state.pos === state.runs.length - 1;
  const finished = atEnd && atLastRun && (!nextKey || shouldStop(result));

  const bounds = useMemo(() => {
    const all = state.runs.flatMap((r) => resultOf(r).steps);
    return {
      count: Math.max(minBounds.count ?? 1, ...all.map((s) => s.nodes.length)),
      depth: Math.max(minBounds.depth ?? 0, ...all.flatMap((s) => s.nodes.map((n) => n.depth))),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.runs]);

  const forward = (s) => {
    const { steps: runSteps, result: runResult } = resultOf(s.runs[s.pos]);

    if (s.index < runSteps.length - 1) return { ...s, index: s.index + 1 };
    if (s.pos < s.runs.length - 1) return { ...s, pos: s.pos + 1, index: 0 };
    if (!nextKey || shouldStop(runResult)) return null;

    return { runs: [...s.runs, { tree: runResult, key: nextKey(runResult) }], pos: s.pos + 1, index: 0 };
  };

  useEffect(() => {
    if (!playing) return;

    // Linger a little longer on a finished operation before chaining the next.
    const timer = setTimeout(() => {
      const moved = forward(state);
      if (moved) setState(moved);
      else setPlaying(false);
    }, atEnd ? SpeedDelay[speed] * 2 : SpeedDelay[speed]);

    return () => clearTimeout(timer);
  });

  // Start a new operation on the current tree, dropping any runs after it.
  const continueWith = (key, autoplay = true) => {
    setState((s) => ({ runs: [...s.runs.slice(0, s.pos + 1), { tree: result, key }], pos: s.pos + 1, index: 0 }));
    setPlaying(autoplay);
  };

  // Start a brand-new session from a given tree.
  const load = (run, autoplay = false) => {
    setState({ runs: [run], pos: 0, index: 0 });
    setPlaying(autoplay);
  };

  const reset = () => {
    setPlaying(false);
    setState((s) => ({ ...s, pos: 0, index: 0 }));
  };

  const stepForward = () => {
    setPlaying(false);
    const moved = forward(state);
    if (moved) setState(moved);
  };

  const stepBack = () => {
    setPlaying(false);

    if (state.index > 0) setState({ ...state, index: index - 1 });
    else if (state.pos > 0) {
      const prev = resultOf(state.runs[state.pos - 1]).steps;
      setState({ ...state, pos: state.pos - 1, index: prev.length - 1 });
    }
  };

  const togglePlay = () => {
    if (finished) {
      if (restart) load(restart(), true);
      else {
        setState({ ...state, index: 0 });
        setPlaying(true);
      }
      return;
    }

    setPlaying(!playing);
  };

  return {
    run: state.runs[state.pos],
    opNumber: state.pos + 1,
    result, steps, current, bounds, index, playing, speed, setSpeed, finished,
    canBack: index > 0 || state.pos > 0,
    canForward: !finished,
    continueWith, load, reset, stepForward, stepBack, togglePlay,
  };
}
