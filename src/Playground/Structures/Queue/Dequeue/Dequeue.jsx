import { useState, useEffect } from "react";
import { useAutoAdvance } from "../../../shared/useAutoAdvance";
import { ResetIcon, StepBackIcon, PlayIcon, PauseIcon, StepForwardIcon } from "../../../shared/icons";
import "./Dequeue.css";

function queueSteps(existingQueue = []) {
  const queue = [...existingQueue];
  const steps = [];

  function save(codeLine, description, phase, active = -1) {
    steps.push({
      queue: [...queue],
      value: queue[0] ?? null,
      phase,
      codeLine,
      description,
      active,
      length: queue.length,
    });
  }

  save(1, queue.length ? "Current Queue." : "Queue is empty", "idle");

  if (queue.length === 0) {
    save(2, "Queue Underflow", "underflow");
    save(3, "Dequeue operation cannot be performed.", "done");
    return steps;
  }

  save(5, `Remove front element ${queue[0]}`, "created", 0);

  save(6, `Dequeue ${queue[0]} from the front of the queue`, "linked", 0);

  const removed = queue.shift();

  save(6, `${removed} has been removed from the queue`, "placed");

  save(7, "Dequeue operation completed.", "done");

  return steps;
}

const CodeLines = [
  <>
    <span className="dfde-type">void</span> enqueue
    <span className="dfde-symbol">(</span>
    <span className="dfde-type">int</span> value
    <span className="dfde-symbol">)</span>{" "}
    <span className="dfde-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;
    <span className="dfde-keyword">if</span>{" "}
    <span className="dfde-symbol">(</span>
    rear <span className="dfde-symbol">==</span> MAX - 1
    <span className="dfde-symbol">)</span>{" "}
    <span className="dfde-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;
    <span className="dfde-function">cout</span>
    <span className="dfde-symbol"> &lt;&lt; </span>
    <span className="dfde-string">"Queue Overflow"</span>
    <span className="dfde-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;
    <span className="dfde-keyword">return</span>
    <span className="dfde-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;
    rear<span className="dfde-symbol">++;</span>
  </>,

  <>
    &nbsp;&nbsp;
    queue<span className="dfde-symbol">[</span>rear
    <span className="dfde-symbol">]</span>{" "}
    <span className="dfde-symbol">=</span> value
    <span className="dfde-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;
    <span className="dfde-keyword">return</span>
    <span className="dfde-symbol">;</span>
  </>,

  <>
    <span className="dfde-symbol">{"}"}</span>
  </>
];

const Dequeue = () => {
  const [inputValue, setInputValue] = useState("");
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
    {
      id: 6,
      value: 60,
    },
    {
      id: 7,
      value: 70,
    },
    {
      id: 8,
      value: 80,
    },
    {
      id: 9,
      value: 90,
    },
    {
      id: 10,
      value: 100,
    }
  ]);

  const steps = queueSteps(elements.map(element => element.value));

  const current = steps[index];

  const reset = () => {
    setPlaying(false);
    setIndex(0);
    setInputValue("");
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
      {
        id: 6,
        value: 60,
      },
      {
        id: 7,
        value: 70,
      },
      {
        id: 8,
        value: 80,
      },
      {
        id: 9,
        value: 90,
      },
      {
        id: 10,
        value: 100,
      }
    ])
  };

  const stepForward = () => {
    setPlaying(false);
    if (index < steps.length - 1) {
      if (elements.length < 1) {
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

    if (elements.length < 1) {
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
  }, [current.phase]);

  useAutoAdvance({ playing, index, setIndex, setPlaying, speed, stepsLength: steps.length });

  return (
    <div className="dequeue-wrapper">
      <div className="dequeue">
        <p className="de-eyebrow">queue</p>
        <h1 className="de-title">Dequeue</h1>

        <div className="de-header">
          <p className="i-blurb">
            Every new element is added to the rear (end) of the queue.
          </p>

          <div className="de-complexity">
            <div>
              <div className="de-complexity-label">time</div>
              <div className="de-time-value">O(1)</div>
            </div>
            <div>
              <div className="de-complexity-label">space</div>
              <div className="de-space-value">O(1)</div>
            </div>
          </div>
        </div>

        <div className="de-grid">
          <div className="de-stage">
            <div className="queue-container">
              <div className="queue">
                {
                  current.queue.map((value, index) => (
                    <div
                      className="queue-element-wrapper"
                      key={index}
                    >
                      {index === 0 ? <span className="front">FRONT</span> : null}

                      <div className="queue-element">
                        <div className="data">{value}</div>
                      </div>

                      {index === current.queue.length - 1 && (
                        <span className="front rear">REAR</span>
                      )}
                    </div>
                  ))
                }
              </div>
            </div>
            <p className="de-status">{current.description}</p>
          </div>

          <div className="de-code-panel">
            <div className="de-code-header">
              <div className="de-dummy-btns">
                <span className="de-red-btn"></span>
                <span className="de-yellow-btn"></span>
                <span className="de-grede-btn"></span>
                <span className="de-filename">dequeue.cpp</span>
              </div>
              <span className="de-header-complexity">O(1)</span>
            </div>

            <pre className="de-code-block">
              {
                CodeLines.map((line, i) => (
                  <div key={i}
                    className={`de-code-line ${current.codeLine === i + 1 ? "de-code-line-active" : ""}`}
                  >
                    <span className="de-line-no">{i + 1}</span>
                    {line}
                  </div>
                ))
              }
            </pre>
          </div>
        </div>

        <div className="de-controls">
          <button className="de-icon-btn" onClick={reset}>
            <ResetIcon />
          </button>

          <button className="de-icon-btn" onClick={stepBack} disabled={index === 0}>
            <StepBackIcon />
          </button>

          <button className="de-play-btn" onClick={togglePlay}>
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>

          <button className="de-icon-btn" onClick={stepForward} disabled={false}>
            <StepForwardIcon />
          </button>

          <input
            className="de-input"
            type="text"
            placeholder="value"
            value={inputValue}
            onChange={(e) => {
              setInputValue(Number(e.target.value))
            }}
          />

          <div className="de-speed">
            <span>SPEED</span>
            <input type="range" min="1" max="10" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
          </div>

          <span className="de-steps">
            {index + 1} / {steps.length}
          </span>
        </div>

        <div className="de-stats">
          <span>
            elements: <b>{elements.length}</b>
          </span>
        </div>
      </div>
    </div>
  )
}

export default Dequeue;
