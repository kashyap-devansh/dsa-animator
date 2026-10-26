import { useState } from "react";
import { motion } from "framer-motion";
import { randomArray } from "../../../shared/randomArray";
import { usePlayback } from "../../../shared/usePlayback";
import { ResetIcon, StepBackIcon, PlayIcon, PauseIcon, StepForwardIcon, ShuffleIcon } from "../../../shared/icons";
import "./BubbleSort.css";

function bubbleSortSteps(input) {
  const arr = [...input];
  const steps = [];
  const n = arr.length;

  let comparisons = 0;
  let swaps = 0;

  function save(line, description, compare, sortedFrom) {
    steps.push({
      array: [...arr],
      codeLine: line,
      description,
      compare,
      sortedFrom,
      swaps,
      comparisons,
    });
  }

  save(1, "Started Bubble Sort", [], n);

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      comparisons++;
      save(4, `Compare ${j} and ${j + 1}`, [j, j + 1], n - i);

      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];

        swaps++;
        save(6, `Swap ${j} and ${j + 1}`, [j, j + 1], n - i);
      }
    }

    save(2, `Index ${n - 1 - i} sorted`, [], n - i - 1);
  }

  save(10, "Array Sorted!", [], 0);

  return steps;
}

const CodeLines = [
  <>
    <span className="bs-type">void</span> bubbleSort<span className="bs-symbol">(</span><span className="bs-type">vector</span><span className="bs-symbol">&lt;</span><span className="bs-type">int</span><span className="bs-symbol">&gt;&amp;</span> arr<span className="bs-symbol">)</span> <span className="bs-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="bs-type">int</span> n <span className="bs-symbol">=</span> arr<span className="bs-symbol">.</span>size<span className="bs-symbol">()</span><span className="bs-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="bs-keyword">for</span> <span className="bs-symbol">(</span>
    <span className="bs-type">int</span> i <span className="bs-symbol">=</span> <span className="bs-number">0</span><span className="bs-symbol">;</span>
    {" "}i <span className="bs-symbol">{"<"}</span> n <span className="bs-symbol">-</span> <span className="bs-number">1</span><span className="bs-symbol">;</span>
    {" "}i<span className="bs-symbol">++</span><span className="bs-symbol">)</span> <span className="bs-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;<span className="bs-keyword">for</span> <span className="bs-symbol">(</span>
    <span className="bs-type">int</span> j <span className="bs-symbol">=</span> <span className="bs-number">0</span><span className="bs-symbol">;</span>
    {" "}j <span className="bs-symbol">{"<"}</span> n <span className="bs-symbol">-</span> <span className="bs-number">1</span> <span className="bs-symbol">-</span> i<span className="bs-symbol">;</span>
    {" "}j<span className="bs-symbol">++</span><span className="bs-symbol">)</span> <span className="bs-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    <span className="bs-keyword">if</span> <span className="bs-symbol">(</span>arr<span className="bs-symbol">[</span>j<span className="bs-symbol">]</span> <span className="bs-symbol">{">"}</span> arr<span className="bs-symbol">[</span>j <span className="bs-symbol">+</span> <span className="bs-number">1</span><span className="bs-symbol">]</span><span className="bs-symbol">)</span> <span className="bs-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    swap<span className="bs-symbol">(</span>arr<span className="bs-symbol">[</span>j<span className="bs-symbol">]</span><span className="bs-symbol">,</span> arr<span className="bs-symbol">[</span>j <span className="bs-symbol">+</span> <span className="bs-number">1</span><span className="bs-symbol">]</span><span className="bs-symbol">)</span><span className="bs-symbol">;</span>
  </>,

  <>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="bs-symbol">{"}"}</span></>,
  <>&nbsp;&nbsp;&nbsp;&nbsp;<span className="bs-symbol">{"}"}</span></>,
  <>&nbsp;&nbsp;<span className="bs-symbol">{"}"}</span></>,

  <>
    &nbsp;&nbsp;<span className="bs-keyword">return</span><span className="bs-symbol">;</span>
  </>,

  <><span className="bs-symbol">{"}"}</span></>,
];

const BubbleSort = () => {
  const [seed, setSeed] = useState(randomArray());

  const steps = bubbleSortSteps(seed);
  const { index, playing, speed, setSpeed, reset, stepForward, stepBack, togglePlay } = usePlayback(steps.length);
  const current = steps[index];
  const max = Math.max(...current.array);

  const shuffle = () => {
    setSeed(randomArray());
    reset();
  };

  return (
    <div className="bubble-sort-wrapper">
      <div className="bubble-sort">
        <p className="bs-eyebrow">sorting</p>

        <h1 className="bs-title">Bubble Sort</h1>

        <div className="bs-header">
          <p className="bs-blurb">
            Adjacent swaps bubble the largest value to the end each pass.
          </p>

          <div className="bs-complexity">
            <div>
              <div className="bs-complexity-label">time</div>
              <div className="bs-time-value">O(n²)</div>
            </div>

            <div>
              <div className="bs-complexity-label">space</div>
              <div className="bs-space-value">O(1)</div>
            </div>
          </div>
        </div>

        <div className="bs-grid">
          <div className="bs-stage">
            <div className="bs-bars">
              {current.array.map((value, i) => {
                const isSorted = i >= current.sortedFrom;
                const isCompare = current.compare.includes(i);

                let color = "#3a3a3f";

                if (isSorted) color = "#b4ff39";
                else if (isCompare) color = "#ff6a3d";

                return (
                  <motion.div
                    key={i}
                    className="bs-bar"
                    style={{
                      height: `${(value / max) * 230 + 6}px`,
                      backgroundColor: color,
                    }}
                  />
                );
              })}
            </div>

            <p className="bs-status">{current.description}</p>
          </div>

          <div className="bs-code-panel">
            <div className="bs-code-header">
              <div className="bs-dummy-btns">
                <span className="bs-red-btn"></span>
                <span className="bs-yellow-btn"></span>
                <span className="bs-green-btn"></span>
                <span className="bs-filename">bubble_sort.cpp</span>
              </div>

              <span className="bs-header-complexity">O(n²)</span>
            </div>

            <pre className="bs-code-block">
              {CodeLines.map((line, i) => {
                return (
                  <div
                    key={i}
                    className={`bs-code-line ${current.codeLine === i + 1 ? "bs-code-line-active" : ""}`}
                  >
                    <span className="bs-line-no">{i + 1}</span>
                    {line}
                  </div>
                );
              })}
            </pre>
          </div>
        </div>

        <div className="bs-controls">
          <button className="bs-icon-btn" onClick={reset}>
            <ResetIcon />
          </button>

          <button
            className="bs-icon-btn"
            onClick={stepBack}
            disabled={index === 0}
          >
            <StepBackIcon />
          </button>

          <button className="bs-play-btn" onClick={togglePlay}>
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>

          <button
            className="bs-icon-btn"
            onClick={stepForward}
            disabled={index === steps.length - 1}
          >
            <StepForwardIcon />
          </button>

          <button className="bs-shuffle-btn" onClick={shuffle}>
            <ShuffleIcon />
            Shuffle
          </button>

          <div className="bs-speed">
            <span>SPEED</span>

            <input
              type="range"
              min="1"
              max="10"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
          </div>

          <span className="bs-steps">
            {index + 1} / {steps.length}
          </span>
        </div>

        <div className="bs-stats">
          <span>
            comparisons: <b>{current.comparisons}</b>
          </span>

          <span>
            swaps: <b>{current.swaps}</b>
          </span>
        </div>
      </div>
    </div>
  );
};

export default BubbleSort;
