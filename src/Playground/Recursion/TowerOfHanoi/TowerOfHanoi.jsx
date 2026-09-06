import { useEffect, useState } from "react";
import "./TowerOfHanoi.css";

const PEG_ORDER = ["A", "B", "C"];

function hanoiSteps(diskCount) {
  const pegs = { A: [], B: [], C: [] };

  for (let size = diskCount; size >= 1; size--) {
    pegs.A.push(size);
  }

  const steps = [];
  const moveLog = [];
  const totalMoves = Math.pow(2, diskCount) - 1;

  let moveCount = 0;

  function clonePegs() {
    return { A: [...pegs.A], B: [...pegs.B], C: [...pegs.C] };
  }

  function save(line, description, opts = {}) {
    steps.push({
      pegs: clonePegs(),
      floatingDisk: opts.floatingDisk ?? null,
      codeLine: line,
      description,
      fromPeg: opts.fromPeg ?? null,
      toPeg: opts.toPeg ?? null,
      depth: opts.depth ?? 0,
      moveCount,
      totalMoves,
    });
  }

  function hanoi(n, from, to, via, depth) {
    // Line 1
    save(1, `hanoi(${n}, ${from}, ${to}, ${via})`, { depth });

    // Line 2
    if (n === 0) {
      save(2, "Base case: n = 0, return", { depth });
      return;
    }

    // Line 3
    save(3, `hanoi(${n - 1}, ${from}, ${via}, ${to})`, { depth });
    hanoi(n - 1, from, via, to, depth + 1);

    // Line 4 - lift, carry, drop
    const disk = pegs[from][pegs[from].length - 1];

    pegs[from].pop();

    save(4, `Lift disk ${disk} off peg ${from}`, {
      depth,
      fromPeg: from,
      toPeg: to,
      floatingDisk: { disk, peg: from },
    });

    save(4, `Carry disk ${disk} across to peg ${to}`, {
      depth,
      fromPeg: from,
      toPeg: to,
      floatingDisk: { disk, peg: to },
    });

    pegs[to].push(disk);
    moveCount++;

    moveLog.push({ moveNumber: moveCount, disk, from, to });

    save(4, `Move ${moveCount}: disk ${disk} placed on peg ${to}`, {
      depth,
      fromPeg: from,
      toPeg: to,
    });

    // Line 5
    save(5, `hanoi(${n - 1}, ${via}, ${to}, ${from})`, { depth });
    hanoi(n - 1, via, to, from, depth + 1);
  }

  // Start
  save(1, "Started Tower of Hanoi");

  hanoi(diskCount, "A", "C", "B", 0);

  save(1, `Solved! ${moveCount} moves (2^${diskCount} - 1 = ${totalMoves})`);

  return { steps, moveLog };
}

const CodeLines = [
  // 1
  <>
    <span className="ht-type">void</span> hanoi
    <span className="ht-symbol">(</span>
    <span className="ht-type">int</span> n
    <span className="ht-symbol">,</span>{" "}
    <span className="ht-type">char</span> from
    <span className="ht-symbol">,</span>{" "}
    <span className="ht-type">char</span> to
    <span className="ht-symbol">,</span>{" "}
    <span className="ht-type">char</span> via
    <span className="ht-symbol">)</span>{" "}
    <span className="ht-symbol">{"{"}</span>
  </>,

  // 2
  <>
    &nbsp;&nbsp;
    <span className="ht-keyword">if</span>
    <span className="ht-symbol">(</span>
    n <span className="ht-symbol">==</span>
    <span className="ht-number">0</span>
    <span className="ht-symbol">)</span>{" "}
    <span className="ht-keyword">return</span>
    <span className="ht-symbol">;</span>
  </>,

  // 3
  <>
    &nbsp;&nbsp;
    hanoi
    <span className="ht-symbol">(</span>
    n <span className="ht-symbol">-</span>
    <span className="ht-number">1</span>
    <span className="ht-symbol">,</span> from
    <span className="ht-symbol">,</span> via
    <span className="ht-symbol">,</span> to
    <span className="ht-symbol">)</span>
    <span className="ht-symbol">;</span>
  </>,

  // 4
  <>
    &nbsp;&nbsp;
    moveDisk
    <span className="ht-symbol">(</span>
    from<span className="ht-symbol">,</span> to
    <span className="ht-symbol">)</span>
    <span className="ht-symbol">;</span>
  </>,

  // 5
  <>
    &nbsp;&nbsp;
    hanoi
    <span className="ht-symbol">(</span>
    n <span className="ht-symbol">-</span>
    <span className="ht-number">1</span>
    <span className="ht-symbol">,</span> via
    <span className="ht-symbol">,</span> to
    <span className="ht-symbol">,</span> from
    <span className="ht-symbol">)</span>
    <span className="ht-symbol">;</span>
  </>,

  // 6
  <>
    <span className="ht-symbol">{"}"}</span>
  </>,

  // 7
  <>&nbsp;</>,

  // 8
  <>
    <span className="ht-type">void</span> moveDisk
    <span className="ht-symbol">(</span>
    <span className="ht-type">char</span> from
    <span className="ht-symbol">,</span>{" "}
    <span className="ht-type">char</span> to
    <span className="ht-symbol">)</span>{" "}
    <span className="ht-symbol">{"{"}</span>
  </>,

  // 9
  <>
    &nbsp;&nbsp;
    <span className="ht-type">int</span> disk
    <span className="ht-symbol"> = </span>
    pegs<span className="ht-symbol">[</span>from
    <span className="ht-symbol">].</span>pop
    <span className="ht-symbol">();</span>
  </>,

  // 10
  <>
    &nbsp;&nbsp;
    pegs<span className="ht-symbol">[</span>to
    <span className="ht-symbol">].</span>push
    <span className="ht-symbol">(</span>disk
    <span className="ht-symbol">);</span>
  </>,

  // 11
  <>
    <span className="ht-symbol">{"}"}</span>
  </>,
];

const SpeedDelay = {
  1: 1400,
  2: 1100,
  3: 850,
  4: 650,
  5: 500,
  6: 380,
  7: 280,
  8: 200,
  9: 140,
  10: 90,
};

const DISK_COLORS = [
  "#ff6a3d",
  "#ffb037",
  "#b4ff39",
  "#39d9ff",
  "#7c8cff",
  "#c77cff",
  "#ff5fa8",
];

const DISK_H = 20;
const SLOT_H = 24;
const PEG_COL_W = 160;
const MIN_DISK_W = 46;
const MAX_DISK_W = 138;
const TOP_PAD = 46;
const LIFT_HEIGHT = 46;
const BASE_H = 12;

const PEG_INDEX = { A: 0, B: 1, C: 2 };

const HanoiTower = () => {
  const [diskCount, setDiskCount] = useState(4);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(5);

  const { steps, moveLog } = hanoiSteps(diskCount);
  const current = steps[index];

  const rodHeight = diskCount * SLOT_H + 20;
  const baseY = TOP_PAD + LIFT_HEIGHT + rodHeight;
  const rodTopY = baseY - rodHeight;
  const liftedY = rodTopY - LIFT_HEIGHT;

  const svgWidth = PEG_COL_W * 3;
  const svgHeight = baseY + BASE_H + 34;

  const pegX = (pegLetter) => PEG_COL_W * (PEG_INDEX[pegLetter] + 0.5);

  const diskWidth = (size) =>
    diskCount <= 1
      ? MAX_DISK_W
      : MIN_DISK_W + ((size - 1) * (MAX_DISK_W - MIN_DISK_W)) / (diskCount - 1);

  const diskPosition = (disk) => {
    if (current.floatingDisk && current.floatingDisk.disk === disk) {
      return { x: pegX(current.floatingDisk.peg), y: liftedY };
    }

    for (const peg of PEG_ORDER) {
      const stackIndex = current.pegs[peg].indexOf(disk);

      if (stackIndex !== -1) {
        return { x: pegX(peg), y: baseY - (stackIndex + 1) * SLOT_H };
      }
    }

    return { x: pegX("A"), y: baseY - SLOT_H };
  };

  useEffect(() => {
    if (!playing || index >= steps.length - 1) {
      if (index >= steps.length - 1) {
        setPlaying(false);
      }
      return;
    }

    const timer = setTimeout(
      () => setIndex(i => i + 1),
      SpeedDelay[speed]
    );

    return () => clearTimeout(timer);
  }, [playing, index, speed, steps.length]);

  const reset = () => {
    setPlaying(false);
    setIndex(0);
  };

  const shuffle = () => {
    setDiskCount(Math.floor(Math.random() * 4) + 3);
    reset();
  };

  const stepForward = () => {
    setPlaying(false);

    if (index < steps.length - 1) {
      setIndex(index + 1);
    }
  };

  const stepBack = () => {
    setPlaying(false);

    if (index > 0) {
      setIndex(index - 1);
    }
  };

  const togglePlay = () => {
    if (index === steps.length - 1) {
      setIndex(0);
    }

    setPlaying(!playing);
  };

  return (
    <div className="hanoi-tower-wrapper">
      <div className="hanoi-tower">
        <p className="ht-eyebrow">recursion</p>

        <h1 className="ht-title">Tower of Hanoi</h1>

        <div className="ht-header">
          <p className="ht-blurb">
            Moves a stack of disks from one peg to another, one at a time, never placing a larger disk on a smaller one.
          </p>

          <div className="ht-complexity">
            <div>
              <div className="ht-complexity-label">time</div>
              <div className="ht-time-value">O(2^n)</div>
            </div>

            <div>
              <div className="ht-complexity-label">space</div>
              <div className="ht-space-value">O(n)</div>
            </div>
          </div>
        </div>

        <div className="ht-grid">
          <div className="ht-stage">
            <div className="ht-call-banner">
              <span className="ht-call-label">call</span>
              <span className="ht-call-value">{current.description}</span>

              {current.moveCount > 0 && (
                <span className="ht-move-badge">
                  move {current.moveCount} / {current.totalMoves}
                </span>
              )}
            </div>

            <div className="ht-stage-wrap">
              <svg
                className="ht-stage-svg"
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                width={svgWidth}
                height={svgHeight}
              >
                <rect
                  x="0"
                  y={baseY}
                  width={svgWidth}
                  height={BASE_H}
                  rx="4"
                  fill="#1c1c1f"
                  stroke="#262629"
                  strokeWidth="1.4"
                />

                {PEG_ORDER.map((peg) => (
                  <rect
                    key={`rod-${peg}`}
                    x={pegX(peg) - 4}
                    y={rodTopY}
                    width="8"
                    height={baseY - rodTopY}
                    rx="3"
                    fill="#33333a"
                  />
                ))}

                {PEG_ORDER.map((peg) => {
                  const isSource = peg === current.fromPeg;
                  const isTarget = peg === current.toPeg;

                  return (
                    <text
                      key={`label-${peg}`}
                      x={pegX(peg)}
                      y={baseY + BASE_H + 22}
                      textAnchor="middle"
                      className="ht-peg-label"
                      fill={isSource ? "#ff6a3d" : isTarget ? "#b4ff39" : "#7a7a80"}
                    >
                      {peg}
                    </text>
                  );
                })}

                {Array.from({ length: diskCount }, (_, i) => diskCount - i).map(
                  (size) => {
                    const pos = diskPosition(size);
                    const width = diskWidth(size);
                    const isFloating =
                      current.floatingDisk && current.floatingDisk.disk === size;

                    return (
                      <g
                        key={`disk-${size}`}
                        className="ht-disk"
                        style={{
                          transform: `translate(${pos.x}px, ${pos.y}px)`,
                        }}
                      >
                        <rect
                          x={-width / 2}
                          y="0"
                          width={width}
                          height={DISK_H}
                          rx="6"
                          fill={DISK_COLORS[(size - 1) % DISK_COLORS.length]}
                          stroke={isFloating ? "#f3f2ed" : "#0a0a0b"}
                          strokeWidth={isFloating ? 2 : 1.2}
                        />

                        <text
                          x="0"
                          y={DISK_H / 2 + 4}
                          textAnchor="middle"
                          className="ht-disk-value"
                        >
                          {size}
                        </text>
                      </g>
                    );
                  }
                )}
              </svg>
            </div>

            <p className="ht-status">
              recursion depth: {current.depth}
              {current.fromPeg && (
                <span className="ht-status-move">
                  {" "}&mdash; peg {current.fromPeg} &rarr; peg {current.toPeg}
                </span>
              )}
            </p>
          </div>

          <div className="ht-code-panel">
            <div className="ht-code-header">
              <div className="ht-dummy-btns">
                <span className="ht-red-btn"></span>
                <span className="ht-yellow-btn"></span>
                <span className="ht-green-btn"></span>
                <span className="ht-filename">hanoi.cpp</span>
              </div>

              <span className="ht-header-complexity">O(2^n)</span>
            </div>

            <pre className="ht-code-block">
              {
                CodeLines.map((line, i) => {
                  return (
                    <div
                      key={i}
                      className={`ht-code-line ${current.codeLine === i + 1 ? "ht-code-line-active" : ""}`}
                    >
                      <span className="ht-line-no">{i + 1}</span>
                      {line}
                    </div>
                  );
                })
              }
            </pre>
          </div>
        </div>

        <div className="ht-controls">
          <button className="ht-icon-btn" onClick={reset}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
          </button>

          <button
            className="ht-icon-btn"
            onClick={stepBack}
            disabled={index === 0}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.971 4.285A2 2 0 0 1 21 6v12a2 2 0 0 1-3.029 1.715l-9.997-5.998a2 2 0 0 1-.003-3.432z" /><path d="M3 20V4" /></svg>
          </button>

          <button className="ht-play-btn" onClick={togglePlay}>
            {playing ? <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0a0a0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="14" y="3" width="5" height="18" rx="1" /><rect x="5" y="3" width="5" height="18" rx="1" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0a0a0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" /></svg>}
          </button>

          <button
            className="ht-icon-btn"
            onClick={stepForward}
            disabled={index === steps.length - 1}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 4v16" /><path d="M6.029 4.285A2 2 0 0 0 3 6v12a2 2 0 0 0 3.029 1.715l9.997-5.998a2 2 0 0 0 .003-3.432z" /></svg>
          </button>

          <button className="ht-shuffle-btn" onClick={shuffle}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 14 4 4-4 4" /><path d="m18 2 4 4-4 4" /><path d="M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22" /><path d="M2 6h1.972a4 4 0 0 1 3.6 2.2" /><path d="M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45" /></svg>
            New puzzle
          </button>

          <div className="ht-speed">
            <span>SPEED</span>

            <input
              type="range"
              min="1"
              max="10"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
          </div>

          <span className="ht-steps">
            {index + 1} / {steps.length}
          </span>
        </div>

        <div className="ht-stats">
          <span>
            disks: <b>{diskCount}</b>
          </span>

          <span>
            move: <b>{current.moveCount}</b> / {current.totalMoves}
          </span>

          <span>
            recursion depth: <b>{current.depth}</b>
          </span>
        </div>

        <div className="ht-move-log">
          <p className="ht-move-log-title">full move sequence</p>

          <div className="ht-move-log-rows">
            {moveLog.map((m) => (
              <span
                key={m.moveNumber}
                className={`ht-move-log-chip ${m.moveNumber <= current.moveCount ? "ht-move-log-chip-done" : ""}`}
              >
                {m.moveNumber}. {m.disk}: {m.from}&rarr;{m.to}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HanoiTower;
