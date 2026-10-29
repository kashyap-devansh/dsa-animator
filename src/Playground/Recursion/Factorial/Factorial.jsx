import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import StepperPage from "../../shared/StepperPage";
import { usePlayback } from "../../shared/usePlayback";
import { FACTORIAL_CODE, factorialSteps } from "../recursionSteps";
import "../recursionStage.css";

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
      eyebrow="recursion"
      title="Factorial"
      blurb="Each call parks on the stack waiting for a smaller one, until n hits 1 — then the products multiply their way back down."
      complexity={[
        { label: "time", value: "O(n)", tone: "time" },
        { label: "space", value: "O(n)", tone: "space" },
      ]}
      stage={
        <div className="rc-stage">
          <div className="rc-stack">
            <AnimatePresence initial={false}>
              {[...current.frames].reverse().map((frame) => (
                <motion.div
                  key={frame.n}
                  layout
                  initial={{ opacity: 0, y: -14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{ duration: 0.3 }}
                  className={`rc-frame rc-frame-${frame.status} ${current.active === frame.n && frame.status !== "returning" && frame.status !== "base" ? "rc-frame-active" : ""}`}
                >
                  <span>factorial({frame.n})</span>
                  <span className="rc-frame-note">{frameNote(frame)}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="rc-stack-floor">call stack</div>

          {current.result !== undefined && (
            <p className="rc-result">
              {size}! = <b>{current.result}</b>
            </p>
          )}
        </div>
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
