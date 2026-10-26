import { useState } from "react";
import { motion } from "framer-motion";
import { randomArray } from "../../../shared/randomArray";
import { usePlayback } from "../../../shared/usePlayback";
import { ResetIcon, StepBackIcon, PlayIcon, PauseIcon, StepForwardIcon, ShuffleIcon } from "../../../shared/icons";
import "./LinearSearch.css";

function linearSearchSteps(input, target) {
  const arr = [...input];
  const steps = [];

  let comparisons = 0;

  function save(line, description, currentIndex = -1, found = false) {
    steps.push({
      array: [...arr],
      codeLine: line,
      description,
      currentIndex,
      target,
      found,
      comparisons,
    });
  }

  save(1, "Start Linear Search");

  for (let i = 0; i < arr.length; i++) {

    comparisons++;
    save(3, `Check index ${i} (value ${arr[i]})`, i);

    if (arr[i] === target) {
      save(3, `Found ${target} at index ${i}`, i, true);

      save(4, `Return index ${i}`, i, true);

      return steps;
    }
  }

  save(6, `${target} not found`);
  save(7, "Return -1");

  return steps;
}

const CodeLines = [
  <>
    <span className="ls-type">int</span> linearSearch
    <span className="ls-symbol">(</span><span className="ls-type">vector</span><span className="ls-symbol">&lt;</span><span className="ls-type">int</span><span className="ls-symbol">&gt;&amp;</span> arr<span className="ls-symbol">,</span> <span className="ls-type">int</span> target<span className="ls-symbol">)</span> <span className="ls-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="ls-keyword">for</span> <span className="ls-symbol">(</span>
    <span className="ls-type">int</span> i <span className="ls-symbol">=</span> <span className="ls-number">0</span><span className="ls-symbol">;</span>
    {" "}i <span className="ls-symbol">{"<"}</span> arr<span className="ls-symbol">.</span>size<span className="ls-symbol">()</span><span className="ls-symbol">;</span>
    {" "}i<span className="ls-symbol">++</span><span className="ls-symbol">)</span> <span className="ls-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;
    <span className="ls-keyword">if</span> <span className="ls-symbol">(</span>
    arr<span className="ls-symbol">[</span>i<span className="ls-symbol">]</span>
    <span className="ls-symbol"> == </span>
    target
    <span className="ls-symbol">)</span> <span className="ls-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    <span className="ls-keyword">return</span> i<span className="ls-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;
    <span className="ls-symbol">{"}"}</span>
  </>,

  <>
    &nbsp;&nbsp;
    <span className="ls-symbol">{"}"}</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="ls-keyword">return</span> <span className="ls-symbol">-</span><span className="ls-number">1</span><span className="ls-symbol">;</span>
  </>,

  <>
    <span className="ls-symbol">{"}"}</span>
  </>,
];

const LinearSearch = () => {
  const [seed, setSeed] = useState(randomArray());
  const [target, setTarget] = useState(seed[Math.floor(Math.random() * seed.length)]);

  const steps = linearSearchSteps(seed, target);
  const { index, playing, speed, setSpeed, reset, stepForward, stepBack, togglePlay } = usePlayback(steps.length);
  const current = steps[index];

  const shuffle = () => {
    const newSeed = randomArray();

    setSeed(newSeed);
    setTarget(newSeed[Math.floor(Math.random() * newSeed.length)]);
    reset();
  };

  return (
    <div className="linear-search-wrapper">
      <div className="linear-search">
        <p className="ls-eyebrow">searching</p>

        <h1 className="ls-title">Linear Search</h1>

        <div className="ls-header">
          <p className="ls-blurb">
            Walks the array one element at a time until it finds a match.
          </p>

          <div className="ls-complexity">
            <div>
              <div className="ls-complexity-label">time</div>
              <div className="ls-time-value">O(n)</div>
            </div>

            <div>
              <div className="ls-complexity-label">space</div>
              <div className="ls-space-value">O(1)</div>
            </div>
          </div>
        </div>

        <div className="ls-grid">
          <div className="ls-stage">
            <div className="ls-boxs">
              {current.array.map((value, i) => {
                const isCurrent = i === current.currentIndex;
                const isFound = current.found && isCurrent;

                return (
                  <div key={i} className="ls-box-wrapper">
                    <div className="ls-index">{i}</div>

                    <motion.div
                      className="ls-box"
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
            <p className="ls-status">{current.description}</p>
          </div>

          <div className="ls-code-panel">
            <div className="ls-code-header">
              <div className="ls-dummy-btns">
                <span className="ls-red-btn"></span>
                <span className="ls-yellow-btn"></span>
                <span className="ls-green-btn"></span>
                <span className="ls-filename">linearSearch.cpp</span>
              </div>

              <span className="ls-header-complexity">O(n)</span>
            </div>

            <pre className="ls-code-block">
              {CodeLines.map((line, i) => {
                return (
                  <div
                    key={i}
                    className={`ls-code-line ${current.codeLine === i + 1 ? "ls-code-line-active" : ""}`}
                  >
                    <span className="ls-line-no">{i + 1}</span>
                    {line}
                  </div>
                );
              })}
            </pre>
          </div>
        </div>

        <div className="ls-controls">
          <button className="ls-icon-btn" onClick={reset}>
            <ResetIcon />
          </button>

          <button
            className="ls-icon-btn"
            onClick={stepBack}
            disabled={index === 0}
          >
            <StepBackIcon />
          </button>

          <button className="ls-play-btn" onClick={togglePlay}>
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>

          <button
            className="ls-icon-btn"
            onClick={stepForward}
            disabled={index === steps.length - 1}
          >
            <StepForwardIcon />
          </button>

          <button className="ls-shuffle-btn" onClick={shuffle}>
            <ShuffleIcon />
            New array
          </button>

          <input
            className="ls-input"
            type="number"
            value={target}
            onChange={(e) => {
              setTarget(Number(e.target.value))
              reset();
            }}
          />

          <div className="ls-speed">
            <span>SPEED</span>

            <input
              type="range"
              min="1"
              max="10"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
          </div>

          <span className="ls-steps">
            {index + 1} / {steps.length}
          </span>
        </div>

        <div className="ls-stats">
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

export default LinearSearch;
