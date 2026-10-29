import { useMemo, useState } from "react";
import StepperPage, { Segment } from "../../shared/StepperPage";
import ArrayStage from "../../shared/ArrayStage";
import { usePlayback } from "../../shared/usePlayback";
import { PERMUTATION_CODE, permutationSteps } from "../recursionSteps";
import "../recursionStage.css";

const SIZES = [
  { id: 3, label: "ABC" },
  { id: 4, label: "ABCD" },
];

const LETTERS = ["A", "B", "C", "D"];

const Permutations = () => {
  const [size, setSize] = useState(3);

  const steps = useMemo(() => permutationSteps(LETTERS.slice(0, size)), [size]);
  const playback = usePlayback(steps.length);
  const current = steps[Math.min(playback.index, steps.length - 1)];

  const roles = {};
  if (current.l !== null) for (let k = 0; k < current.l; k++) roles[k] = "fixed";
  current.swapping.forEach((k) => (roles[k] = "swap"));

  const pointers = [
    ...(current.l !== null ? [{ label: "l", index: current.l, tone: "blue" }] : []),
    ...(current.i !== null ? [{ label: "i", index: current.i }] : []),
  ];

  const changeSize = (value) => {
    setSize(value);
    playback.reset();
  };

  return (
    <StepperPage
      eyebrow="recursion"
      title="Permutations"
      blurb="Swap each remaining letter into position l, recurse to fill the rest, then swap it back — backtracking restores the string for the next choice."
      complexity={[
        { label: "time", value: "O(n · n!)", tone: "time" },
        { label: "space", value: "O(n)", tone: "space" },
      ]}
      toolbar={<Segment label="letters" options={SIZES} value={size} onChange={changeSize} />}
      stage={
        <div className="rc-stage">
          <ArrayStage
            compact
            values={current.items}
            keys={current.items}
            roles={roles}
            pointers={pointers}
            vars={[
              { label: "depth", value: current.stack.length, tone: "blue" },
              { label: "stack", value: current.stack.length ? current.stack.map((l) => `permute(${l})`).join(" → ") : "—" },
            ]}
          />

          <div className="rc-output">
            {current.output.length === 0 && <span className="rc-output-empty">printed permutations appear here</span>}
            {current.output.map((perm, k) => (
              <span key={perm} className={k === current.latest ? "rc-output-latest" : ""}>
                {perm}
              </span>
            ))}
          </div>
        </div>
      }
      legend={[
        { label: "fixed prefix", stroke: "rgba(86, 182, 194, 0.6)", fill: "#1c1c1f" },
        { label: "swapping", stroke: "#7c8cff", fill: "rgba(124, 140, 255, 0.12)" },
        { label: "just printed", stroke: "#b4ff39", fill: "transparent" },
      ]}
      status={current.description}
      filename="permutations.cpp"
      code={PERMUTATION_CODE}
      codeLine={current.codeLine}
      playback={{ ...playback, total: steps.length }}
      stats={[
        { label: "printed", value: `${current.output.length} / ${[1, 1, 2, 6, 24][size]}` },
        { label: "swaps", value: current.swaps },
        { label: "depth", value: current.stack.length },
      ]}
    />
  );
};

export default Permutations;
