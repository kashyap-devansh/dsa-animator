import { useMemo, useState } from "react";
import StepperPage, { Segment } from "../../shared/StepperPage";
import { usePlayback } from "../../shared/usePlayback";
import { QUEENS_CODE, nQueensSteps } from "../recursionSteps";
import { IsoBoard } from "../../../iso/IsoExtras";

const SIZES = [4, 5, 6, 7, 8].map((n) => ({ id: n, label: `${n}×${n}` }));

const NQueens = () => {
  const [n, setN] = useState(4);

  const steps = useMemo(() => nQueensSteps(n), [n]);
  const playback = usePlayback(steps.length);
  const current = steps[Math.min(playback.index, steps.length - 1)];

  const changeN = (value) => {
    setN(value);
    playback.reset();
  };

  // Queens as dark cubes; the square being tried floats a coral cube.
  const pieces = {};
  current.queens.forEach((c, r) => {
    if (c === undefined || c === null || c < 0) return;
    const attacker = current.attacker && current.attacker[0] === r && current.attacker[1] === c;
    pieces[`${r}-${c}`] = { id: `q${r}`, label: "Q", tone: attacker ? "amber" : current.solved ? "sage" : "dark" };
  });
  if (current.trying) {
    const [r, c] = current.trying;
    if (!pieces[`${r}-${c}`]) pieces[`${r}-${c}`] = { id: `q${r}`, label: "Q", tone: current.attacker ? "ghost" : "coral" };
  }

  return (
    <StepperPage
      steps={steps}
      eyebrow="recursion"
      title="N-Queens"
      blurb="Place one queen per row. Try each column; if it's attacked move on, if nothing fits, pull the previous queen back and try its next column."
      complexity={[
        { label: "time", value: "O(n!)", tone: "time" },
        { label: "space", value: "O(n)", tone: "space" },
      ]}
      toolbar={<Segment label="board" options={SIZES} value={n} onChange={changeN} />}
      stage={<IsoBoard n={n} pieces={pieces} rowHighlight={current.solved ? null : current.row} label="N-Queens board" />}
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
