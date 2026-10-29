import { useMemo, useState } from "react";
import StepperPage from "../../shared/StepperPage";
import ArrayStage from "../../shared/ArrayStage";
import { usePlayback } from "../../shared/usePlayback";
import { sortedUniqueArray, randomTarget } from "../../shared/randomArray";

const LEGEND = [
  { label: "probing", stroke: "#ff6a3d", fill: "rgba(255, 106, 61, 0.1)" },
  { label: "found", stroke: "#b4ff39", fill: "rgba(180, 255, 57, 0.1)" },
  { label: "ruled out", stroke: "#262629", fill: "#1c1c1f" },
];

// Shared page for searches over a sorted array (jump, exponential, fibonacci).
const ArraySearchPage = ({ generate, size = 12, legend = LEGEND, ...page }) => {
  const [seed, setSeed] = useState(() => sortedUniqueArray(size));
  const [target, setTarget] = useState(() => randomTarget(seed));

  const steps = useMemo(() => generate(seed, target), [generate, seed, target]);
  const playback = usePlayback(steps.length);
  const current = steps[Math.min(playback.index, steps.length - 1)];

  const shuffle = () => {
    const next = sortedUniqueArray(size);
    setSeed(next);
    setTarget(randomTarget(next));
    playback.reset();
  };

  const changeTarget = (value) => {
    setTarget(value === "" ? "" : Number(value));
    playback.reset();
  };

  const result = current.result === null ? "—" : current.result === "miss" ? "not found" : `index ${current.result}`;

  return (
    <StepperPage
      {...page}
      eyebrow="searching"
      stage={
        <ArrayStage
          values={seed}
          roles={current.roles}
          range={current.range}
          pointers={current.pointers}
          vars={current.vars}
          caption={`target = ${target}`}
        />
      }
      legend={legend}
      status={current.description}
      codeLine={current.codeLine}
      playback={{ ...playback, total: steps.length }}
      shuffleLabel="New array"
      onShuffle={shuffle}
      input={{ label: "target", value: target, onChange: changeTarget, placeholder: "x" }}
      stats={[
        { label: "comparisons", value: current.comparisons },
        { label: "array size", value: seed.length },
        { label: "result", value: result },
      ]}
    />
  );
};

export default ArraySearchPage;
