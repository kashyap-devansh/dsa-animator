import { useState } from "react";
import { randomArray } from "../../../shared/randomArray";
import { usePlayback } from "../../../shared/usePlayback";
import { ResetIcon, StepBackIcon, PlayIcon, PauseIcon, StepForwardIcon, ShuffleIcon } from "../../../shared/icons";
import "./Traverse.css";

function traverseSteps(arr) {
  const steps = [];
  const visited = [];

  function save(line, description, current = -1) {
    steps.push({
      array: [...arr],
      codeLine: line,
      description,
      current,
      visited: [...visited],
    });
  }

  save(1, `Start traversal (n = ${arr.length})`);

  for (let i = 0; i < arr.length; i++) {
    save(2, `Check i < n (i = ${i})`, i);

    visited.push(arr[i]);

    save(3, `Visit arr[${i}] = ${arr[i]}`, i);
  }

  save(5, "Traversal complete");

  return steps;
}

const CodeLines = [
  <>
    <span className="atr-type">void</span> traverse
    <span className="atr-symbol">(</span><span className="atr-type">int</span> arr<span className="atr-symbol">[],</span> <span className="atr-type">int</span> n<span className="atr-symbol">)</span> <span className="atr-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="atr-keyword">for</span> <span className="atr-symbol">(</span><span className="atr-type">int</span> i <span className="atr-symbol">=</span> <span className="atr-number">0</span><span className="atr-symbol">;</span> i <span className="atr-symbol">&lt;</span> n<span className="atr-symbol">;</span> i<span className="atr-symbol">++)</span> <span className="atr-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;<span className="atr-function">cout</span> <span className="atr-symbol">&lt;&lt;</span> arr<span className="atr-symbol">[</span>i<span className="atr-symbol">];</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="atr-symbol">{"}"}</span>
  </>,

  <>
    <span className="atr-symbol">{"}"}</span>
  </>,
];

const Traverse = () => {
  const [seed, setSeed] = useState(randomArray(10));

  const steps = traverseSteps(seed);
  const { index, playing, speed, setSpeed, reset, stepForward, stepBack, togglePlay } = usePlayback(steps.length);
  const current = steps[index];

  const shuffle = () => {
    setSeed(randomArray(10));
    reset();
  };

  return (
    <div className="array-traverse-wrapper">
      <div className="array-traverse">
        <p className="atr-eyebrow">array</p>

        <h1 className="atr-title">Traverse</h1>

        <div className="atr-header">
          <p className="atr-blurb">
            Visits every element of the array, from the first index to the last.
          </p>

          <div className="atr-complexity">
            <div>
              <div className="atr-complexity-label">time</div>
              <div className="atr-time-value">O(n)</div>
            </div>

            <div>
              <div className="atr-complexity-label">space</div>
              <div className="atr-space-value">O(1)</div>
            </div>
          </div>
        </div>

        <div className="atr-grid">
          <div className="atr-stage">
            <div className="atr-boxs">
              {current.array.map((value, i) => {
                const isCurrent = i === current.current;
                const isVisited = i < current.visited.length;

                return (
                  <div key={i} className="atr-box-wrapper">
                    <div className="atr-index">{i}</div>

                    <div
                      className={`atr-box ${isCurrent ? "atr-current" : ""} ${isVisited && !isCurrent ? "atr-visited" : ""}`}
                    >
                      {value}
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="atr-trail">
              visited: {current.visited.length ? current.visited.join(", ") : "–"}
            </p>

            <p className="atr-status">{current.description}</p>
          </div>

          <div className="atr-code-panel">
            <div className="atr-code-header">
              <div className="atr-dummy-btns">
                <span className="atr-red-btn"></span>
                <span className="atr-yellow-btn"></span>
                <span className="atr-green-btn"></span>
                <span className="atr-filename">array_traverse.cpp</span>
              </div>

              <span className="atr-header-complexity">O(n)</span>
            </div>

            <pre className="atr-code-block">
              {CodeLines.map((line, i) => (
                <div
                  key={i}
                  className={`atr-code-line ${current.codeLine === i + 1 ? "atr-code-line-active" : ""}`}
                >
                  <span className="atr-line-no">{i + 1}</span>
                  {line}
                </div>
              ))}
            </pre>
          </div>
        </div>

        <div className="atr-controls">
          <button className="atr-icon-btn" onClick={reset}>
            <ResetIcon />
          </button>

          <button
            className="atr-icon-btn"
            onClick={stepBack}
            disabled={index === 0}
          >
            <StepBackIcon />
          </button>

          <button className="atr-play-btn" onClick={togglePlay}>
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>

          <button
            className="atr-icon-btn"
            onClick={stepForward}
            disabled={index === steps.length - 1}
          >
            <StepForwardIcon />
          </button>

          <button className="atr-shuffle-btn" onClick={shuffle}>
            <ShuffleIcon />
            New array
          </button>

          <div className="atr-speed">
            <span>SPEED</span>

            <input
              type="range"
              min="1"
              max="10"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
          </div>

          <span className="atr-steps">
            {index + 1} / {steps.length}
          </span>
        </div>

        <div className="atr-stats">
          <span>
            visited: <b>{current.visited.length}</b>
          </span>

          <span>
            length: <b>{current.array.length}</b>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Traverse;
