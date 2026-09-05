import { useEffect, useState } from "react";
import "./RadixSort.css";

function randomArray(size = 10) {
  const arr = [];

  for (let i = 0; i < size; i++) {
    arr.push(Math.floor(Math.random() * 890) + 10);
  }

  return arr;
}

const PlaceNames = ["ones", "tens", "hundreds", "thousands"];

function placeLabel(exp) {
  if (exp === null) return "—";

  const power = Math.round(Math.log10(exp));

  return PlaceNames[power] ?? `10^${power}`;
}

function radixSortSteps(input) {
  const arr = [...input];
  const n = arr.length;
  const steps = [];

  let extractions = 0;
  let placements = 0;
  let passNumber = 0;

  function save(line, description, opts = {}) {
    steps.push({
      array: [...arr],
      codeLine: line,
      description,
      exp: opts.exp ?? null,
      digit: opts.digit ?? -1,
      activeIndex: opts.activeIndex ?? -1,
      outputIndex: opts.outputIndex ?? -1,
      counts: opts.counts ? [...opts.counts] : null,
      output: opts.output ? [...opts.output] : null,
      passNumber,
      extractions,
      placements,
    });
  }

  function countSort(exp) {
    // Line 4
    save(4, `countSort(arr, ${exp})`, { exp });

    // Line 9
    save(9, "Initialize output array", { exp });

    // Line 10
    const count = new Array(10).fill(0);

    save(10, "Initialize count[10] = {0}", { exp, counts: count });

    // Line 11 + 12
    for (let i = 0; i < n; i++) {
      save(11, `Check i < ${n}`, {
        exp,
        activeIndex: i,
        counts: count,
      });

      const d = Math.floor(arr[i] / exp) % 10;

      count[d]++;
      extractions++;

      save(
        12,
        `Digit of arr[${i}] = ${arr[i]} is ${d}, count[${d}]++`,
        { exp, activeIndex: i, digit: d, counts: count }
      );
    }

    // Line 13 + 14
    for (let i = 1; i < 10; i++) {
      save(13, "Check i < 10 (prefix sum)", { exp, counts: count });

      count[i] += count[i - 1];

      save(14, `count[${i}] += count[${i - 1}] = ${count[i]}`, {
        exp,
        counts: count,
      });
    }

    const output = new Array(n).fill(null);

    // Line 15-18
    for (let i = n - 1; i >= 0; i--) {
      save(15, "Check i >= 0 (build output)", {
        exp,
        activeIndex: i,
        counts: count,
        output,
      });

      const d = Math.floor(arr[i] / exp) % 10;

      save(16, `d = digit of arr[${i}] = ${arr[i]} \u2192 ${d}`, {
        exp,
        activeIndex: i,
        digit: d,
        counts: count,
        output,
      });

      output[count[d] - 1] = arr[i];
      placements++;

      save(17, `output[${count[d] - 1}] = ${arr[i]}`, {
        exp,
        activeIndex: i,
        digit: d,
        outputIndex: count[d] - 1,
        counts: count,
        output,
      });

      count[d]--;

      save(18, `count[${d}]--`, {
        exp,
        activeIndex: i,
        digit: d,
        counts: count,
        output,
      });
    }

    // Line 19
    save(19, "Output array complete", { exp, counts: count, output });

    // Line 20 + 21
    for (let i = 0; i < n; i++) {
      arr[i] = output[i];

      save(21, `arr[${i}] = ${output[i]}`, { exp, activeIndex: i, output });
    }

    // Line 22
    save(22, `Pass complete for exp = ${exp}`, { exp });
  }

  // Start
  save(1, "Started Radix Sort");

  // Line 2
  const m = Math.max(...arr);

  save(2, `Find max value = ${m}`);

  // Line 3
  for (let exp = 1; Math.floor(m / exp) > 0; exp *= 10) {
    passNumber++;

    save(3, `Loop: exp = ${exp}`, { exp });

    countSort(exp);
  }

  save(1, "Array Sorted!");

  return steps;
}

const CodeLines = [
  // 1
  <>
    <span className="rs-type">void</span> radixSort
    <span className="rs-symbol">(</span>
    <span className="rs-type">vector</span>
    <span className="rs-symbol">&lt;</span>
    <span className="rs-type">int</span>
    <span className="rs-symbol">&gt;&amp;</span> arr
    <span className="rs-symbol">)</span>{" "}
    <span className="rs-symbol">{"{"}</span>
  </>,

  // 2
  <>
    &nbsp;&nbsp;
    <span className="rs-type">int</span> m
    <span className="rs-symbol"> = </span>
    getMax
    <span className="rs-symbol">(</span>
    arr
    <span className="rs-symbol">)</span>
    <span className="rs-symbol">;</span>
  </>,

  // 3
  <>
    &nbsp;&nbsp;
    <span className="rs-keyword">for</span>
    <span className="rs-symbol">(</span>
    <span className="rs-type">int</span> exp
    <span className="rs-symbol"> = </span>
    <span className="rs-number">1</span>
    <span className="rs-symbol">;</span> m
    <span className="rs-symbol"> / </span>exp
    <span className="rs-symbol"> &gt; </span>
    <span className="rs-number">0</span>
    <span className="rs-symbol">;</span> exp
    <span className="rs-symbol"> *= </span>
    <span className="rs-number">10</span>
    <span className="rs-symbol">)</span>
  </>,

  // 4
  <>
    &nbsp;&nbsp;&nbsp;&nbsp;
    countSort
    <span className="rs-symbol">(</span>
    arr<span className="rs-symbol">,</span> exp
    <span className="rs-symbol">)</span>
    <span className="rs-symbol">;</span>
  </>,

  // 5
  <>
    <span className="rs-symbol">{"}"}</span>
  </>,

  // 6
  <>&nbsp;</>,

  // 7
  <>
    <span className="rs-type">void</span> countSort
    <span className="rs-symbol">(</span>
    <span className="rs-type">vector</span>
    <span className="rs-symbol">&lt;</span>
    <span className="rs-type">int</span>
    <span className="rs-symbol">&gt;&amp;</span> arr
    <span className="rs-symbol">,</span>{" "}
    <span className="rs-type">int</span> exp
    <span className="rs-symbol">)</span>{" "}
    <span className="rs-symbol">{"{"}</span>
  </>,

  // 8
  <>
    &nbsp;&nbsp;
    <span className="rs-type">int</span> n
    <span className="rs-symbol"> = </span>
    arr<span className="rs-symbol">.</span>size
    <span className="rs-symbol">();</span>
  </>,

  // 9
  <>
    &nbsp;&nbsp;
    <span className="rs-type">vector</span>
    <span className="rs-symbol">&lt;</span>
    <span className="rs-type">int</span>
    <span className="rs-symbol">&gt;</span> output
    <span className="rs-symbol">(</span>n
    <span className="rs-symbol">);</span>
  </>,

  // 10
  <>
    &nbsp;&nbsp;
    <span className="rs-type">int</span> count
    <span className="rs-symbol">[</span>
    <span className="rs-number">10</span>
    <span className="rs-symbol">] = {"{"}</span>
    <span className="rs-number">0</span>
    <span className="rs-symbol">{"};"}</span>
  </>,

  // 11
  <>
    &nbsp;&nbsp;
    <span className="rs-keyword">for</span>
    <span className="rs-symbol">(</span>
    <span className="rs-type">int</span> i
    <span className="rs-symbol"> = </span>
    <span className="rs-number">0</span>
    <span className="rs-symbol">;</span> i
    <span className="rs-symbol"> &lt; </span>n
    <span className="rs-symbol">;</span> i
    <span className="rs-symbol">++</span>
    <span className="rs-symbol">)</span>
  </>,

  // 12
  <>
    &nbsp;&nbsp;&nbsp;&nbsp;
    count<span className="rs-symbol">[(</span>
    arr<span className="rs-symbol">[</span>i
    <span className="rs-symbol">]</span>
    <span className="rs-symbol"> / </span>exp
    <span className="rs-symbol">) % </span>
    <span className="rs-number">10</span>
    <span className="rs-symbol">]</span>
    <span className="rs-symbol">++;</span>
  </>,

  // 13
  <>
    &nbsp;&nbsp;
    <span className="rs-keyword">for</span>
    <span className="rs-symbol">(</span>
    <span className="rs-type">int</span> i
    <span className="rs-symbol"> = </span>
    <span className="rs-number">1</span>
    <span className="rs-symbol">;</span> i
    <span className="rs-symbol"> &lt; </span>
    <span className="rs-number">10</span>
    <span className="rs-symbol">;</span> i
    <span className="rs-symbol">++</span>
    <span className="rs-symbol">)</span>
  </>,

  // 14
  <>
    &nbsp;&nbsp;&nbsp;&nbsp;
    count<span className="rs-symbol">[</span>i
    <span className="rs-symbol">] += </span>
    count<span className="rs-symbol">[</span>i
    <span className="rs-symbol"> - </span>
    <span className="rs-number">1</span>
    <span className="rs-symbol">];</span>
  </>,

  // 15
  <>
    &nbsp;&nbsp;
    <span className="rs-keyword">for</span>
    <span className="rs-symbol">(</span>
    <span className="rs-type">int</span> i
    <span className="rs-symbol"> = </span>
    n<span className="rs-symbol"> - </span>
    <span className="rs-number">1</span>
    <span className="rs-symbol">;</span> i
    <span className="rs-symbol"> &gt;= </span>
    <span className="rs-number">0</span>
    <span className="rs-symbol">;</span> i
    <span className="rs-symbol">--</span>
    <span className="rs-symbol">)</span>
    <span className="rs-symbol">{"{"}</span>
  </>,

  // 16
  <>
    &nbsp;&nbsp;&nbsp;&nbsp;
    <span className="rs-type">int</span> d
    <span className="rs-symbol"> = (</span>
    arr<span className="rs-symbol">[</span>i
    <span className="rs-symbol">]</span>
    <span className="rs-symbol"> / </span>exp
    <span className="rs-symbol">) % </span>
    <span className="rs-number">10</span>
    <span className="rs-symbol">;</span>
  </>,

  // 17
  <>
    &nbsp;&nbsp;&nbsp;&nbsp;
    output<span className="rs-symbol">[</span>
    count<span className="rs-symbol">[</span>d
    <span className="rs-symbol">] - </span>
    <span className="rs-number">1</span>
    <span className="rs-symbol">] = </span>
    arr<span className="rs-symbol">[</span>i
    <span className="rs-symbol">];</span>
  </>,

  // 18
  <>
    &nbsp;&nbsp;&nbsp;&nbsp;
    count<span className="rs-symbol">[</span>d
    <span className="rs-symbol">]--;</span>
  </>,

  // 19
  <>
    &nbsp;&nbsp;
    <span className="rs-symbol">{"}"}</span>
  </>,

  // 20
  <>
    &nbsp;&nbsp;
    <span className="rs-keyword">for</span>
    <span className="rs-symbol">(</span>
    <span className="rs-type">int</span> i
    <span className="rs-symbol"> = </span>
    <span className="rs-number">0</span>
    <span className="rs-symbol">;</span> i
    <span className="rs-symbol"> &lt; </span>n
    <span className="rs-symbol">;</span> i
    <span className="rs-symbol">++</span>
    <span className="rs-symbol">)</span>
  </>,

  // 21
  <>
    &nbsp;&nbsp;&nbsp;&nbsp;
    arr<span className="rs-symbol">[</span>i
    <span className="rs-symbol">] = </span>
    output<span className="rs-symbol">[</span>i
    <span className="rs-symbol">];</span>
  </>,

  // 22
  <>
    <span className="rs-symbol">{"}"}</span>
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

const CELL_W = 46;
const CELL_H = 46;
const ROW_GAP = 74;
const PAD_TOP = 36;

const RadixSort = () => {
  const [seed, setSeed] = useState(randomArray());
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(5);

  const steps = radixSortSteps(seed);
  const current = steps[index];
  const isDone = index === steps.length - 1;
  const n = current.array.length;

  const counts = current.counts ?? new Array(10).fill(0);
  const output = current.output ?? new Array(n).fill(null);

  const gridCols = Math.max(n, 10);
  const svgWidth = gridCols * CELL_W;
  const svgHeight = PAD_TOP + CELL_H + ROW_GAP + CELL_H + ROW_GAP + CELL_H + 10;

  const arrayRowY = PAD_TOP;
  const bucketRowY = arrayRowY + CELL_H + ROW_GAP;
  const outputRowY = bucketRowY + CELL_H + ROW_GAP;

  const bucketW = (gridCols * CELL_W) / 10;

  // Pointer under the array row - tracks the loop index i
  const arrayPointerX =
    current.activeIndex !== -1
      ? current.activeIndex * CELL_W + CELL_W / 2
      : null;

  // Pointer above the output row - tracks where a value just landed
  const outputTargetIndex =
    current.outputIndex !== -1
      ? current.outputIndex
      : current.codeLine === 21
        ? current.activeIndex
        : -1;

  const outputPointerX =
    outputTargetIndex !== -1 ? outputTargetIndex * CELL_W + CELL_W / 2 : null;

  // Traveling marker - animates a value moving out of the array and into
  // whichever row the current loop iteration is acting on. Parking it at
  // the source position with opacity 0 first, then flipping to the target
  // position with opacity 1, is what makes the movement animate smoothly
  // between two consecutive steps.
  let marker = null;

  if (current.activeIndex !== -1) {
    const sourceX = current.activeIndex * CELL_W + CELL_W / 2;
    const sourceY = arrayRowY + CELL_H / 2;
    const value = current.array[current.activeIndex];

    if (current.codeLine === 11) {
      marker = { x: sourceX, y: sourceY, value, color: "#ff6a3d", visible: false };
    } else if (current.codeLine === 12 && current.digit !== -1) {
      marker = {
        x: current.digit * bucketW + bucketW / 2,
        y: bucketRowY + CELL_H / 2,
        value,
        color: "#ff6a3d",
        visible: true,
      };
    } else if (current.codeLine === 15 || current.codeLine === 16) {
      marker = { x: sourceX, y: sourceY, value, color: "#b4ff39", visible: false };
    } else if (current.codeLine === 17 && current.outputIndex !== -1) {
      marker = {
        x: current.outputIndex * CELL_W + CELL_W / 2,
        y: outputRowY + CELL_H / 2,
        value,
        color: "#b4ff39",
        visible: true,
      };
    } else if (current.codeLine === 18 && current.outputIndex !== -1) {
      marker = {
        x: current.outputIndex * CELL_W + CELL_W / 2,
        y: outputRowY + CELL_H / 2,
        value,
        color: "#b4ff39",
        visible: false,
      };
    }
  }

  const maxPasses = steps[steps.length - 1].passNumber;
  const passSnapshots = steps.filter((s) => s.codeLine === 22);

  const passState = (passNum) => {
    if (current.passNumber === 0) return "pending";
    if (passNum < current.passNumber) return "done";

    if (passNum === current.passNumber) {
      return current.codeLine === 22 || isDone ? "done" : "active";
    }

    return "pending";
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
    setSeed(randomArray());
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
    <div className="radix-sort-wrapper">
      <div className="radix-sort">
        <p className="rs-eyebrow">sorting</p>

        <h1 className="rs-title">Radix Sort</h1>

        <div className="rs-header">
          <p className="rs-blurb">
            Sorts numbers digit by digit, from least to most significant, using a stable counting sort at each pass.
          </p>

          <div className="rs-complexity">
            <div>
              <div className="rs-complexity-label">time</div>
              <div className="rs-time-value">O(d(n + k))</div>
            </div>

            <div>
              <div className="rs-complexity-label">space</div>
              <div className="rs-space-value">O(n + k)</div>
            </div>
          </div>
        </div>

        <div className="rs-grid">
          <div className="rs-stage">
            <div className="rs-pass-tracker">
              {Array.from({ length: maxPasses }, (_, i) => i + 1).flatMap(
                (passNum, i) => {
                  const state = passState(passNum);
                  const label = placeLabel(10 ** (passNum - 1));

                  const pill = (
                    <div
                      key={`pill-${passNum}`}
                      className={`rs-pass-pill rs-pass-${state}`}
                    >
                      <span className="rs-pass-index">{passNum}</span>
                      <span className="rs-pass-label">{label}</span>
                    </div>
                  );

                  return i === 0
                    ? [pill]
                    : [
                      <span key={`arrow-${passNum}`} className="rs-pass-arrow">
                        &rarr;
                      </span>,
                      pill,
                    ];
                }
              )}
            </div>

            <div className="rs-stage-wrap">
              <svg
                className="rs-stage-svg"
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                width={svgWidth}
                height={svgHeight}
              >
                {/* Main array row */}
                {current.array.map((val, idx) => {
                  const isActive = idx === current.activeIndex;

                  return (
                    <g key={`arr-${idx}`}>
                      <rect
                        className="rs-cell-rect"
                        x={idx * CELL_W}
                        y={arrayRowY}
                        width={CELL_W}
                        height={CELL_H}
                        rx="8"
                        fill={isDone ? "rgba(180, 255, 57, 0.08)" : "transparent"}
                        stroke={isDone ? "#b4ff39" : isActive ? "#ff6a3d" : "#33333a"}
                        strokeWidth={isActive ? 2 : 1.4}
                      />

                      <text
                        x={idx * CELL_W + CELL_W / 2}
                        y={arrayRowY + CELL_H / 2 + 5}
                        textAnchor="middle"
                        className="rs-cell-value"
                        fill={isDone ? "#b4ff39" : isActive ? "#ff6a3d" : "#f3f2ed"}
                      >
                        {val}
                      </text>

                      {isActive && current.digit !== -1 && (
                        <text
                          x={idx * CELL_W + CELL_W / 2}
                          y={arrayRowY - 14}
                          textAnchor="middle"
                          className="rs-digit-badge"
                        >
                          digit {current.digit}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Bucket / count row */}
                {counts.map((count, digit) => {
                  const isActive = digit === current.digit;

                  return (
                    <g key={`bucket-${digit}`}>
                      <rect
                        className="rs-cell-rect"
                        x={digit * bucketW}
                        y={bucketRowY}
                        width={bucketW}
                        height={CELL_H}
                        rx="8"
                        fill="transparent"
                        stroke={isActive ? "#ff6a3d" : "#33333a"}
                        strokeWidth={isActive ? 2 : 1.4}
                      />

                      <text
                        x={digit * bucketW + bucketW / 2}
                        y={bucketRowY - 14}
                        textAnchor="middle"
                        className="rs-bucket-label"
                      >
                        {digit}
                      </text>

                      <text
                        x={digit * bucketW + bucketW / 2}
                        y={bucketRowY + CELL_H / 2 + 5}
                        textAnchor="middle"
                        className="rs-cell-value"
                        fill={isActive ? "#ff6a3d" : "#7c8cff"}
                      >
                        {count}
                      </text>
                    </g>
                  );
                })}

                {/* Output row */}
                {output.map((val, idx) => {
                  const isTarget = idx === current.outputIndex;
                  const isPlaced = val !== null && val !== undefined;

                  return (
                    <g key={`out-${idx}`}>
                      <rect
                        className="rs-cell-rect"
                        x={idx * CELL_W}
                        y={outputRowY}
                        width={CELL_W}
                        height={CELL_H}
                        rx="8"
                        fill={isPlaced ? "rgba(180, 255, 57, 0.08)" : "transparent"}
                        stroke={isTarget ? "#ff6a3d" : isPlaced ? "#b4ff39" : "#33333a"}
                        strokeWidth={isTarget ? 2 : 1.4}
                      />

                      <text
                        x={idx * CELL_W + CELL_W / 2}
                        y={outputRowY + CELL_H / 2 + 5}
                        textAnchor="middle"
                        className="rs-cell-value"
                        fill={isPlaced ? "#b4ff39" : "#4a4a4f"}
                      >
                        {isPlaced ? val : "\u00b7"}
                      </text>
                    </g>
                  );
                })}

                {/* Pointer tracking loop index i under the array row */}
                {arrayPointerX !== null && (
                  <polygon
                    className="rs-pointer"
                    style={{
                      transform: `translate(${arrayPointerX}px, ${arrayRowY + CELL_H + 12}px)`,
                    }}
                    points="0,-7 -6,4 6,4"
                    fill="#ff6a3d"
                  />
                )}

                {/* Pointer tracking where a value just landed in output */}
                {outputPointerX !== null && (
                  <polygon
                    className="rs-pointer"
                    style={{
                      transform: `translate(${outputPointerX}px, ${outputRowY - 12}px)`,
                    }}
                    points="0,7 -6,-4 6,-4"
                    fill="#b4ff39"
                  />
                )}

                {/* Traveling marker: animates a value moving out of the
                    array into the bucket row (counting) or the output
                    row (building) */}
                {marker && (
                  <g
                    className="rs-marker"
                    style={{
                      transform: `translate(${marker.x}px, ${marker.y}px)`,
                      opacity: marker.visible ? 1 : 0,
                    }}
                  >
                    <circle r="13" fill="#0a0a0b" stroke={marker.color} strokeWidth="2" />
                    <text
                      textAnchor="middle"
                      dy="5"
                      className="rs-marker-value"
                      fill={marker.color}
                    >
                      {marker.value}
                    </text>
                  </g>
                )}
              </svg>
            </div>

            <p className="rs-status">
              {current.description}
              {current.exp !== null && (
                <span className="rs-place">
                  {" "}&mdash; digit place: {placeLabel(current.exp)}
                </span>
              )}
            </p>
          </div>

          <div className="rs-code-panel">
            <div className="rs-code-header">
              <div className="rs-dummy-btns">
                <span className="rs-red-btn"></span>
                <span className="rs-yellow-btn"></span>
                <span className="rs-green-btn"></span>
                <span className="rs-filename">radix_sort.cpp</span>
              </div>

              <span className="rs-header-complexity">O(d(n + k))</span>
            </div>

            <pre className="rs-code-block">
              {
                CodeLines.map((line, i) => {
                  return (
                    <div
                      key={i}
                      className={`rs-code-line ${current.codeLine === i + 1 ? "rs-code-line-active" : ""}`}
                    >
                      <span className="rs-line-no">{i + 1}</span>
                      {line}
                    </div>
                  );
                })
              }
            </pre>
          </div>
        </div>

        <div className="rs-controls">
          <button className="rs-icon-btn" onClick={reset}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
          </button>

          <button
            className="rs-icon-btn"
            onClick={stepBack}
            disabled={index === 0}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.971 4.285A2 2 0 0 1 21 6v12a2 2 0 0 1-3.029 1.715l-9.997-5.998a2 2 0 0 1-.003-3.432z" /><path d="M3 20V4" /></svg>
          </button>

          <button className="rs-play-btn" onClick={togglePlay}>
            {playing ? <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0a0a0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="14" y="3" width="5" height="18" rx="1" /><rect x="5" y="3" width="5" height="18" rx="1" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0a0a0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" /></svg>}
          </button>

          <button
            className="rs-icon-btn"
            onClick={stepForward}
            disabled={index === steps.length - 1}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 4v16" /><path d="M6.029 4.285A2 2 0 0 0 3 6v12a2 2 0 0 0 3.029 1.715l9.997-5.998a2 2 0 0 0 .003-3.432z" /></svg>
          </button>

          <button className="rs-shuffle-btn" onClick={shuffle}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 14 4 4-4 4" /><path d="m18 2 4 4-4 4" /><path d="M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22" /><path d="M2 6h1.972a4 4 0 0 1 3.6 2.2" /><path d="M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45" /></svg>
            Shuffle
          </button>

          <div className="rs-speed">
            <span>SPEED</span>

            <input
              type="range"
              min="1"
              max="10"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
          </div>

          <span className="rs-steps">
            {index + 1} / {steps.length}
          </span>
        </div>

        <div className="rs-stats">
          <span>
            pass: <b>{current.passNumber}</b> / {maxPasses}
          </span>

          <span>
            digit extractions: <b>{current.extractions}</b>
          </span>

          <span>
            placements: <b>{current.placements}</b>
          </span>
        </div>

        <div className="rs-pass-history">
          <p className="rs-pass-history-title">array after each pass</p>

          <div className="rs-pass-history-rows">
            {passSnapshots.map((snap) => (
              <div key={snap.passNumber} className="rs-pass-history-row">
                <span className="rs-pass-history-label">
                  pass {snap.passNumber} &middot; {placeLabel(snap.exp)}
                </span>

                <span className="rs-pass-history-values">
                  {snap.array.join(", ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RadixSort;
