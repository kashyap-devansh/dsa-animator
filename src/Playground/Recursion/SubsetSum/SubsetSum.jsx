import { useMemo, useState } from "react";
import StepperPage from "../../shared/StepperPage";
import ArrayStage from "../../shared/ArrayStage";
import TreeStage from "../../Structures/Tree/TreeStage";
import { ROLE_STYLE } from "../../Structures/Tree/roleStyle";
import { usePlayback } from "../../shared/usePlayback";
import { SUBSET_CODE, subsetSumSteps } from "../recursionSteps";
import "../recursionStage.css";

const SIZE = 4;

// Random positive items plus a target built from a random non-empty subset,
// so the default puzzle always has an answer.
function randomPuzzle() {
  const items = Array.from({ length: SIZE }, () => 1 + Math.floor(Math.random() * 9));
  let target = 0;

  while (target === 0) {
    target = items.reduce((sum, v) => (Math.random() < 0.5 ? sum + v : sum), 0);
  }

  return { items, target };
}

const legendItem = (role, label) => ({ label, stroke: ROLE_STYLE[role].stroke, fill: ROLE_STYLE[role].fill });

const SubsetSum = () => {
  const [puzzle, setPuzzle] = useState(randomPuzzle);
  const [target, setTarget] = useState(puzzle.target);

  const steps = useMemo(() => subsetSumSteps(puzzle.items, Number(target) || 0), [puzzle, target]);
  const playback = usePlayback(steps.length);
  const current = steps[Math.min(playback.index, steps.length - 1)];
  const last = steps[steps.length - 1];

  // Pin the scale to a full-size decision tree so short runs don't zoom in.
  const bounds = { count: Math.max(last.span, 11), depth: SIZE };

  const roles = Object.fromEntries(current.taken.map((i) => [i, "found"]));
  if (current.current !== null && current.current < SIZE && !roles[current.current]) roles[current.current] = "probe";

  const shuffle = () => {
    const next = randomPuzzle();
    setPuzzle(next);
    setTarget(next.target);
    playback.reset();
  };

  const changeTarget = (value) => {
    setTarget(value === "" ? "" : Number(value));
    playback.reset();
  };

  const verdict = last.result === false ? "no subset" : `{${last.taken.map((i) => puzzle.items[i]).join(", ")}}`;

  return (
    <StepperPage
      eyebrow="recursion"
      title="Subset Sum"
      blurb="At every item, branch twice: take it or skip it. Overshoot the target and the branch dies; hit it exactly and the answer bubbles up."
      complexity={[
        { label: "time", value: "O(2^n)", tone: "time" },
        { label: "space", value: "O(n)", tone: "space" },
      ]}
      stage={
        <div className="rc-stage">
          <ArrayStage
            compact
            values={puzzle.items}
            roles={roles}
            pointers={current.current !== null && current.current < SIZE ? [{ label: "i", index: current.current }] : []}
            vars={[
              { label: "target", value: target, tone: "cyan" },
              { label: "sum", value: current.sum, tone: current.sum === Number(target) ? "lime" : "orange" },
            ]}
          />

          <div className="rc-tree">
            <TreeStage step={current} bounds={bounds} speed={playback.speed} />
          </div>
        </div>
      }
      legend={[
        { label: "left = take · right = skip", mark: <em>↙↘</em> },
        legendItem("active", "current call"),
        legendItem("path", "on the stack"),
        legendItem("remove", "dead end"),
        legendItem("found", "solution path"),
      ]}
      status={current.description}
      filename="subset_sum.cpp"
      code={SUBSET_CODE}
      codeLine={current.codeLine}
      playback={{ ...playback, total: steps.length }}
      shuffleLabel="New set"
      onShuffle={shuffle}
      input={{ label: "target", value: target, onChange: changeTarget, min: 0 }}
      stats={[
        { label: "calls", value: current.calls },
        { label: "total calls", value: last.calls },
        { label: "answer", value: verdict },
      ]}
    />
  );
};

export default SubsetSum;
