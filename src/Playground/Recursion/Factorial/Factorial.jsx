import { useMemo, useState } from "react";
import StepperPage from "../../shared/StepperPage";
import { usePlayback } from "../../shared/usePlayback";
import { FACTORIAL_CODE, factorialSteps } from "../recursionSteps";
import { IsoCallStack } from "../../../iso/IsoExtras";

const MAX_N = 10;

const frameNote = (frame) => {
  if (frame.status === "running") return "running…";
  if (frame.status === "waiting") return `${frame.n} × factorial(${frame.n - 1})`;
  return `returns ${frame.value}`;
};

const Factorial = () => {
  const [n, setN] = useState(5);
  const size = Math.min(Math.max(Number(n) || 1, 1), MAX_N);

  const steps = useMemo(() => factorialSteps(size), [size]);
  const playback = usePlayback(steps.length);
  const current = steps[Math.min(playback.index, steps.length - 1)];

  const changeN = (value) => {
    setN(value === "" ? "" : Math.min(Number(value), MAX_N));
    playback.reset();
  };

  const shuffle = () => {
    setN(3 + Math.floor(Math.random() * (MAX_N - 2)));
    playback.reset();
  };

  return (
    <StepperPage
      steps={steps}
      eyebrow="recursion"
      title="Factorial"
      blurb="Each call parks on the stack waiting for a smaller one, until n hits 1 — then the products multiply their way back down."
      complexity={[
        { label: "time", value: "O(n)", tone: "time" },
        { label: "space", value: "O(n)", tone: "space" },
      ]}
      stage={
        <IsoCallStack
          max={MAX_N}
          frames={current.frames.map((frame) => ({
            id: frame.n,
            label: `factorial(${frame.n})`,
            note: frameNote(frame),
            tone: frame.status === "returning" || frame.status === "base" ? "sage" : current.active === frame.n ? "coral" : "idle",
          }))}
          footer={current.result !== undefined ? `${size}! = ${current.result}` : "call stack"}
        />
      }
      legend={[
        { label: "running / waiting", stroke: "#ff6a3d", fill: "rgba(255, 106, 61, 0.08)" },
        { label: "returning", stroke: "#b4ff39", fill: "rgba(180, 255, 57, 0.06)" },
      ]}
      status={current.description}
      filename="factorial.cpp"
      code={FACTORIAL_CODE}
      codeLine={current.codeLine}
      playback={{ ...playback, total: steps.length }}
      shuffleLabel="Random n"
      onShuffle={shuffle}
      input={{ label: "n", value: n, onChange: changeN, min: 1, max: MAX_N }}
      stats={[
        { label: "calls", value: current.calls },
        { label: "stack depth", value: current.depth },
        { label: "max n", value: MAX_N },
      ]}
    />
  );
};

export default Factorial;
