import { useState, useEffect } from "react";
import "./Enqueue.css";

function queueSteps(input, existingQueue = []) {
  const queue = [...existingQueue];
  const steps = [];

  function save(codeLine, description, phase, active = -1) {
    steps.push({
      queue: [...queue],
      value: input,
      phase,
      codeLine,
      description,
      active,
      length: queue.length,
    });
  }

  save(1, queue.length ? "Current Queue." : "Queue is empty", "idle");

  save(5, `Create new element with value ${input}`, "created");

  save(6, `Enqueue ${input} at the rear of the queue`, "linked");

  queue.push(input);

  save(6, `${input} is now the rear element`, "placed", queue.length - 1);

  save(7, "Enqueue operation completed.", "done");

  return steps;
}

const CodeLines = [
  <>
    <span className="dfen-type">void</span> enqueue
    <span className="dfen-symbol">(</span>
    <span className="dfen-type">int</span> value
    <span className="dfen-symbol">)</span>{" "}
    <span className="dfen-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;
    <span className="dfen-keyword">if</span>{" "}
    <span className="dfen-symbol">(</span>
    rear <span className="dfen-symbol">==</span> MAX - 1
    <span className="dfen-symbol">)</span>{" "}
    <span className="dfen-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;
    <span className="dfen-function">cout</span>
    <span className="dfen-symbol"> &lt;&lt; </span>
    <span className="dfen-string">"Queue Overflow"</span>
    <span className="dfen-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;
    <span className="dfen-keyword">return</span>
    <span className="dfen-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;
    rear<span className="dfen-symbol">++;</span>
  </>,

  <>
    &nbsp;&nbsp;
    queue<span className="dfen-symbol">[</span>rear
    <span className="dfen-symbol">]</span>{" "}
    <span className="dfen-symbol">=</span> value
    <span className="dfen-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;
    <span className="dfen-keyword">return</span>
    <span className="dfen-symbol">;</span>
  </>,

  <>
    <span className="dfen-symbol">{"}"}</span>
  </>
];

const SpeedDelay = {
  1: 1400,
  2: 1100,
  3: 850,
  4: 650,
  5: 500,
  6: 380,
  7: 280,
  8: 200,
  9: 140,
  10: 90,
};

const Enqueue = () => {
  const [inputValue, setInputValue] = useState("");
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(5);

  const [newElement, setNewElement] = useState(null);
  const [elements, setElements] = useState([
    {
      id: 1,
      value: 10,
    },
    {
      id: 2,
      value: 20,
    }
  ]);

  const steps = queueSteps(newElement ? newElement.value : "", elements.map(element => element.value));

  const current = steps[index];

  const reset = () => {
    setPlaying(false);
    setIndex(0);
    setNewElement(null);
    setInputValue("");
    setElements([
      {
        id: 1,
        value: 10,
      },
      {
        id: 2,
        value: 20,
      }
    ])
  };

  const stepForward = () => {
    setPlaying(false);
    if (index < steps.length - 1) {
      if (elements.length >= 10) {
        reset();
        return;
      }

      if (!newElement) {
        setNewElement({
          id: Date.now(),
          value: inputValue === "" || isNaN(Number(inputValue)) ? Math.floor(Math.random() * 99) : Number(inputValue),
        });
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

    if (elements.length >= 10) {
      reset();
      return;
    }

    if (!newElement) {
      setNewElement({
        id: Date.now(),
        value: inputValue === "" || isNaN(Number(inputValue)) ? Math.floor(Math.random() * 99) : Number(inputValue),
      });
    }
    setPlaying(!playing);
  };

  useEffect(() => {
    if (current.phase === "done" && newElement) {
      setElements(prev => [
        ...prev,
        { id: newElement.id, value: newElement.value },
      ]);

      setNewElement(null);
      setIndex(0);
      setPlaying(false);
    }
  }, [current.phase, newElement]);

  useEffect(() => {
    if (!playing) return;

    const timer = setTimeout(() => {
      if (index < steps.length - 1) {
        setIndex(prev => prev + 1);
      }
      else {
        setPlaying(false);
      }
    }, SpeedDelay[speed]);

    return () => clearTimeout(timer);
  }, [playing, index, speed, steps.length]);

  return (
    <div className="enqueue-wrapper">
      <div className="enqueue">
        <p className="en-eyebrow">queue</p>
        <h1 className="en-title">Enqueue</h1>

        <div className="en-header">
          <p className="i-blurb">
            Every new element is added to the rear (end) of the queue.
          </p>

          <div className="en-complexity">
            <div>
              <div className="en-complexity-label">time</div>
              <div className="en-time-value">O(1)</div>
            </div>
            <div>
              <div className="en-complexity-label">space</div>
              <div className="en-space-value">O(1)</div>
            </div>
          </div>
        </div>

        <div className="en-grid">
          <div className="en-stage">
            <div className="queue-container">
              <div className="queue">
                {
                  current.queue.map((value, index) => (
                    <div
                      className="element-wrapper"
                      key={index}
                    >
                      {index === 0 ? <span className="front">FRONT</span> : null}
                      <div className="element">
                        <div className="data">{value}</div>
                      </div>
                      {index === current.queue.length - 1 ? <span className="en-rear">REAR</span> : null}
                    </div>
                  ))
                }
              </div>
            </div>
            <p className="en-status">{current.description}</p>
          </div>

          <div className="en-code-panel">
            <div className="en-code-header">
              <div className="en-dummy-btns">
                <span className="en-red-btn"></span>
                <span className="en-yellow-btn"></span>
                <span className="en-green-btn"></span>
                <span className="en-filename">enqueue.cpp</span>
              </div>
              <span className="en-header-complexity">O(1)</span>
            </div>

            <pre className="en-code-block">
              {
                CodeLines.map((line, i) => (
                  <div key={i}
                    className={`en-code-line ${current.codeLine === i + 1 ? "en-code-line-active" : ""}`}
                  >
                    <span className="en-line-no">{i + 1}</span>
                    {line}
                  </div>
                ))
              }
            </pre>
          </div>
        </div>

        <div className="en-controls">
          <button className="en-icon-btn" onClick={reset}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
          </button>

          <button className="en-icon-btn" onClick={stepBack} disabled={index === 0}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.971 4.285A2 2 0 0 1 21 6v12a2 2 0 0 1-3.029 1.715l-9.997-5.998a2 2 0 0 1-.003-3.432z" /><path d="M3 20V4" /></svg>
          </button>

          <button className="en-play-btn" onClick={togglePlay}>
            {playing ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0a0a0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="14" y="3" width="5" height="18" rx="1" /><rect x="5" y="3" width="5" height="18" rx="1" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0a0a0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" /></svg>
            )}
          </button>

          <button className="en-icon-btn" onClick={stepForward} disabled={false}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 4v16" /><path d="M6.029 4.285A2 2 0 0 0 3 6v12a2 2 0 0 0 3.029 1.715l9.997-5.998a2 2 0 0 0 .003-3.432z" /></svg>
          </button>

          <input
            className="en-input"
            type="text"
            placeholder="value"
            value={inputValue}
            onChange={(e) => {
              setInputValue(Number(e.target.value))
            }}
          />

          <div className="en-speed">
            <span>SPEED</span>
            <input type="range" min="1" max="10" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
          </div>

          <span className="en-steps">
            {index + 1} / {steps.length}
          </span>
        </div>

        <div className="en-stats">
          <span>
            elements: <b>{elements.length}</b>
          </span>
        </div>
      </div>
    </div>
  )
}

export default Enqueue;
