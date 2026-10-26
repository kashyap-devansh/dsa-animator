import { useState } from "react";
import { motion } from "framer-motion";
import { randomArray } from "../../../shared/randomArray";
import { usePlayback } from "../../../shared/usePlayback";
import { ResetIcon, StepBackIcon, PlayIcon, PauseIcon, StepForwardIcon, ShuffleIcon } from "../../../shared/icons";
import "./InsertionSort.css";

function insertionSortSteps(input) {
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

  save(1, "Started Insertion Sort", [], 1);

  for (let i = 1; i < n; i++) {

    let key = arr[i];
    let j = i - 1;

    save(4, `Select key ${key}`, [i], i);

    while (j >= 0) {

      comparisons++;
      save(6, `Compare ${j} and key`, [j, j + 1], i);

      if (arr[j] > key) {

        arr[j + 1] = arr[j];
        swaps++;

        save(7, `Shift ${j} to ${j + 1}`, [j, j + 1], i);

        j--;
      }
      else {
        break;
      }
    }

    arr[j + 1] = key;

    save(10, `Insert key at ${j + 1}`, [j + 1], i + 1);
  }

  save(12, "Array Sorted!", [], n);

  return steps;
}

const CodeLines = [
  <>
    <span className="is-type">void</span> insertionSort<span className="is-symbol">(</span><span className="is-type">vector</span><span className="is-symbol">&lt;</span><span className="is-type">int</span><span className="is-symbol">&gt;&amp;</span> arr<span className="is-symbol">)</span> <span className="is-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="is-type">int</span> n <span className="is-symbol">=</span> arr<span className="is-symbol">.</span>size<span className="is-symbol">()</span><span className="is-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="is-keyword">for</span> <span className="is-symbol">(</span>
    <span className="is-type">int</span> i <span className="is-symbol">=</span> <span className="is-number">1</span><span className="is-symbol">;</span>
    {" "}i <span className="is-symbol">{"<"}</span> n<span className="is-symbol">;</span>
    {" "}i<span className="is-symbol">++</span><span className="is-symbol">)</span> <span className="is-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;<span className="is-type">int</span> key <span className="is-symbol">=</span> arr<span className="is-symbol">[</span>i<span className="is-symbol">]</span><span className="is-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;<span className="is-type">int</span> j <span className="is-symbol">=</span> i <span className="is-symbol">-</span> <span className="is-number">1</span><span className="is-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;<span className="is-keyword">while</span> <span className="is-symbol">(</span>j <span className="is-symbol">{">="}</span> <span className="is-number">0</span> <span className="is-symbol">&&</span> arr<span className="is-symbol">[</span>j<span className="is-symbol">]</span> <span className="is-symbol">{">"}</span> key<span className="is-symbol">)</span> <span className="is-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;arr<span className="is-symbol">[</span>j <span className="is-symbol">+</span> <span className="is-number">1</span><span className="is-symbol">]</span> <span className="is-symbol">=</span> arr<span className="is-symbol">[</span>j<span className="is-symbol">]</span><span className="is-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;j<span className="is-symbol">--</span><span className="is-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;<span className="is-symbol">{"}"}</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;arr<span className="is-symbol">[</span>j <span className="is-symbol">+</span> <span className="is-number">1</span><span className="is-symbol">]</span> <span className="is-symbol">=</span> key<span className="is-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="is-symbol">{"}"}</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="is-keyword">return</span><span className="is-symbol">;</span>
  </>,

  <>
    <span className="is-symbol">{"}"}</span>
  </>,
];

const InsertionSort = () => {
  const [seed, setSeed] = useState(randomArray());

  const steps = insertionSortSteps(seed);
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
        <p className="is-eyebrow">sorting</p>

        <h1 className="is-title">Insertion Sort</h1>

        <div className="is-header">
          <p className="is-blurb">
            Grows a sorted prefix by inserting each element into place.
          </p>

          <div className="is-complexity">
            <div>
              <div className="is-complexity-label">time</div>
              <div className="is-time-value">O(n²)</div>
            </div>

            <div>
              <div className="is-complexity-label">space</div>
              <div className="is-space-value">O(1)</div>
            </div>
          </div>
        </div>

        <div className="is-grid">
          <div className="is-stage">
            <div className="is-bars">
              {current.array.map((value, i) => {
                const isSorted = i < current.sortedFrom;
                const isCompare = current.compare.includes(i);

                let color = "#3a3a3f";

                if (isSorted) color = "#b4ff39";
                else if (isCompare) color = "#ff6a3d";

                return (
                  <motion.div
                    key={i}
                    className="is-bar"
                    style={{
                      height: `${(value / max) * 230 + 6}px`,
                      backgroundColor: color,
                    }}
                  />
                );
              })}
            </div>

            <p className="is-status">{current.description}</p>
          </div>

          <div className="is-code-panel">
            <div className="is-code-header">
              <div className="is-dummy-btns">
                <span className="is-red-btn"></span>
                <span className="is-yellow-btn"></span>
                <span className="is-green-btn"></span>
                <span className="is-filename">insertion_sort.cpp</span>
              </div>

              <span className="is-header-complexity">O(n²)</span>
            </div>

            <pre className="is-code-block">
              {CodeLines.map((line, i) => {
                return (
                  <div
                    key={i}
                    className={`is-code-line ${current.codeLine === i + 1 ? "is-code-line-active" : ""}`}
                  >
                    <span className="is-line-no">{i + 1}</span>
                    {line}
                  </div>
                );
              })}
            </pre>
          </div>
        </div>

        <div className="is-controls">
          <button className="is-icon-btn" onClick={reset}>
            <ResetIcon />
          </button>

          <button
            className="is-icon-btn"
            onClick={stepBack}
            disabled={index === 0}
          >
            <StepBackIcon />
          </button>

          <button className="is-play-btn" onClick={togglePlay}>
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>

          <button
            className="is-icon-btn"
            onClick={stepForward}
            disabled={index === steps.length - 1}
          >
            <StepForwardIcon />
          </button>

          <button className="is-shuffle-btn" onClick={shuffle}>
            <ShuffleIcon />
            Shuffle
          </button>

          <div className="is-speed">
            <span>SPEED</span>

            <input
              type="range"
              min="1"
              max="10"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
          </div>

          <span className="is-steps">
            {index + 1} / {steps.length}
          </span>
        </div>

        <div className="is-stats">
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

export default InsertionSort;
