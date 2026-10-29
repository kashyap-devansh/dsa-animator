import { useMemo, useState } from "react";
import StepperPage, { Segment } from "../../shared/StepperPage";
import TreeStage from "../../Structures/Tree/TreeStage";
import { ROLE_STYLE } from "../../Structures/Tree/roleStyle";
import { usePlayback } from "../../shared/usePlayback";
import { FIB_CODE, FIB_MEMO_CODE, fibonacciSteps } from "../recursionSteps";
import "../recursionStage.css";

const SIZES = [3, 4, 5, 6].map((n) => ({ id: n, label: `n = ${n}` }));
const MODES = [
  { id: "naive", label: "naive" },
  { id: "memo", label: "memoized" },
];

const legendItem = (role, label) => ({ label, stroke: ROLE_STYLE[role].stroke, fill: ROLE_STYLE[role].fill });

const FibonacciSequence = () => {
  const [n, setN] = useState(5);
  const [mode, setMode] = useState("naive");

  const steps = useMemo(() => fibonacciSteps(n, mode === "memo"), [n, mode]);
  const playback = usePlayback(steps.length);
  const current = steps[Math.min(playback.index, steps.length - 1)];
  const last = steps[steps.length - 1];

  const bounds = { count: last.span, depth: Math.max(...last.nodes.map((node) => node.depth)) };

  const choose = (setter) => (value) => {
    setter(value);
    playback.reset();
  };

  return (
    <StepperPage
      eyebrow="recursion"
      title="Fibonacci Sequence"
      blurb="fib(n) calls fib(n-1) and fib(n-2), which call their own pair… The same values get recomputed again and again — unless you memoize."
      complexity={
        mode === "memo"
          ? [
              { label: "time", value: "O(n)", tone: "time" },
              { label: "space", value: "O(n)", tone: "space" },
            ]
          : [
              { label: "time", value: "O(2^n)", tone: "time" },
              { label: "space", value: "O(n)", tone: "space" },
            ]
      }
      toolbar={
        <>
          <Segment label="size" options={SIZES} value={n} onChange={choose(setN)} />
          <Segment label="mode" options={MODES} value={mode} onChange={choose(setMode)} />
        </>
      }
      stage={
        <div className="rc-tree">
          <TreeStage step={current} bounds={bounds} speed={playback.speed} />
        </div>
      }
      legend={[
        legendItem("active", "running"),
        legendItem("path", "waiting on a child"),
        legendItem("found", "returned"),
        ...(mode === "memo" ? [legendItem("successor", "memo hit")] : []),
      ]}
      status={current.description}
      filename={mode === "memo" ? "fib_memo.cpp" : "fib.cpp"}
      code={mode === "memo" ? FIB_MEMO_CODE : FIB_CODE}
      codeLine={current.codeLine}
      playback={{ ...playback, total: steps.length }}
      stats={[
        { label: "calls", value: current.calls },
        { label: "memo hits", value: current.hits },
        { label: "total calls", value: last.calls },
        { label: `fib(${n})`, value: last.result },
      ]}
    />
  );
};

export default FibonacciSequence;
