import { Fragment, useEffect, useState } from "react";
import "../InsertAtPosition/InsertAtPosition.css";

function linkedListSteps(position = null, existingList = []) {
  const list = [...existingList];
  const steps = [];

  if (list.length === 0) {
    steps.push({
      list: [],
      value: null,
      position: 0,
      phase: "idle",
      codeLine: 1,
      description: "Linked List is empty",
      active: -1,
      length: 0,
    });
    return steps;
  }

  if (position === null) {
    position = Math.floor(list.length / 2);
  }

  position = Math.max(0, Math.min(position, list.length - 1));

  function save(codeLine, description, phase, active = -1) {
    steps.push({
      list: [...list],
      value: list[position],
      position,
      phase,
      codeLine,
      description,
      active,
      length: list.length,
    });
  }

  save(1, "Current Linked List", "idle");

  if (position === 0) {
    save(2, "Check if deleting head", "checking", 0);

    save(3, "Store head in temp", "linking", 0);

    save(4, "Move head to next node", "linking", 1);

    list.shift();

    save(5, "Delete old head node", "deleted", 0);

    save(6, "Return from function", "done");
    return steps;
  }

  save(8, "Initialize temp = head", "traversing", 0);

  for (let i = 0; i < position - 1; i++) {
    save(9, "Traverse to next node", "traversing", i);
    save(10, `Move to node ${list[i + 1]}`, "traversing", i + 1);
  }

  save(12, "Store node to delete", "linking", position);

  save(13, "Link previous node to next node", "linking", position - 1);

  list.splice(position, 1);

  save(14, `Deleted node at position ${position}`, "done", position);
  save(15, "Return from function", "done");

  return steps;
}

const CodeLines = [
  <>
    <span className="iap-type">void</span> deleteFromPosition
    <span className="iap-symbol">(</span>
    <span className="iap-type">Node*&nbsp;</span> head
    <span className="iap-symbol">,</span>{" "}
    <span className="iap-type">int</span> position
    <span className="iap-symbol">)</span>{" "}
    <span className="iap-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;
    <span className="iap-keyword">if</span>{" "}
    <span className="iap-symbol">(</span>position{" "}
    <span className="iap-symbol">==</span>{" "}
    <span className="iap-number">0</span>
    <span className="iap-symbol">)</span>{" "}
    <span className="iap-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;
    <span className="iap-type">Node*</span> temp{" "}
    <span className="iap-symbol">=</span> head
    <span className="iap-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;
    head <span className="iap-symbol">=</span> head
    <span className="iap-symbol">-&gt;</span>next
    <span className="iap-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;
    <span className="iap-keyword">delete</span> temp
    <span className="iap-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;
    <span className="iap-keyword">return</span>
    <span className="iap-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;
    <span className="iap-symbol">{"}"}</span>
  </>,

  <>
    &nbsp;&nbsp;
    <span className="iap-type">Node*</span> temp{" "}
    <span className="iap-symbol">=</span> head
    <span className="iap-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;
    <span className="iap-keyword">for</span>{" "}
    <span className="iap-symbol">(</span>
    <span className="iap-type">int</span> i{" "}
    <span className="iap-symbol">=</span> 0;
    {" "}i <span className="iap-symbol">&lt;</span> position - 1;
    {" "}i<span className="iap-symbol">++</span>
    <span className="iap-symbol">)</span>{" "}
    <span className="iap-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;
    temp <span className="iap-symbol">=</span> temp
    <span className="iap-symbol">-&gt;</span>next
    <span className="iap-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;
    <span className="iap-symbol">{"}"}</span>
  </>,

  <>
    &nbsp;&nbsp;
    <span className="iap-type">Node*</span> nodeToDelete{" "}
    <span className="iap-symbol">=</span> temp
    <span className="iap-symbol">-&gt;</span>next
    <span className="iap-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;
    temp<span className="iap-symbol">-&gt;</span>next{" "}
    <span className="iap-symbol">=</span>{" "}
    nodeToDelete<span className="iap-symbol">-&gt;</span>next
    <span className="iap-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;
    <span className="iap-keyword">delete</span> nodeToDelete
    <span className="iap-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;
    <span className="iap-keyword">return</span>
    <span className="iap-symbol">;</span>
  </>,

  <>
    <span className="iap-symbol">{"}"}</span>
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

const DeleteFromPosition = () => {
  const [inputValue, setInputValue] = useState("");
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(5);
  const [position, setPosition] = useState(null);

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
    }
  ]);

  const steps = linkedListSteps(position, nodes.map(node => node.value));

  const current = steps[index];

  const reset = () => {
    setPlaying(false);
    setIndex(0);
    setInputValue("");
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
      }
    ]);
  };

  const stepForward = () => {
    setPlaying(false);
    if (index < steps.length - 1) {
      setIndex(index + 1);
    }
  };

  const stepBack = () => {
    setPlaying(false);
    if (index > 0) setIndex(index - 1);
  };

  const togglePlay = () => {
    if (index === steps.length - 1) setIndex(0);

    setPlaying(!playing);
  };

  useEffect(() => {
    if (current.phase === "done") {
      const timer = setTimeout(() => {
        setNodes(prev => {
          return [
            ...prev.slice(0, current.position),
            ...prev.slice(current.position + 1)
          ];
        });
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
    <div className="insert-at-position-wrapper">
      <div className="insert-at-position">
        <p className="iap-eyebrow">linked list</p>
        <h1 className="iap-title">Insert At Position</h1>

        <div className="iap-header">
          <p className="iap-blurb">
            Traverse to the desired position, then connect the new node in between.
          </p>

          <div className="iap-complexity">
            <div>
              <div className="iap-complexity-label">time</div>
              <div className="iap-time-value">O(n)</div>
            </div>
            <div>
              <div className="iap-complexity-label">space</div>
              <div className="iap-space-value">O(1)</div>
            </div>
          </div>
        </div>

        <div className="iap-grid">
          <div className="iap-stage">
            <div className="linked-list-container">
              <div className="linked-list">
                {
                  current.list.map((value, index) => {
                    const prevPosition = current.position > 0 ? current.position - 1 : 0;

                    return (
                      <Fragment key={index}>
                        <div
                          className="node-wrapper"
                        >
                          {index === 0 ? <span className="head">HEAD</span> : null}

                          <div className="node-row">
                            <div
                              className="node"
                              style={{
                                color: current.phase === "traversing" && current.active === index ? "#ff6a3d" : undefined,
                                borderColor: current.phase === "traversing" && current.active === index ? "#ff6a3d" : undefined,
                              }}
                            >
                              <div className="data">{value}</div>
                            </div>
                            <span
                              className="arrow"
                              style={{
                                color: (current.phase === "done") && index === prevPosition ? "#b4ff39" : current.phase === "traversing" && current.active === index ? "#ff6a3d" : undefined,
                              }}
                            > <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-move-right-icon lucide-move-right"><path d="M18 8L22 12L18 16" /><path d="M2 12H22" /></svg> </span>
                          </div>
                        </div>
                      </Fragment>
                    );
                  })
                }
                <div className="null node">NULL</div>
              </div>
            </div>
            <p className="iap-status">{current.description}</p>
          </div>

          <div className="iap-code-panel">
            <div className="iap-code-header">
              <div className="iap-dummy-btns">
                <span className="iap-red-btn"></span>
                <span className="iap-yellow-btn"></span>
                <span className="iap-green-btn"></span>
                <span className="iap-filename">insert_at_tail.cpp</span>
              </div>
              <span className="iap-header-complexity">O(n)</span>
            </div>

            <pre className="iap-code-block">
              {
                CodeLines.map((line, i) => (
                  <div
                    key={i}
                    className={`iap-code-line ${current.codeLine === i + 1 ? "iap-code-line-active" : ""}`}
                  >
                    <span className="iap-line-no">{i + 1}</span>
                    {line}
                  </div>
                ))
              }
            </pre>
          </div>
        </div>

        <div className="iap-controls">
          <button
            className="iap-icon-btn"
            onClick={reset}
            style={{
              transform: "translateY(-70px)"
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
          </button>

          <button
            className="iap-icon-btn"
            onClick={stepBack}
            disabled={index === 0}
            style={{
              transform: "translateY(-70px)"
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.971 4.285A2 2 0 0 1 21 6v12a2 2 0 0 1-3.029 1.715l-9.997-5.998a2 2 0 0 1-.003-3.432z" /><path d="M3 20V4" /></svg>
          </button>

          <button
            className="iap-play-btn"
            onClick={togglePlay}
            style={{
              transform: "translateY(-70px)"
            }}
          >
            {playing ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0a0a0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="14" y="3" width="5" height="18" rx="1" /><rect x="5" y="3" width="5" height="18" rx="1" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0a0a0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" /></svg>
            )}
          </button>

          <button
            className="iap-icon-btn"
            onClick={stepForward}
            disabled={false}
            style={{
              transform: "translateY(-70px)"
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 4v16" /><path d="M6.029 4.285A2 2 0 0 0 3 6v12a2 2 0 0 0 3.029 1.715l9.997-5.998a2 2 0 0 0 .003-3.432z" /></svg>
          </button>

          <input
            className="bis-input"
            type="number"
            placeholder="value"
            value={position}
            onChange={(e) => {
              setPosition(Number(e.target.value))
            }}
            style={{
              transform: "translateY(-70px)"
            }}
          />

          <div className="iap-speed">
            <span>SPEED</span>
            <input type="range" min="1" max="10" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
          </div>

          <span className="iap-steps">
            {index + 1} / {steps.length}
          </span>
        </div>

        <div
          className="iap-stats"
          style={{
            transform: "translateY(-70px)"
          }}
        >
          <span>
            nodes: <b>{nodes.length}</b>
          </span>
        </div>
      </div>
    </div>
  );
};

export default DeleteFromPosition;
