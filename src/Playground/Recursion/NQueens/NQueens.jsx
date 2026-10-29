import { useMemo, useState } from "react";
import StepperPage, { Segment } from "../../shared/StepperPage";
import { usePlayback } from "../../shared/usePlayback";
import { QUEENS_CODE, nQueensSteps } from "../recursionSteps";
import "../recursionStage.css";

const SIZES = [4, 5, 6, 7, 8].map((n) => ({ id: n, label: `${n}×${n}` }));

const Queen = ({ className = "" }) => (
  <svg className={`rc-queen ${className}`} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z" />
    <path d="M5 21h14" fill="none" />
  </svg>
);

const NQueens = () => {
  const [n, setN] = useState(4);

  const steps = useMemo(() => nQueensSteps(n), [n]);
  const playback = usePlayback(steps.length);
  const current = steps[Math.min(playback.index, steps.length - 1)];

  const changeN = (value) => {
    setN(value);
    playback.reset();
  };

  const squares = [];

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const isTrying = current.trying && current.trying[0] === r && current.trying[1] === c;
      const hasQueen = current.queens[r] === c;
      const isAttacker = current.attacker && current.attacker[0] === r && current.attacker[1] === c;

      const classes = ["rc-square"];
      if ((r + c) % 2 === 1) classes.push("rc-square-dark");
      if (current.row === r) classes.push("rc-square-row");
      if (isTrying) classes.push(current.attacker ? "rc-square-attacked" : "rc-square-trying");

      let queenClass = "";
      if (isAttacker) queenClass = "rc-queen-attacker";
      else if (current.solved) queenClass = "rc-queen-solved";

      squares.push(
        <div key={`${r}-${c}`} className={classes.join(" ")}>
          {hasQueen && <Queen className={queenClass} />}
          {isTrying && !hasQueen && <Queen className="rc-queen-ghost" />}
        </div>
      );
    }
  }

  return (
    <StepperPage
      eyebrow="recursion"
      title="N-Queens"
      blurb="Place one queen per row. Try each column; if it's attacked move on, if nothing fits, pull the previous queen back and try its next column."
      complexity={[
        { label: "time", value: "O(n!)", tone: "time" },
        { label: "space", value: "O(n)", tone: "space" },
      ]}
      toolbar={<Segment label="board" options={SIZES} value={n} onChange={changeN} />}
      stage={
        <div className="rc-stage">
          <div className="rc-board" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>
            {squares}
          </div>
        </div>
      }
      legend={[
        { label: "trying", stroke: "#ff6a3d", fill: "rgba(255, 106, 61, 0.12)" },
        { label: "attacked / attacker", stroke: "#ff5f56", fill: "rgba(255, 95, 86, 0.14)" },
        { label: "current row", stroke: "rgba(124, 140, 255, 0.4)", fill: "rgba(124, 140, 255, 0.08)" },
        { label: "solved", stroke: "#b4ff39", fill: "transparent" },
      ]}
      status={current.description}
      filename="n_queens.cpp"
      code={QUEENS_CODE}
      codeLine={current.codeLine}
      playback={{ ...playback, total: steps.length }}
      stats={[
        { label: "safety checks", value: current.checks },
        { label: "placements", value: current.placements },
        { label: "backtracks", value: current.backtracks },
      ]}
    />
  );
};

export default NQueens;
