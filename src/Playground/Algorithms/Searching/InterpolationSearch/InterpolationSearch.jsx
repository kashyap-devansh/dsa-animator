import { useState } from "react";
import { motion } from "framer-motion";
import { usePlayback } from "../../../shared/usePlayback";
import { ResetIcon, StepBackIcon, PlayIcon, PauseIcon, StepForwardIcon, ShuffleIcon } from "../../../shared/icons";
import "./InterpolationSearch.css";

function uniformArray(size = 12) {
  const arr = [];
  let value = Math.floor(Math.random() * 5) + 1;

  for (let i = 0; i < size; i++) {
    arr.push(value);
    value += Math.floor(Math.random() * 8) + 3;
  }

  return arr;
}

function interpolationSearchSteps(input, target) {
  const arr = [...input];
  const steps = [];
  let comparisons = 0;

  function save(line, description, pos = -1, low = -1, high = -1, found = false) {
    steps.push({
      array: [...arr],
      codeLine: line,
      description,
      pos,
      low,
      high,
      target,
      found,
      comparisons,
    });
  }

  let low = 0;
  let high = arr.length - 1;

  save(1, `Search for ${target}`, -1, low, high);

  while (low <= high && target >= arr[low] && target <= arr[high]) {
    let pos;

    if (arr[high] === arr[low]) {
      pos = low;
      save(4, `arr[low] == arr[high] — probe index ${pos} directly`, pos, low, high);
    } else {
      pos = low + Math.floor(((target - arr[low]) * (high - low)) / (arr[high] - arr[low]));
      save(4, `Probe index ${pos} using the interpolation formula`, pos, low, high);
    }

    comparisons++;
    save(5, `Check arr[${pos}] = ${arr[pos]}`, pos, low, high);

    if (arr[pos] === target) {
      save(6, `Found ${target} at index ${pos}`, pos, low, high, true);
      return steps;
    }

    if (arr[pos] < target) {
      low = pos + 1;
      save(8, `${arr[pos]} < ${target} — probe again to the right`, pos, low, high);
    } else {
      high = pos - 1;
      save(10, `${arr[pos]} > ${target} — probe again to the left`, pos, low, high);
    }
  }

  save(13, `${target} not found`, -1, low, high);

  return steps;
}

const CodeLines = [
  <>
    <span className="ips-type">int</span> interpolationSearch
    <span className="ips-symbol">(</span><span className="ips-type">vector</span><span className="ips-symbol">&lt;</span><span className="ips-type">int</span><span className="ips-symbol">&gt;&amp;</span> arr<span className="ips-symbol">,</span> <span className="ips-type">int</span> target<span className="ips-symbol">)</span> <span className="ips-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="ips-type">int</span> low <span className="ips-symbol">=</span> <span className="ips-number">0</span><span className="ips-symbol">,</span> high <span className="ips-symbol">=</span> arr<span className="ips-symbol">.</span>size<span className="ips-symbol">()</span> <span className="ips-symbol">-</span> <span className="ips-number">1</span><span className="ips-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="ips-keyword">while</span> <span className="ips-symbol">(</span>low <span className="ips-symbol">&lt;=</span> high <span className="ips-symbol">&amp;&amp;</span> target <span className="ips-symbol">&gt;=</span> arr<span className="ips-symbol">[</span>low<span className="ips-symbol">]</span> <span className="ips-symbol">&amp;&amp;</span> target <span className="ips-symbol">&lt;=</span> arr<span className="ips-symbol">[</span>high<span className="ips-symbol">])</span> <span className="ips-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;<span className="ips-type">int</span> pos <span className="ips-symbol">=</span> low <span className="ips-symbol">+</span> <span className="ips-symbol">(</span>target <span className="ips-symbol">-</span> arr<span className="ips-symbol">[</span>low<span className="ips-symbol">])</span> <span className="ips-symbol">*</span> <span className="ips-symbol">(</span>high <span className="ips-symbol">-</span> low<span className="ips-symbol">)</span> <span className="ips-symbol">/</span> <span className="ips-symbol">(</span>arr<span className="ips-symbol">[</span>high<span className="ips-symbol">]</span> <span className="ips-symbol">-</span> arr<span className="ips-symbol">[</span>low<span className="ips-symbol">])</span><span className="ips-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;<span className="ips-keyword">if</span> <span className="ips-symbol">(</span>arr<span className="ips-symbol">[</span>pos<span className="ips-symbol">]</span> <span className="ips-symbol">==</span> target<span className="ips-symbol">)</span> <span className="ips-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="ips-keyword">return</span> pos<span className="ips-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;<span className="ips-symbol">{"}"}</span> <span className="ips-keyword">else if</span> <span className="ips-symbol">(</span>arr<span className="ips-symbol">[</span>pos<span className="ips-symbol">]</span> <span className="ips-symbol">&lt;</span> target<span className="ips-symbol">)</span> <span className="ips-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;low <span className="ips-symbol">=</span> pos <span className="ips-symbol">+</span> <span className="ips-number">1</span><span className="ips-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;<span className="ips-symbol">{"}"}</span> <span className="ips-keyword">else</span> <span className="ips-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;high <span className="ips-symbol">=</span> pos <span className="ips-symbol">-</span> <span className="ips-number">1</span><span className="ips-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;<span className="ips-symbol">{"}"}</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="ips-symbol">{"}"}</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="ips-keyword">return</span> <span className="ips-symbol">-</span><span className="ips-number">1</span><span className="ips-symbol">;</span>
  </>,

  <>
    <span className="ips-symbol">{"}"}</span>
  </>,
];

const InterpolationSearch = () => {
  const [seed, setSeed] = useState(uniformArray());
  const [target, setTarget] = useState(seed[Math.floor(Math.random() * seed.length)]);

  const steps = interpolationSearchSteps(seed, target);
  const { index, playing, speed, setSpeed, reset, stepForward, stepBack, togglePlay } = usePlayback(steps.length);
  const current = steps[index];

  const shuffle = () => {
    const newSeed = uniformArray();

    setSeed(newSeed);
    setTarget(newSeed[Math.floor(Math.random() * newSeed.length)]);
    reset();
  };

  return (
    <div className="interpolation-search-wrapper">
      <div className="interpolation-search">
        <p className="ips-eyebrow">searching</p>

        <h1 className="ips-title">Interpolation Search</h1>

        <div className="ips-header">
          <p className="ips-blurb">
            Estimates the target's position from the value spread instead of always checking the middle.
          </p>

          <div className="ips-complexity">
            <div>
              <div className="ips-complexity-label">time</div>
              <div className="ips-time-value">O(log log n)</div>
            </div>

            <div>
              <div className="ips-complexity-label">space</div>
              <div className="ips-space-value">O(1)</div>
            </div>
          </div>
        </div>

        <div className="ips-grid">
          <div className="ips-stage">
            <div className="ips-boxs">
              {current.array.map((value, i) => {
                const isCurrent = i === current.pos;
                const isFound = current.found && isCurrent;

                return (
                  <div key={i} className="ips-box-wrapper">
                    <div className="ips-index">{i}</div>

                    <motion.div
                      className={`ips-box ${i < current.low || i > current.high ? "dull-box" : ""}`}
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
            <p className="ips-status">{current.description}</p>
          </div>

          <div className="ips-code-panel">
            <div className="ips-code-header">
              <div className="ips-dummy-btns">
                <span className="ips-red-btn"></span>
                <span className="ips-yellow-btn"></span>
                <span className="ips-green-btn"></span>
                <span className="ips-filename">interpolationSearch.cpp</span>
              </div>

              <span className="ips-header-complexity">O(log log n)</span>
            </div>

            <pre className="ips-code-block">
              {CodeLines.map((line, i) => {
                return (
                  <div
                    key={i}
                    className={`ips-code-line ${current.codeLine === i + 1 ? "ips-code-line-active" : ""}`}
                  >
                    <span className="ips-line-no">{i + 1}</span>
                    {line}
                  </div>
                );
              })}
            </pre>
          </div>
        </div>

        <div className="ips-controls">
          <button className="ips-icon-btn" onClick={reset}>
            <ResetIcon />
          </button>

          <button
            className="ips-icon-btn"
            onClick={stepBack}
            disabled={index === 0}
          >
            <StepBackIcon />
          </button>

          <button className="ips-play-btn" onClick={togglePlay}>
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>

          <button
            className="ips-icon-btn"
            onClick={stepForward}
            disabled={index === steps.length - 1}
          >
            <StepForwardIcon />
          </button>

          <button className="ips-shuffle-btn" onClick={shuffle}>
            <ShuffleIcon />
            New array
          </button>

          <input
            className="ips-input"
            type="number"
            value={target}
            onChange={(e) => {
              setTarget(Number(e.target.value))
              reset();
            }}
          />

          <div className="ips-speed">
            <span>SPEED</span>

            <input
              type="range"
              min="1"
              max="10"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
          </div>

          <span className="ips-steps">
            {index + 1} / {steps.length}
          </span>
        </div>

        <div className="ips-stats">
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

export default InterpolationSearch;
