import { useState } from "react";
import { usePlayback } from "../../../shared/usePlayback";
import { ResetIcon, StepBackIcon, PlayIcon, PauseIcon, StepForwardIcon, ShuffleIcon } from "../../../shared/icons";
import "./CountSort.css";

function randomArray(size = 10) {
  const arr = [];

  for (let i = 0; i < size; i++) {
    arr.push(Math.floor(Math.random() * 30));
  }

  return arr;
}

function countSortSteps(input) {
  const arr = [...input];
  const n = arr.length;
  const steps = [];

  let increments = 0;
  let placements = 0;

  function save(line, description, opts = {}) {
    steps.push({
      array: [...arr],
      codeLine: line,
      description,
      activeIndex: opts.activeIndex ?? -1,
      offset: opts.offset ?? -1,
      outputIndex: opts.outputIndex ?? -1,
      counts: opts.counts ? [...opts.counts] : null,
      output: opts.output ? [...opts.output] : null,
      min: opts.min ?? null,
      max: opts.max ?? null,
      increments,
      placements,
    });
  }

  save(1, "Started Count Sort");

  const maxVal = Math.max(...arr);

  save(3, `Find max value = ${maxVal}`, { max: maxVal });

  const minVal = Math.min(...arr);

  save(4, `Find min value = ${minVal}`, { max: maxVal, min: minVal });

  const range = maxVal - minVal + 1;

  save(5, `range = ${maxVal} - ${minVal} + 1 = ${range}`, { max: maxVal, min: minVal });

  const count = new Array(range).fill(0);

  save(7, `Initialize count[${range}] = {0}`, { max: maxVal, min: minVal, counts: count });

  for (let i = 0; i < n; i++) {
    save(10, `Check i < ${n}`, { max: maxVal, min: minVal, activeIndex: i, counts: count });

    const offset = arr[i] - minVal;

    count[offset]++;
    increments++;

    save(11, `arr[${i}] = ${arr[i]} → count[${offset}]++`, {
      max: maxVal, min: minVal, activeIndex: i, offset, counts: count,
    });
  }

  for (let i = 1; i < range; i++) {
    save(13, `Check i < ${range} (prefix sum)`, { max: maxVal, min: minVal, counts: count });

    count[i] += count[i - 1];

    save(14, `count[${i}] += count[${i - 1}] = ${count[i]}`, {
      max: maxVal, min: minVal, counts: count,
    });
  }

  const output = new Array(n).fill(null);

  for (let i = n - 1; i >= 0; i--) {
    save(16, "Check i >= 0 (build output)", {
      max: maxVal, min: minVal, activeIndex: i, counts: count, output,
    });

    const offset = arr[i] - minVal;

    save(17, `output[count[${offset}] - 1] = arr[${i}] = ${arr[i]}`, {
      max: maxVal, min: minVal, activeIndex: i, offset, outputIndex: count[offset] - 1, counts: count, output,
    });

    output[count[offset] - 1] = arr[i];
    placements++;

    count[offset]--;

    save(18, `count[${offset}]--`, {
      max: maxVal, min: minVal, activeIndex: i, offset, outputIndex: count[offset], counts: count, output,
    });
  }

  save(19, "Output array complete", { max: maxVal, min: minVal, counts: count, output });

  for (let i = 0; i < n; i++) {
    arr[i] = output[i];

    save(22, `arr[${i}] = ${output[i]}`, { max: maxVal, min: minVal, activeIndex: i, output });
  }

  save(1, "Array Sorted!", { max: maxVal, min: minVal });

  return steps;
}

const CodeLines = [
  // 1
  <>
    <span className="cts-type">void</span> countSort
    <span className="cts-symbol">(</span>
    <span className="cts-type">vector</span>
    <span className="cts-symbol">&lt;</span>
    <span className="cts-type">int</span>
    <span className="cts-symbol">&gt;&amp;</span> arr
    <span className="cts-symbol">)</span>{" "}
    <span className="cts-symbol">{"{"}</span>
  </>,

  // 2
  <>
    &nbsp;&nbsp;
    <span className="cts-type">int</span> n
    <span className="cts-symbol"> = </span>
    arr<span className="cts-symbol">.</span>size
    <span className="cts-symbol">();</span>
  </>,

  // 3
  <>
    &nbsp;&nbsp;
    <span className="cts-type">int</span> maxVal
    <span className="cts-symbol"> = *</span>
    max_element<span className="cts-symbol">(</span>
    arr<span className="cts-symbol">.</span>begin<span className="cts-symbol">(),</span> arr<span className="cts-symbol">.</span>end<span className="cts-symbol">());</span>
  </>,

  // 4
  <>
    &nbsp;&nbsp;
    <span className="cts-type">int</span> minVal
    <span className="cts-symbol"> = *</span>
    min_element<span className="cts-symbol">(</span>
    arr<span className="cts-symbol">.</span>begin<span className="cts-symbol">(),</span> arr<span className="cts-symbol">.</span>end<span className="cts-symbol">());</span>
  </>,

  // 5
  <>
    &nbsp;&nbsp;
    <span className="cts-type">int</span> range
    <span className="cts-symbol"> = </span>
    maxVal <span className="cts-symbol">-</span> minVal <span className="cts-symbol">+</span> <span className="cts-number">1</span>
    <span className="cts-symbol">;</span>
  </>,

  // 6
  <>&nbsp;</>,

  // 7
  <>
    &nbsp;&nbsp;
    <span className="cts-type">vector</span>
    <span className="cts-symbol">&lt;</span>
    <span className="cts-type">int</span>
    <span className="cts-symbol">&gt;</span> count
    <span className="cts-symbol">(</span>range<span className="cts-symbol">,</span> <span className="cts-number">0</span>
    <span className="cts-symbol">);</span>
  </>,

  // 8
  <>
    &nbsp;&nbsp;
    <span className="cts-type">vector</span>
    <span className="cts-symbol">&lt;</span>
    <span className="cts-type">int</span>
    <span className="cts-symbol">&gt;</span> output
    <span className="cts-symbol">(</span>n
    <span className="cts-symbol">);</span>
  </>,

  // 9
  <>&nbsp;</>,

  // 10
  <>
    &nbsp;&nbsp;
    <span className="cts-keyword">for</span>
    <span className="cts-symbol">(</span>
    <span className="cts-type">int</span> i
    <span className="cts-symbol"> = </span>
    <span className="cts-number">0</span>
    <span className="cts-symbol">;</span> i
    <span className="cts-symbol"> &lt; </span>n
    <span className="cts-symbol">;</span> i
    <span className="cts-symbol">++</span>
    <span className="cts-symbol">)</span>
  </>,

  // 11
  <>
    &nbsp;&nbsp;&nbsp;&nbsp;
    count<span className="cts-symbol">[</span>
    arr<span className="cts-symbol">[</span>i<span className="cts-symbol">]</span>
    <span className="cts-symbol"> - </span>minVal
    <span className="cts-symbol">]++;</span>
  </>,

  // 12
  <>&nbsp;</>,

  // 13
  <>
    &nbsp;&nbsp;
    <span className="cts-keyword">for</span>
    <span className="cts-symbol">(</span>
    <span className="cts-type">int</span> i
    <span className="cts-symbol"> = </span>
    <span className="cts-number">1</span>
    <span className="cts-symbol">;</span> i
    <span className="cts-symbol"> &lt; </span>range
    <span className="cts-symbol">;</span> i
    <span className="cts-symbol">++</span>
    <span className="cts-symbol">)</span>
  </>,

  // 14
  <>
    &nbsp;&nbsp;&nbsp;&nbsp;
    count<span className="cts-symbol">[</span>i
    <span className="cts-symbol">] += </span>
    count<span className="cts-symbol">[</span>i
    <span className="cts-symbol"> - </span>
    <span className="cts-number">1</span>
    <span className="cts-symbol">];</span>
  </>,

  // 15
  <>&nbsp;</>,

  // 16
  <>
    &nbsp;&nbsp;
    <span className="cts-keyword">for</span>
    <span className="cts-symbol">(</span>
    <span className="cts-type">int</span> i
    <span className="cts-symbol"> = </span>
    n<span className="cts-symbol"> - </span>
    <span className="cts-number">1</span>
    <span className="cts-symbol">;</span> i
    <span className="cts-symbol"> &gt;= </span>
    <span className="cts-number">0</span>
    <span className="cts-symbol">;</span> i
    <span className="cts-symbol">--</span>
    <span className="cts-symbol">)</span>{" "}
    <span className="cts-symbol">{"{"}</span>
  </>,

  // 17
  <>
    &nbsp;&nbsp;&nbsp;&nbsp;
    output<span className="cts-symbol">[</span>
    count<span className="cts-symbol">[</span>
    arr<span className="cts-symbol">[</span>i<span className="cts-symbol">]</span>
    <span className="cts-symbol"> - </span>minVal
    <span className="cts-symbol">] - </span>
    <span className="cts-number">1</span>
    <span className="cts-symbol">] = </span>
    arr<span className="cts-symbol">[</span>i
    <span className="cts-symbol">];</span>
  </>,

  // 18
  <>
    &nbsp;&nbsp;&nbsp;&nbsp;
    count<span className="cts-symbol">[</span>
    arr<span className="cts-symbol">[</span>i<span className="cts-symbol">]</span>
    <span className="cts-symbol"> - </span>minVal
    <span className="cts-symbol">]--;</span>
  </>,

  // 19
  <>
    &nbsp;&nbsp;
    <span className="cts-symbol">{"}"}</span>
  </>,

  // 20
  <>&nbsp;</>,

  // 21
  <>
    &nbsp;&nbsp;
    <span className="cts-keyword">for</span>
    <span className="cts-symbol">(</span>
    <span className="cts-type">int</span> i
    <span className="cts-symbol"> = </span>
    <span className="cts-number">0</span>
    <span className="cts-symbol">;</span> i
    <span className="cts-symbol"> &lt; </span>n
    <span className="cts-symbol">;</span> i
    <span className="cts-symbol">++</span>
    <span className="cts-symbol">)</span>
  </>,

  // 22
  <>
    &nbsp;&nbsp;&nbsp;&nbsp;
    arr<span className="cts-symbol">[</span>i
    <span className="cts-symbol">] = </span>
    output<span className="cts-symbol">[</span>i
    <span className="cts-symbol">];</span>
  </>,

  // 23
  <>
    <span className="cts-symbol">{"}"}</span>
  </>,
];

const CELL_W = 46;
const CELL_H = 46;
const ROW_GAP = 74;
const PAD_TOP = 36;

const CountSort = () => {
  const [seed, setSeed] = useState(randomArray());

  const steps = countSortSteps(seed);
  const { index, playing, speed, setSpeed, reset, stepForward, stepBack, togglePlay } = usePlayback(steps.length);
  const current = steps[index];
  const isDone = index === steps.length - 1;
  const n = current.array.length;
  const range = current.min !== null ? current.max - current.min + 1 : 1;

  const counts = current.counts ?? new Array(range).fill(0);
  const output = current.output ?? new Array(n).fill(null);

  const gridCols = Math.max(n, range);
  const svgWidth = gridCols * CELL_W;
  const svgHeight = PAD_TOP + CELL_H + ROW_GAP + CELL_H + ROW_GAP + CELL_H + 10;

  const arrayRowY = PAD_TOP;
  const countRowY = arrayRowY + CELL_H + ROW_GAP;
  const outputRowY = countRowY + CELL_H + ROW_GAP;

  const countW = (gridCols * CELL_W) / Math.max(range, 1);

  const arrayPointerX =
    current.activeIndex !== -1
      ? current.activeIndex * CELL_W + CELL_W / 2
      : null;

  const outputTargetIndex =
    current.outputIndex !== -1
      ? current.outputIndex
      : current.codeLine === 22
        ? current.activeIndex
        : -1;

  const outputPointerX =
    outputTargetIndex !== -1 ? outputTargetIndex * CELL_W + CELL_W / 2 : null;

  let marker = null;

  if (current.activeIndex !== -1 && current.min !== null) {
    const sourceX = current.activeIndex * CELL_W + CELL_W / 2;
    const sourceY = arrayRowY + CELL_H / 2;
    const value = current.array[current.activeIndex];

    if (current.codeLine === 10) {
      marker = { x: sourceX, y: sourceY, value, color: "#ff6a3d", visible: false };
    } else if (current.codeLine === 11 && current.offset !== -1) {
      marker = {
        x: current.offset * countW + countW / 2,
        y: countRowY + CELL_H / 2,
        value,
        color: "#ff6a3d",
        visible: true,
      };
    } else if (current.codeLine === 16) {
      marker = { x: sourceX, y: sourceY, value, color: "#b4ff39", visible: false };
    } else if (current.codeLine === 17 && current.outputIndex !== -1) {
      marker = {
        x: current.outputIndex * CELL_W + CELL_W / 2,
        y: outputRowY + CELL_H / 2,
        value,
        color: "#b4ff39",
        visible: true,
      };
    } else if (current.codeLine === 18) {
      marker = {
        x: current.outputIndex * CELL_W + CELL_W / 2,
        y: outputRowY + CELL_H / 2,
        value,
        color: "#b4ff39",
        visible: false,
      };
    }
  }

  const shuffle = () => {
    setSeed(randomArray());
    reset();
  };

  return (
    <div className="count-sort-wrapper">
      <div className="count-sort">
        <p className="cts-eyebrow">sorting</p>

        <h1 className="cts-title">Count Sort</h1>

        <div className="cts-header">
          <p className="cts-blurb">
            Counts occurrences of each value, then uses prefix sums to place every element directly into its sorted position.
          </p>

          <div className="cts-complexity">
            <div>
              <div className="cts-complexity-label">time</div>
              <div className="cts-time-value">O(n + k)</div>
            </div>

            <div>
              <div className="cts-complexity-label">space</div>
              <div className="cts-space-value">O(n + k)</div>
            </div>
          </div>
        </div>

        <div className="cts-grid">
          <div className="cts-stage">
            <div className="cts-stage-wrap">
              <svg
                className="cts-stage-svg"
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                width={svgWidth}
                height={svgHeight}
              >
                {current.array.map((val, idx) => {
                  const isActive = idx === current.activeIndex;

                  return (
                    <g key={`arr-${idx}`}>
                      <rect
                        className="cts-cell-rect"
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
                        className="cts-cell-value"
                        fill={isDone ? "#b4ff39" : isActive ? "#ff6a3d" : "#f3f2ed"}
                      >
                        {val}
                      </text>

                      {isActive && current.offset !== -1 && (
                        <text
                          x={idx * CELL_W + CELL_W / 2}
                          y={arrayRowY - 14}
                          textAnchor="middle"
                          className="cts-offset-badge"
                        >
                          count[{current.offset}]
                        </text>
                      )}
                    </g>
                  );
                })}

                {counts.map((count, i) => {
                  const isActive = i === current.offset;
                  const label = current.min !== null ? current.min + i : i;

                  return (
                    <g key={`count-${i}`}>
                      <rect
                        className="cts-cell-rect"
                        x={i * countW}
                        y={countRowY}
                        width={countW}
                        height={CELL_H}
                        rx="8"
                        fill="transparent"
                        stroke={isActive ? "#ff6a3d" : "#33333a"}
                        strokeWidth={isActive ? 2 : 1.4}
                      />

                      <text
                        x={i * countW + countW / 2}
                        y={countRowY - 14}
                        textAnchor="middle"
                        className="cts-bucket-label"
                      >
                        {label}
                      </text>

                      <text
                        x={i * countW + countW / 2}
                        y={countRowY + CELL_H / 2 + 5}
                        textAnchor="middle"
                        className="cts-cell-value"
                        fill={isActive ? "#ff6a3d" : "#7c8cff"}
                      >
                        {count}
                      </text>
                    </g>
                  );
                })}

                {output.map((val, idx) => {
                  const isTarget = idx === current.outputIndex;
                  const isPlaced = val !== null && val !== undefined;

                  return (
                    <g key={`out-${idx}`}>
                      <rect
                        className="cts-cell-rect"
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
                        className="cts-cell-value"
                        fill={isPlaced ? "#b4ff39" : "#4a4a4f"}
                      >
                        {isPlaced ? val : "·"}
                      </text>
                    </g>
                  );
                })}

                {arrayPointerX !== null && (
                  <polygon
                    className="cts-pointer"
                    style={{
                      transform: `translate(${arrayPointerX}px, ${arrayRowY + CELL_H + 12}px)`,
                    }}
                    points="0,-7 -6,4 6,4"
                    fill="#ff6a3d"
                  />
                )}

                {outputPointerX !== null && (
                  <polygon
                    className="cts-pointer"
                    style={{
                      transform: `translate(${outputPointerX}px, ${outputRowY - 12}px)`,
                    }}
                    points="0,7 -6,-4 6,-4"
                    fill="#b4ff39"
                  />
                )}

                {marker && (
                  <g
                    className="cts-marker"
                    style={{
                      transform: `translate(${marker.x}px, ${marker.y}px)`,
                      opacity: marker.visible ? 1 : 0,
                    }}
                  >
                    <circle r="13" fill="#0a0a0b" stroke={marker.color} strokeWidth="2" />
                    <text
                      textAnchor="middle"
                      dy="5"
                      className="cts-marker-value"
                      fill={marker.color}
                    >
                      {marker.value}
                    </text>
                  </g>
                )}
              </svg>
            </div>

            <p className="cts-status">{current.description}</p>
          </div>

          <div className="cts-code-panel">
            <div className="cts-code-header">
              <div className="cts-dummy-btns">
                <span className="cts-red-btn"></span>
                <span className="cts-yellow-btn"></span>
                <span className="cts-green-btn"></span>
                <span className="cts-filename">count_sort.cpp</span>
              </div>

              <span className="cts-header-complexity">O(n + k)</span>
            </div>

            <pre className="cts-code-block">
              {
                CodeLines.map((line, i) => {
                  return (
                    <div
                      key={i}
                      className={`cts-code-line ${current.codeLine === i + 1 ? "cts-code-line-active" : ""}`}
                    >
                      <span className="cts-line-no">{i + 1}</span>
                      {line}
                    </div>
                  );
                })
              }
            </pre>
          </div>
        </div>

        <div className="cts-controls">
          <button className="cts-icon-btn" onClick={reset}>
            <ResetIcon />
          </button>

          <button
            className="cts-icon-btn"
            onClick={stepBack}
            disabled={index === 0}
          >
            <StepBackIcon />
          </button>

          <button className="cts-play-btn" onClick={togglePlay}>
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>

          <button
            className="cts-icon-btn"
            onClick={stepForward}
            disabled={index === steps.length - 1}
          >
            <StepForwardIcon />
          </button>

          <button className="cts-shuffle-btn" onClick={shuffle}>
            <ShuffleIcon />
            Shuffle
          </button>

          <div className="cts-speed">
            <span>SPEED</span>

            <input
              type="range"
              min="1"
              max="10"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
          </div>

          <span className="cts-steps">
            {index + 1} / {steps.length}
          </span>
        </div>

        <div className="cts-stats">
          <span>
            increments: <b>{current.increments}</b>
          </span>

          <span>
            placements: <b>{current.placements}</b>
          </span>
        </div>
      </div>
    </div>
  );
};

export default CountSort;
