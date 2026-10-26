import { useState } from "react";
import { motion } from "framer-motion";
import { randomArray } from "../../../shared/randomArray";
import { usePlayback } from "../../../shared/usePlayback";
import { ResetIcon, StepBackIcon, PlayIcon, PauseIcon, StepForwardIcon, ShuffleIcon } from "../../../shared/icons";
import "./SelectionSort.css";

function selectionSortSteps(input) {
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

  save(1, "Started Selection Sort", [], 0);

  for (let i = 0; i < n - 1; i++) {

    let min = i;

    for (let j = i + 1; j < n; j++) {

      comparisons++;
      save(5, `Compare ${min} and ${j}`, [min, j], i);

      if (arr[j] < arr[min]) {
        min = j;
        save(7, `New minimum at index ${min}`, [min], i);
      }
    }

    if (min !== i) {
      [arr[i], arr[min]] = [arr[min], arr[i]];
      swaps++;

      save(9, `Swap ${i} and ${min}`, [i, min], i);
    }
    else {
      save(9, "No swap needed", [i], i);
    }

    save(10, `Index ${i} sorted`, [], i + 1);
  }

  save(11, "Array Sorted!", [], n);

  return steps;
}

const CodeLines = [
  <>
    <span className="sss-type">void</span> selectionSort<span className="sss-symbol">(</span><span className="sss-type">vector</span><span className="sss-symbol">&lt;</span><span className="sss-type">int</span><span className="sss-symbol">&gt;&amp;</span> arr<span className="sss-symbol">)</span> <span className="sss-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="sss-type">int</span> n <span className="sss-symbol">=</span> arr<span className="sss-symbol">.</span>size<span className="sss-symbol">()</span><span className="sss-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="sss-keyword">for</span> <span className="sss-symbol">(</span>
    <span className="sss-type">int</span> i <span className="sss-symbol">=</span> <span className="sss-number">0</span><span className="sss-symbol">;</span>
    {" "}i <span className="sss-symbol">{"<"}</span> n <span className="sss-symbol">-</span> <span className="sss-number">1</span><span className="sss-symbol">;</span>
    {" "}i<span className="sss-symbol">++</span><span className="sss-symbol">)</span> <span className="sss-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;<span className="sss-type">int</span> min <span className="sss-symbol">=</span> i<span className="sss-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;<span className="sss-keyword">for</span> <span className="sss-symbol">(</span>
    <span className="sss-type">int</span> j <span className="sss-symbol">=</span> i <span className="sss-symbol">+</span> <span className="sss-number">1</span><span className="sss-symbol">;</span>
    {" "}j <span className="sss-symbol">{"<"}</span> n<span className="sss-symbol">;</span>
    {" "}j<span className="sss-symbol">++</span><span className="sss-symbol">)</span> <span className="sss-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    <span className="sss-keyword">if</span> <span className="sss-symbol">(</span>arr<span className="sss-symbol">[</span>j<span className="sss-symbol">]</span> <span className="sss-symbol">{"<"}</span> arr<span className="sss-symbol">[</span>min<span className="sss-symbol">]</span><span className="sss-symbol">)</span> <span className="sss-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    min <span className="sss-symbol">=</span> j<span className="sss-symbol">;</span>
  </>,

  <>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="sss-symbol">{"}"}</span></>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;
    swap<span className="sss-symbol">(</span>arr<span className="sss-symbol">[</span>i<span className="sss-symbol">]</span><span className="sss-symbol">,</span> arr<span className="sss-symbol">[</span>min<span className="sss-symbol">]</span><span className="sss-symbol">)</span><span className="sss-symbol">;</span>
  </>,

  <>&nbsp;&nbsp;&nbsp;&nbsp;<span className="sss-symbol">{"}"}</span></>,

  <>
    &nbsp;&nbsp;<span className="sss-keyword">return</span><span className="sss-symbol">;</span>
  </>,

  <><span className="sss-symbol">{"}"}</span></>,
];

const SelectionSort = () => {
  const [seed, setSeed] = useState(randomArray());

  const steps = selectionSortSteps(seed);
  const { index, playing, speed, setSpeed, reset, stepForward, stepBack, togglePlay } = usePlayback(steps.length);
  const current = steps[index];
  const max = Math.max(...current.array);

  const shuffle = () => {
    setSeed(randomArray());
    reset();
  };

  return (
    <div className="selection-sort-wrapper">
      <div className="selection-sort">
        <p className="sss-eyebrow">sorting</p>

        <h1 className="sss-title">Selection Sort</h1>

        <div className="sss-header">
          <p className="sss-blurb">
            Repeatedly selects the minimum of the unsorted tail.
          </p>

          <div className="sss-complexity">
            <div>
              <div className="sss-complexity-label">time</div>
              <div className="sss-time-value">O(n²)</div>
            </div>

            <div>
              <div className="sss-complexity-label">space</div>
              <div className="sss-space-value">O(1)</div>
            </div>
          </div>
        </div>

        <div className="sss-grid">
          <div className="sss-stage">
            <div className="sss-bars">
              {current.array.map((value, i) => {
                const isSorted = i < current.sortedFrom;
                const isCompare = current.compare.includes(i);

                let color = "#3a3a3f";

                if (isSorted) color = "#b4ff39";
                else if (isCompare) color = "#ff6a3d";

                return (
                  <motion.div
                    key={i}
                    className="sss-bar"
                    style={{
                      height: `${(value / max) * 230 + 6}px`,
                      backgroundColor: color,
                    }}
                  />
                );
              })}
            </div>

            <p className="sss-status">{current.description}</p>
          </div>

          <div className="sss-code-panel">
            <div className="sss-code-header">
              <div className="sss-dummy-btns">
                <span className="sss-red-btn"></span>
                <span className="sss-yellow-btn"></span>
                <span className="sss-green-btn"></span>
                <span className="sss-filename">selection_sort.cpp</span>
              </div>

              <span className="sss-header-complexity">O(n²)</span>
            </div>

            <pre className="sss-code-block">
              {
                CodeLines.map((line, i) => {
                  return (
                    <div
                      key={i}
                      className={`sss-code-line ${current.codeLine === i + 1 ? "sss-code-line-active" : ""}`}
                    >
                      <span className="sss-line-no">{i + 1}</span>
                      {line}
                    </div>
                  );
                })
              }
            </pre>
          </div>
        </div>

        <div className="sss-controls">
          <button className="sss-icon-btn" onClick={reset}>
            <ResetIcon />
          </button>

          <button
            className="sss-icon-btn"
            onClick={stepBack}
            disabled={index === 0}
          >
            <StepBackIcon />
          </button>

          <button className="sss-play-btn" onClick={togglePlay}>
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>

          <button
            className="sss-icon-btn"
            onClick={stepForward}
            disabled={index === steps.length - 1}
          >
            <StepForwardIcon />
          </button>

          <button className="sss-shuffle-btn" onClick={shuffle}>
            <ShuffleIcon />
            Shuffle
          </button>

          <div className="sss-speed">
            <span>SPEED</span>

            <input
              type="range"
              min="1"
              max="10"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
          </div>

          <span className="sss-steps">
            {index + 1} / {steps.length}
          </span>
        </div>

        <div className="sss-stats">
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

export default SelectionSort;
