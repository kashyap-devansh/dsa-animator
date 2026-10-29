import { useState, useEffect } from "react";
import { usePlayback } from "../../../shared/usePlayback";
import { ResetIcon, StepBackIcon, PlayIcon, PauseIcon, StepForwardIcon } from "../../../shared/icons";
import "./Delete.css";

function deleteSteps(baseValues, index) {
  const n = baseValues.length;
  const steps = [];
  let shifts = 0;

  function save(line, description, arr, opts = {}) {
    steps.push({
      array: [...arr],
      codeLine: line,
      description,
      removing: opts.removing ?? -1,
      shiftFrom: opts.shiftFrom ?? -1,
      shiftTo: opts.shiftTo ?? -1,
      length: opts.length ?? arr.length,
      shifts,
      removedValue: opts.removedValue ?? null,
    });
  }

  if (n === 0) {
    save(1, "Array is empty — nothing to delete.", baseValues, { length: 0 });
    return steps;
  }

  const clampedIndex = Math.min(Math.max(0, index), n - 1);

  save(1, `Current array (length ${n})`, baseValues, { length: n });

  save(2, `Validate 0 ≤ ${clampedIndex} ≤ ${n - 1}`, baseValues, { length: n });

  const working = [...baseValues];
  const removedValue = working[clampedIndex];

  save(3, `Removing arr[${clampedIndex}] = ${removedValue}`, working, {
    removing: clampedIndex,
    length: n,
  });

  for (let i = clampedIndex; i <= n - 2; i++) {
    save(4, `Shift arr[${i + 1}] left into arr[${i}]`, working, {
      shiftFrom: i + 1,
      shiftTo: i,
      length: n,
      removedValue,
    });

    working[i] = working[i + 1];
    shifts++;

    save(5, `arr[${i}] = ${working[i]}`, working, {
      shiftTo: i,
      length: n,
      removedValue,
    });
  }

  working.pop();

  save(6, `n-- → Delete complete (length ${n - 1})`, working, {
    length: n - 1,
    removedValue,
  });

  return steps;
}

const CodeLines = [
  <>
    <span className="ad-type">void</span> deleteAt
    <span className="ad-symbol">(</span><span className="ad-type">int</span> arr<span className="ad-symbol">[],</span> <span className="ad-type">int&amp;</span> n<span className="ad-symbol">,</span> <span className="ad-type">int</span> index<span className="ad-symbol">)</span> <span className="ad-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="ad-comment">// index must satisfy 0 ≤ index ≤ n - 1</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="ad-keyword">for</span> <span className="ad-symbol">(</span><span className="ad-type">int</span> i <span className="ad-symbol">=</span> index<span className="ad-symbol">;</span> i <span className="ad-symbol">&lt;=</span> n <span className="ad-symbol">-</span> <span className="ad-number">2</span><span className="ad-symbol">;</span> i<span className="ad-symbol">++)</span> <span className="ad-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;arr<span className="ad-symbol">[</span>i<span className="ad-symbol">]</span> <span className="ad-symbol">=</span> arr<span className="ad-symbol">[</span>i <span className="ad-symbol">+</span> <span className="ad-number">1</span><span className="ad-symbol">];</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="ad-symbol">{"}"}</span>
  </>,

  <>
    &nbsp;&nbsp;n<span className="ad-symbol">--;</span>
  </>,

  <>
    <span className="ad-symbol">{"}"}</span>
  </>,
];

const Delete = () => {
  const [elements, setElements] = useState([10, 20, 30, 40, 50]);
  const [indexInput, setIndexInput] = useState("");

  const index = Math.min(Math.max(0, Number(indexInput) || 0), Math.max(0, elements.length - 1));

  const steps = deleteSteps(elements, index);
  const { index: stepIndex, playing, speed, setSpeed, reset, stepForward, stepBack, togglePlay } = usePlayback(steps.length);
  const current = steps[stepIndex];
  const isDone = stepIndex === steps.length - 1;

  useEffect(() => {
    if (!isDone || elements.length === 0) return;

    setElements((prev) => {
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });

    setIndexInput("");
    reset();
  }, [isDone]);

  return (
    <div className="array-delete-wrapper">
      <div className="array-delete">
        <p className="ad-eyebrow">array</p>

        <h1 className="ad-title">Delete</h1>

        <div className="ad-header">
          <p className="ad-blurb">
            Removes the element at the target index, then shifts every later element one slot to the left.
          </p>

          <div className="ad-complexity">
            <div>
              <div className="ad-complexity-label">time</div>
              <div className="ad-time-value">O(n)</div>
            </div>

            <div>
              <div className="ad-complexity-label">space</div>
              <div className="ad-space-value">O(1)</div>
            </div>
          </div>
        </div>

        <div className="ad-grid">
          <div className="ad-stage">
            <div className="ad-boxs">
              {current.array.map((val, i) => {
                const isRemoving = i === current.removing;
                const isShiftFrom = i === current.shiftFrom;
                const isShiftTo = i === current.shiftTo;

                return (
                  <div key={i} className="ad-box-wrapper">
                    <div className="ad-index">{i}</div>

                    <div
                      className={`ad-box ${isRemoving ? "ad-removing" : ""} ${isShiftFrom ? "ad-shift-from" : ""} ${isShiftTo ? "ad-shift-to" : ""}`}
                    >
                      {val}
                    </div>
                  </div>
                );
              })}

              {current.array.length === 0 && (
                <div className="ad-empty-state">Array is empty</div>
              )}
            </div>

            <p className="ad-status">{current.description}</p>
          </div>

          <div className="ad-code-panel">
            <div className="ad-code-header">
              <div className="ad-dummy-btns">
                <span className="ad-red-btn"></span>
                <span className="ad-yellow-btn"></span>
                <span className="ad-green-btn"></span>
                <span className="ad-filename">array_delete.cpp</span>
              </div>

              <span className="ad-header-complexity">O(n)</span>
            </div>

            <pre className="ad-code-block">
              {CodeLines.map((line, i) => (
                <div
                  key={i}
                  className={`ad-code-line ${current.codeLine === i + 1 ? "ad-code-line-active" : ""}`}
                >
                  <span className="ad-line-no">{i + 1}</span>
                  {line}
                </div>
              ))}
            </pre>
          </div>
        </div>

        <div className="ad-controls">
          <button className="ad-icon-btn" onClick={reset}>
            <ResetIcon />
          </button>

          <button
            className="ad-icon-btn"
            onClick={stepBack}
            disabled={stepIndex === 0}
          >
            <StepBackIcon />
          </button>

          <button className="ad-play-btn" onClick={togglePlay}>
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>

          <button
            className="ad-icon-btn"
            onClick={stepForward}
            disabled={stepIndex === steps.length - 1}
          >
            <StepForwardIcon />
          </button>

          <input
            className="ad-input"
            type="number"
            placeholder="index"
            value={indexInput}
            onChange={(e) => {
              setIndexInput(e.target.value);
              reset();
            }}
          />

          <div className="ad-speed">
            <span>SPEED</span>

            <input
              type="range"
              min="1"
              max="10"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
          </div>

          <span className="ad-steps">
            {stepIndex + 1} / {steps.length}
          </span>
        </div>

        <div className="ad-stats">
          <span>
            length: <b>{current.length}</b>
          </span>

          <span>
            shifts: <b>{current.shifts}</b>
          </span>

          <span>
            removed: <b>{current.removedValue ?? "–"}</b>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Delete;
