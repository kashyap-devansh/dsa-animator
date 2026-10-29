import { useState, useEffect } from "react";
import { usePlayback } from "../../../shared/usePlayback";
import { ResetIcon, StepBackIcon, PlayIcon, PauseIcon, StepForwardIcon } from "../../../shared/icons";
import "./Insert.css";

function insertSteps(baseValues, index, value) {
  const n = baseValues.length;
  const clampedIndex = Math.min(Math.max(0, index), n);
  const steps = [];
  let shifts = 0;

  function save(line, description, arr, opts = {}) {
    steps.push({
      array: [...arr],
      codeLine: line,
      description,
      shiftFrom: opts.shiftFrom ?? -1,
      shiftTo: opts.shiftTo ?? -1,
      placed: opts.placed ?? -1,
      length: opts.length ?? n,
      shifts,
    });
  }

  save(1, `Current array (length ${n})`, baseValues, { length: n });

  save(2, `Validate 0 ≤ ${clampedIndex} ≤ ${n}`, baseValues, { length: n });

  const working = [...baseValues, undefined];

  for (let i = n - 1; i >= clampedIndex; i--) {
    save(3, `Shift arr[${i}] right into arr[${i + 1}]`, working, {
      shiftFrom: i,
      shiftTo: i + 1,
      length: n + 1,
    });

    working[i + 1] = working[i];
    shifts++;

    save(4, `arr[${i + 1}] = ${working[i + 1]}`, working, {
      shiftTo: i + 1,
      length: n + 1,
    });
  }

  working[clampedIndex] = value;

  save(5, `arr[${clampedIndex}] = ${value}`, working, {
    placed: clampedIndex,
    length: n + 1,
  });

  save(6, `n++ → Insert complete (length ${n + 1})`, working, {
    placed: clampedIndex,
    length: n + 1,
  });

  return steps;
}

const CodeLines = [
  <>
    <span className="ai-type">void</span> insert
    <span className="ai-symbol">(</span><span className="ai-type">int</span> arr<span className="ai-symbol">[],</span> <span className="ai-type">int&amp;</span> n<span className="ai-symbol">,</span> <span className="ai-type">int</span> index<span className="ai-symbol">,</span> <span className="ai-type">int</span> value<span className="ai-symbol">)</span> <span className="ai-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="ai-comment">// index must satisfy 0 ≤ index ≤ n</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="ai-keyword">for</span> <span className="ai-symbol">(</span><span className="ai-type">int</span> i <span className="ai-symbol">=</span> n <span className="ai-symbol">-</span> <span className="ai-number">1</span><span className="ai-symbol">;</span> i <span className="ai-symbol">&gt;=</span> index<span className="ai-symbol">;</span> i<span className="ai-symbol">--)</span> <span className="ai-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;arr<span className="ai-symbol">[</span>i <span className="ai-symbol">+</span> <span className="ai-number">1</span><span className="ai-symbol">]</span> <span className="ai-symbol">=</span> arr<span className="ai-symbol">[</span>i<span className="ai-symbol">];</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="ai-symbol">{"}"}</span>
  </>,

  <>
    &nbsp;&nbsp;arr<span className="ai-symbol">[</span>index<span className="ai-symbol">]</span> <span className="ai-symbol">=</span> value<span className="ai-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;n<span className="ai-symbol">++;</span>
  </>,

  <>
    <span className="ai-symbol">{"}"}</span>
  </>,
];

const Insert = () => {
  const [elements, setElements] = useState([10, 20, 30, 40]);
  const [indexInput, setIndexInput] = useState("");
  const [valueInput, setValueInput] = useState("");

  const index = Math.min(Math.max(0, Number(indexInput) || 0), elements.length);
  const value = valueInput === "" || isNaN(Number(valueInput)) ? Math.floor(Math.random() * 90) + 10 : Number(valueInput);

  const steps = insertSteps(elements, index, value);
  const { index: stepIndex, playing, speed, setSpeed, reset, stepForward, stepBack, togglePlay } = usePlayback(steps.length);
  const current = steps[stepIndex];
  const isDone = stepIndex === steps.length - 1;

  useEffect(() => {
    if (!isDone) return;

    setElements((prev) => {
      const next = [...prev];
      next.splice(index, 0, value);
      return next;
    });

    setIndexInput("");
    setValueInput("");
    reset();
  }, [isDone]);

  return (
    <div className="array-insert-wrapper">
      <div className="array-insert">
        <p className="ai-eyebrow">array</p>

        <h1 className="ai-title">Insert</h1>

        <div className="ai-header">
          <p className="ai-blurb">
            Shifts every element from the end back to the target index, then drops the new value into the gap.
          </p>

          <div className="ai-complexity">
            <div>
              <div className="ai-complexity-label">time</div>
              <div className="ai-time-value">O(n)</div>
            </div>

            <div>
              <div className="ai-complexity-label">space</div>
              <div className="ai-space-value">O(1)</div>
            </div>
          </div>
        </div>

        <div className="ai-grid">
          <div className="ai-stage">
            <div className="ai-boxs">
              {current.array.map((val, i) => {
                const isShiftFrom = i === current.shiftFrom;
                const isShiftTo = i === current.shiftTo;
                const isPlaced = i === current.placed;
                const isEmpty = val === undefined;

                return (
                  <div key={i} className="ai-box-wrapper">
                    <div className="ai-index">{i}</div>

                    <div
                      className={`ai-box ${isShiftFrom ? "ai-shift-from" : ""} ${isShiftTo ? "ai-shift-to" : ""} ${isPlaced ? "ai-placed" : ""} ${isEmpty ? "ai-empty" : ""}`}
                    >
                      {isEmpty ? "·" : val}
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="ai-status">{current.description}</p>
          </div>

          <div className="ai-code-panel">
            <div className="ai-code-header">
              <div className="ai-dummy-btns">
                <span className="ai-red-btn"></span>
                <span className="ai-yellow-btn"></span>
                <span className="ai-green-btn"></span>
                <span className="ai-filename">array_insert.cpp</span>
              </div>

              <span className="ai-header-complexity">O(n)</span>
            </div>

            <pre className="ai-code-block">
              {CodeLines.map((line, i) => (
                <div
                  key={i}
                  className={`ai-code-line ${current.codeLine === i + 1 ? "ai-code-line-active" : ""}`}
                >
                  <span className="ai-line-no">{i + 1}</span>
                  {line}
                </div>
              ))}
            </pre>
          </div>
        </div>

        <div className="ai-controls">
          <button className="ai-icon-btn" onClick={reset}>
            <ResetIcon />
          </button>

          <button
            className="ai-icon-btn"
            onClick={stepBack}
            disabled={stepIndex === 0}
          >
            <StepBackIcon />
          </button>

          <button className="ai-play-btn" onClick={togglePlay}>
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>

          <button
            className="ai-icon-btn"
            onClick={stepForward}
            disabled={stepIndex === steps.length - 1}
          >
            <StepForwardIcon />
          </button>

          <input
            className="ai-input"
            type="number"
            placeholder="index"
            value={indexInput}
            onChange={(e) => {
              setIndexInput(e.target.value);
              reset();
            }}
          />

          <input
            className="ai-input"
            type="number"
            placeholder="value"
            value={valueInput}
            onChange={(e) => {
              setValueInput(e.target.value);
              reset();
            }}
          />

          <div className="ai-speed">
            <span>SPEED</span>

            <input
              type="range"
              min="1"
              max="10"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
          </div>

          <span className="ai-steps">
            {stepIndex + 1} / {steps.length}
          </span>
        </div>

        <div className="ai-stats">
          <span>
            length: <b>{current.length}</b>
          </span>

          <span>
            shifts: <b>{current.shifts}</b>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Insert;
