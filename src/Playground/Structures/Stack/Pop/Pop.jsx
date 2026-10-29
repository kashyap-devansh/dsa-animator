import { useState, useEffect } from "react";
import { useAutoAdvance } from "../../../shared/useAutoAdvance";
import { ResetIcon, StepBackIcon, PlayIcon, PauseIcon, StepForwardIcon } from "../../../shared/icons";
import "./Pop.css";

function stackSteps(existingStack = []) {
  const stack = [...existingStack];
  const steps = [];

  function save(codeLine, description, phase, active = -1) {
    steps.push({
      stack: [...stack],
      phase,
      codeLine,
      description,
      active,
      length: stack.length,
    });
  }

  save(1, stack.length ? "Current Stack." : "Stack is empty", "idle");

  if (!stack.length) {
    save(2, "Stack Underflow. Nothing to pop.", "done");
    return steps;
  }

  save(5, `Top element is ${stack[0]}`, "created", 0);

  save(6, `Pop ${stack[0]} from the top of the stack`, "linked", 0);

  const removed = stack.shift();

  save(6, stack.length ? `${stack[0]} is now the top element` : "Stack is now empty", "placed", stack.length ? 0 : -1);

  save(7, `Pop operation completed. Removed ${removed}.`, "done");

  return steps;
}

const CodeLines = [
  <>
    <span className="dfp-type">int</span> pop
    <span className="dfp-symbol">()</span>{" "}
    <span className="dfp-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;
    <span className="dfp-keyword">if</span>{" "}
    <span className="dfp-symbol">(</span>
    top <span className="dfp-symbol">==</span> -1
    <span className="dfp-symbol">)</span>{" "}
    <span className="dfp-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;
    <span className="dfp-function">cout</span>
    <span className="dfp-symbol"> &lt;&lt; </span>
    <span className="dfp-string">"Stack Underflow"</span>
    <span className="dfp-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;
    <span className="dfp-keyword">return</span>{" "}
    <span className="dfp-number">-1</span>
    <span className="dfp-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;
    <span className="dfp-type">int</span> value{" "}
    <span className="dfp-symbol">=</span> stack
    <span className="dfp-symbol">[</span>top
    <span className="dfp-symbol">]</span>
    <span className="dfp-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;
    top<span className="dfp-symbol">--;</span>
  </>,

  <>
    &nbsp;&nbsp;
    <span className="dfp-keyword">return</span> value
    <span className="dfp-symbol">;</span>
  </>,

  <>
    <span className="dfp-symbol">{"}"}</span>
  </>,
];

const Pop = () => {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(5);

  const [elements, setElements] = useState([
    {
      id: 1,
      value: 10,
    },
    {
      id: 2,
      value: 20,
    },
    {
      id: 3,
      value: 30,
    },
    {
      id: 4,
      value: 40,
    },
    {
      id: 5,
      value: 50,
    },
  ]);

  const steps = stackSteps(elements.map(element => element.value));

  const current = steps[index];

  const reset = () => {
    setPlaying(false);
    setIndex(0);
    setElements([
      {
        id: 1,
        value: 10,
      },
      {
        id: 2,
        value: 20,
      },
      {
        id: 3,
        value: 30,
      },
      {
        id: 4,
        value: 40,
      },
      {
        id: 5,
        value: 50,
      },
    ])
  };

  const stepForward = () => {
    setPlaying(false);
    if (index < steps.length - 1) {
      if (elements.length === 0) {
        reset();
        return;
      }
      setIndex(index + 1);
    }
  };

  const stepBack = () => {
    setPlaying(false);
    if (index > 0) setIndex(index - 1);
  };

  const togglePlay = () => {
    if (index === steps.length - 1) setIndex(0);

    if (elements.length === 0) {
      reset();
      return;
    }
    setPlaying(!playing);
  };

  useEffect(() => {
    if (current.phase !== "done") return;
    setElements(prev => prev.slice(1));

    setIndex(0);
    setPlaying(false);
  }, [current]);

  useAutoAdvance({ playing, index, setIndex, setPlaying, speed, stepsLength: steps.length });

  return (
    <div className="push-wrapper">
      <div className="push">
        <p className="p-eyebrow">stack</p>
        <h1 className="p-title">Pop</h1>

        <div className="p-header">
          <p className="i-blurb">
            Each pop operation removes the top element from the stack.
          </p>

          <div className="p-complexity">
            <div>
              <div className="p-complexity-label">time</div>
              <div className="p-time-value">O(1)</div>
            </div>
            <div>
              <div className="p-complexity-label">space</div>
              <div className="p-space-value">O(1)</div>
            </div>
          </div>
        </div>

        <div className="p-grid">
          <div className="p-stage">
            <div className="stack-container">
              <div className="stack">

                {
                  current.stack.map((value, index) => (
                    <div
                      className="p-element-wrapper"
                      key={index}
                    >
                      <div className="p-element">
                        <div className="data">{value}</div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
            <p className="p-status">{current.description}</p>
          </div>

          <div className="p-code-panel">
            <div className="p-code-header">
              <div className="p-dummy-btns">
                <span className="p-red-btn"></span>
                <span className="p-yellow-btn"></span>
                <span className="p-green-btn"></span>
                <span className="p-filename">pop.cpp</span>
              </div>
              <span className="p-header-complexity">O(1)</span>
            </div>

            <pre className="p-code-block">
              {
                CodeLines.map((line, i) => (
                  <div key={i}
                    className={`p-code-line ${current.codeLine === i + 1 ? "p-code-line-active" : ""}`}
                  >
                    <span className="p-line-no">{i + 1}</span>
                    {line}
                  </div>
                ))
              }
            </pre>
          </div>
        </div>

        <div className="p-controls">
          <button className="p-icon-btn" onClick={reset}>
            <ResetIcon />
          </button>

          <button className="p-icon-btn" onClick={stepBack} disabled={index === 0}>
            <StepBackIcon />
          </button>

          <button className="p-play-btn" onClick={togglePlay}>
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>

          <button className="p-icon-btn" onClick={stepForward} disabled={false}>
            <StepForwardIcon />
          </button>

          <div className="p-speed">
            <span>SPEED</span>
            <input type="range" min="1" max="10" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
          </div>

          <span className="p-steps">
            {index + 1} / {steps.length}
          </span>
        </div>

        <div className="p-stats">
          <span>
            elements: <b>{elements.length}</b>
          </span>
        </div>
      </div>
    </div>
  )
}

export default Pop;
