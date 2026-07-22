import { Fragment, useEffect, useState } from "react";
import "./DeleteFromHead.css";

function linkedListSteps(existingList = []) {
  const list = [...existingList];
  const steps = [];

  function save(codeLine, description, phase, active = -1) {
    steps.push({
      list: [...list],
      phase,
      codeLine,
      description,
      active,
      length: list.length,
    });
  }

  save(1, list.length ? "Current Linked List." : "Linked List is empty", "idle");

  if (list.length === 0) {
    save(2, "Nothing to delete.", "done");
    return steps;
  }

  const deletedValue = list[0];

  save(2, `Store current head node (${deletedValue})`, "selected", 0);

  save(3, `Move head to next node`, "shifted", 1);

  list.shift();

  save(4, `Delete old head node (${deletedValue})`, "deleted", list.length ? 0 : -1);

  save(5, "Deletion completed.", "done", list.length ? 0 : -1);

  return steps;
}

const CodeLines = [
  <>
    <span className="iah-type">void</span> deleteFromHead
    <span className="iah-symbol">(</span>
    <span className="iah-type">Node*&nbsp;</span> head
    <span className="iah-symbol">)</span>{" "}
    <span className="iah-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;
    <span className="iah-keyword">if</span>
    <span className="iah-symbol">(</span>head{" "}
    <span className="iah-symbol">==</span>{" "}
    <span className="iah-keyword">nullptr</span>
    <span className="iah-symbol">)</span>{" "}
    <span className="iah-keyword">return</span>
    <span className="iah-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;
    <span className="iah-type">Node*</span> temp{" "}
    <span className="iah-symbol">=</span> head
    <span className="iah-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;
    head <span className="iah-symbol">=</span> head
    <span className="iah-symbol">-&gt;</span>next
    <span className="iah-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;
    <span className="iah-keyword">delete</span> temp
    <span className="iah-symbol">;</span>
  </>,

  <>
    <span className="iah-symbol">{"}"}</span>
  </>,
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

const DeleteFromHead = () => {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(5);

  const [nodes, setNodes] = useState([
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
  ]);

  const steps = linkedListSteps(nodes.map(node => node.value));

  const current = steps[index];

  const reset = () => {
    setPlaying(false);
    setIndex(0);
    setNodes([
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
    ]);
  };

  const stepForward = () => {
    setPlaying(false);

    if (nodes.length === 0) {
      reset();
      return;
    }

    if (index < steps.length - 1) {
      setIndex(index + 1);
    }
  };

  const stepBack = () => {
    setPlaying(false);
    if (index > 0) setIndex(index - 1);
  };

  const togglePlay = () => {
    if (nodes.length === 0) {
      reset();
      return;
    }
    if (index === steps.length - 1) setIndex(0);

    setPlaying(!playing);
  };

  useEffect(() => {
    if (current.phase === "done") {
      const timer = setTimeout(() => {
        setNodes(prev => prev.slice(1));
        setIndex(0);
        setPlaying(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [current.phase]);

  useEffect(() => {
    if (!playing) return;

    const timer = setTimeout(() => {
      if (index < steps.length - 1) {
        setIndex(prev => prev + 1);
      } else {
        setPlaying(false);
      }
    }, SpeedDelay[speed]);

    return () => clearTimeout(timer);
  }, [playing, index, speed, steps.length]);

  return (
    <div className="insert-at-head-wrapper">
      <div className="insert-at-head">
        <p className="iah-eyebrow">linked list</p>
        <h1 className="iah-title">Delete From Head</h1>

        <div className="iah-header">
          <p className="iah-blurb">
            Head moves to the next node, then the old head node is deleted.
          </p>

          <div className="iah-complexity">
            <div>
              <div className="iah-complexity-label">time</div>
              <div className="iah-time-value">O(1)</div>
            </div>
            <div>
              <div className="iah-complexity-label">space</div>
              <div className="iah-space-value">O(1)</div>
            </div>
          </div>
        </div>

        <div className="iah-grid">
          <div className="iah-stage">
            <div className="linked-list-container">
              <div className="linked-list">
                {
                  current.list.map((value, index) => (
                    <div
                      className="node-wrapper"
                      key={index}
                    >
                      {index === 0 ? <span
                        className="head"
                        style={{
                          color: current.phase === "done" ? "#b4ff39" : "",
                        }}
                      >HEAD</span> : null}

                      <div className="node-row">
                        <div className="node">
                          <div className="data">{value}</div>
                        </div>
                        <span
                          className="arrow"
                          style={{
                            color: current.phase === "done" && index === 0 ? "#b4ff39" : "",
                          }}
                        > <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-move-right-icon lucide-move-right"><path d="M18 8L22 12L18 16" /><path d="M2 12H22" /></svg> </span>
                      </div>

                      {
                        index === 0 && (current.phase === "selected" || current.phase === "shifted" || current.phase === "deleted") && (
                          <span
                            className="head"
                            style={{
                              transform: "translateY(30px)"
                            }}
                          >TEMP</span>
                        )
                      }
                    </div>
                  ))
                }
                <div className="null node">NULL</div>
              </div>
            </div>
            <p className="iah-status">{current.description}</p>
          </div>

          <div className="iah-code-panel">
            <div className="iah-code-header">
              <div className="iah-dummy-btns">
                <span className="iah-red-btn"></span>
                <span className="iah-yellow-btn"></span>
                <span className="iah-green-btn"></span>
                <span className="iah-filename">insert_at_head.cpp</span>
              </div>
              <span className="iah-header-complexity">O(1)</span>
            </div>

            <pre className="iah-code-block">
              {CodeLines.map((line, i) => (
                <div
                  key={i}
                  className={`iah-code-line ${current.codeLine === i + 1 ? "iah-code-line-active" : ""}`}
                >
                  <span className="iah-line-no">{i + 1}</span>
                  {line}
                </div>
              ))}
            </pre>
          </div>
        </div>

        <div className="iah-controls">
          <button className="iah-icon-btn" onClick={reset}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
          </button>

          <button className="iah-icon-btn" onClick={stepBack} disabled={index === 0}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.971 4.285A2 2 0 0 1 21 6v12a2 2 0 0 1-3.029 1.715l-9.997-5.998a2 2 0 0 1-.003-3.432z" /><path d="M3 20V4" /></svg>
          </button>

          <button className="iah-play-btn" onClick={togglePlay}>
            {playing ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0a0a0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="14" y="3" width="5" height="18" rx="1" /><rect x="5" y="3" width="5" height="18" rx="1" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0a0a0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" /></svg>
            )}
          </button>

          <button className="iah-icon-btn" onClick={stepForward} disabled={false}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 4v16" /><path d="M6.029 4.285A2 2 0 0 0 3 6v12a2 2 0 0 0 3.029 1.715l9.997-5.998a2 2 0 0 0 .003-3.432z" /></svg>
          </button>

          <div className="iah-speed">
            <span>SPEED</span>
            <input type="range" min="1" max="10" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
          </div>

          <span className="iah-steps">
            {index + 1} / {steps.length}
          </span>
        </div>

        <div className="iah-stats">
          <span>
            nodes: <b>{nodes.length}</b>
          </span>
        </div>
      </div>
    </div>
  );
};

export default DeleteFromHead;
