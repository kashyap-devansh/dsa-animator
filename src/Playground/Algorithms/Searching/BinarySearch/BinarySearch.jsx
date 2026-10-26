import { useState } from "react";
import { motion } from "framer-motion";
import { randomArray } from "../../../shared/randomArray";
import { usePlayback } from "../../../shared/usePlayback";
import { ResetIcon, StepBackIcon, PlayIcon, PauseIcon, StepForwardIcon, ShuffleIcon } from "../../../shared/icons";
import "./BinarySearch.css";

function binarySearchSteps(input, target) {
  const arr = [...input].sort((a, b) => a - b);
  const steps = [];
  let comparisons = 0;

  function save(line, description, currentIndex = -1, left = -1, right = -1, found = false) {
    steps.push({
      array: [...arr],
      codeLine: line,
      description,
      currentIndex,
      left,
      right,
      target,
      found,
      comparisons,
    });
  }

  let left = 0;
  let right = arr.length - 1;

  save(1, `Search for ${target}`, -1, left, right);

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);

    comparisons++;
    save(4, `Check midpoint index ${mid} (value ${arr[mid]})`, mid, left, right);

    if (arr[mid] === target) {
      save(6, `Found ${target} at index ${mid}`, mid, left, right, true);
      return steps;
    }

    if (arr[mid] < target) {
      left = mid + 1;
      save(8, `${arr[mid]} < ${target} — search right half`, mid, left, right);
    }
    else {
      right = mid - 1;
      save(10, `${arr[mid]} > ${target} — search left half`, mid, left, right);
    }
  }

  save(13, `${target} not found`, -1, left, right);

  return steps;
}

const CodeLines = [
  <>
    <span className="bis-type">int</span> binarySearch
    <span className="bis-symbol">(</span><span className="bis-type">vector</span><span className="bis-symbol">&lt;</span><span className="bis-type">int</span><span className="bis-symbol">&gt;&amp;</span> arr<span className="bis-symbol">,</span> <span className="bis-type">int</span> target<span className="bis-symbol">)</span> <span className="bis-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="bis-type">int</span> left <span className="bis-symbol">=</span> <span className="bis-number">0</span><span className="bis-symbol">,</span> right <span className="bis-symbol">=</span> arr<span className="bis-symbol">.</span>size<span className="bis-symbol">()</span> <span className="bis-symbol">-</span> <span className="bis-number">1</span><span className="bis-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="bis-keyword">while</span> <span className="bis-symbol">(</span>left <span className="bis-symbol">&lt;=</span> right<span className="bis-symbol">)</span> <span className="bis-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;<span className="bis-type">int</span> mid <span className="bis-symbol">=</span> left <span className="bis-symbol">+</span> <span className="bis-symbol">(</span>right <span className="bis-symbol">-</span> left<span className="bis-symbol">)</span> <span className="bis-symbol">/</span> <span className="bis-number">2</span><span className="bis-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;<span className="bis-keyword">if</span> <span className="bis-symbol">(</span>arr<span className="bis-symbol">[</span>mid<span className="bis-symbol">]</span> <span className="bis-symbol">==</span> target<span className="bis-symbol">)</span> <span className="bis-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="bis-keyword">return</span> mid<span className="bis-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;<span className="bis-symbol">{"}"}</span> <span className="bis-keyword">else if</span> <span className="bis-symbol">(</span>arr<span className="bis-symbol">[</span>mid<span className="bis-symbol">]</span> <span className="bis-symbol">&lt;</span> target<span className="bis-symbol">)</span> <span className="bis-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;left <span className="bis-symbol">=</span> mid <span className="bis-symbol">+</span> <span className="bis-number">1</span><span className="bis-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;<span className="bis-symbol">{"}"}</span> <span className="bis-keyword">else</span> <span className="bis-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;right <span className="bis-symbol">=</span> mid <span className="bis-symbol">-</span> <span className="bis-number">1</span><span className="bis-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;<span className="bis-symbol">{"}"}</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="bis-symbol">{"}"}</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="bis-keyword">return</span> <span className="bis-symbol">-</span><span className="bis-number">1</span><span className="bis-symbol">;</span>
  </>,

  <>
    <span className="bis-symbol">{"}"}</span>
  </>,
];

const BinarySearch = () => {
  const [seed, setSeed] = useState(randomArray());
  const [target, setTarget] = useState(seed[Math.floor(Math.random() * seed.length)]);

  const steps = binarySearchSteps(seed, target);
  const { index, playing, speed, setSpeed, reset, stepForward, stepBack, togglePlay } = usePlayback(steps.length);
  const current = steps[index];

  const shuffle = () => {
    const newSeed = randomArray().sort((a, b) => a - b);

    setSeed(newSeed);
    setTarget(newSeed[Math.floor(Math.random() * newSeed.length)]);
    reset();
  };

  return (
    <div className="binary-search-wrapper">
      <div className="binary-search">
        <p className="bis-eyebrow">searching</p>

        <h1 className="bis-title">Binary Search</h1>

        <div className="bis-header">
          <p className="bis-blurb">
            Halves the search range every step on a sorted array.
          </p>

          <div className="bis-complexity">
            <div>
              <div className="bis-complexity-label">time</div>
              <div className="bis-time-value">O(log n)</div>
            </div>

            <div>
              <div className="bis-complexity-label">space</div>
              <div className="bis-space-value">O(1)</div>
            </div>
          </div>
        </div>

        <div className="bis-grid">
          <div className="bis-stage">
            <div className="bis-boxs">
              {current.array.map((value, i) => {
                const isCurrent = i === current.currentIndex;
                const isFound = current.found && isCurrent;

                return (
                  <div key={i} className="bis-box-wrapper">
                    <div className="bis-index">{i}</div>

                    <motion.div
                      className={`bis-box ${i < current.left || i > current.right ? "dull-box" : ""}`}
                      animate={{
                        borderColor: isFound ? "#b4ff39" : isCurrent ? "#ff6a3d" : "#262629",
                        color: isFound ? "#b4ff39" : isCurrent ? "#ff6a3d" : "#f3f2ed",
                      }}
                    >
                      {value}
                    </motion.div>
                  </div>
                );
              })}
            </div>
            <p className="bis-status">{current.description}</p>
          </div>

          <div className="bis-code-panel">
            <div className="bis-code-header">
              <div className="bis-dummy-btns">
                <span className="bis-red-btn"></span>
                <span className="bis-yellow-btn"></span>
                <span className="bis-green-btn"></span>
                <span className="bis-filename">binarySearch.cpp</span>
              </div>

              <span className="bis-header-complexity">O(log n)</span>
            </div>

            <pre className="bis-code-block">
              {CodeLines.map((line, i) => {
                return (
                  <div
                    key={i}
                    className={`bis-code-line ${current.codeLine === i + 1 ? "bis-code-line-active" : ""}`}
                  >
                    <span className="bis-line-no">{i + 1}</span>
                    {line}
                  </div>
                );
              })}
            </pre>
          </div>
        </div>

        <div className="bis-controls">
          <button className="bis-icon-btn" onClick={reset}>
            <ResetIcon />
          </button>

          <button
            className="bis-icon-btn"
            onClick={stepBack}
            disabled={index === 0}
          >
            <StepBackIcon />
          </button>

          <button className="bis-play-btn" onClick={togglePlay}>
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>

          <button
            className="bis-icon-btn"
            onClick={stepForward}
            disabled={index === steps.length - 1}
          >
            <StepForwardIcon />
          </button>

          <button className="bis-shuffle-btn" onClick={shuffle}>
            <ShuffleIcon />
            New array
          </button>

          <input
            className="bis-input"
            type="number"
            value={target}
            onChange={(e) => {
              setTarget(Number(e.target.value))
              reset();
            }}
          />

          <div className="bis-speed">
            <span>SPEED</span>

            <input
              type="range"
              min="1"
              max="10"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
          </div>

          <span className="bis-steps">
            {index + 1} / {steps.length}
          </span>
        </div>

        <div className="bis-stats">
          <span>
            comparisons: <b>{current.comparisons}</b>
          </span>

          <span>
            target: <b>{target}</b>
          </span>
        </div>
      </div>
    </div>
  );
};

export default BinarySearch;
