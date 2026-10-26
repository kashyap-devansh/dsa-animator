import { Fragment, useEffect, useState } from "react";
import { useAutoAdvance } from "../../../shared/useAutoAdvance";
import { ResetIcon, StepBackIcon, PlayIcon, PauseIcon, StepForwardIcon, MoveRightIcon } from "../../../shared/icons";
import "./DeleteFromPosition.css";

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
    <span className="dfp-type">void</span> deleteFromPosition
    <span className="dfp-symbol">(</span>
    <span className="dfp-type">Node*&nbsp;</span> head
    <span className="dfp-symbol">,</span>{" "}
    <span className="dfp-type">int</span> position
    <span className="dfp-symbol">)</span>{" "}
    <span className="dfp-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;
    <span className="dfp-keyword">if</span>{" "}
    <span className="dfp-symbol">(</span>position{" "}
    <span className="dfp-symbol">==</span>{" "}
    <span className="dfp-number">0</span>
    <span className="dfp-symbol">)</span>{" "}
    <span className="dfp-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;
    <span className="dfp-type">Node*</span> temp{" "}
    <span className="dfp-symbol">=</span> head
    <span className="dfp-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;
    head <span className="dfp-symbol">=</span> head
    <span className="dfp-symbol">-&gt;</span>next
    <span className="dfp-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;
    <span className="dfp-keyword">delete</span> temp
    <span className="dfp-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;
    <span className="dfp-keyword">return</span>
    <span className="dfp-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;
    <span className="dfp-symbol">{"}"}</span>
  </>,

  <>
    &nbsp;&nbsp;
    <span className="dfp-type">Node*</span> temp{" "}
    <span className="dfp-symbol">=</span> head
    <span className="dfp-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;
    <span className="dfp-keyword">for</span>{" "}
    <span className="dfp-symbol">(</span>
    <span className="dfp-type">int</span> i{" "}
    <span className="dfp-symbol">=</span> 0;
    {" "}i <span className="dfp-symbol">&lt;</span> position - 1;
    {" "}i<span className="dfp-symbol">++</span>
    <span className="dfp-symbol">)</span>{" "}
    <span className="dfp-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;
    temp <span className="dfp-symbol">=</span> temp
    <span className="dfp-symbol">-&gt;</span>next
    <span className="dfp-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;
    <span className="dfp-symbol">{"}"}</span>
  </>,

  <>
    &nbsp;&nbsp;
    <span className="dfp-type">Node*</span> nodeToDelete{" "}
    <span className="dfp-symbol">=</span> temp
    <span className="dfp-symbol">-&gt;</span>next
    <span className="dfp-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;
    temp<span className="dfp-symbol">-&gt;</span>next{" "}
    <span className="dfp-symbol">=</span>{" "}
    nodeToDelete<span className="dfp-symbol">-&gt;</span>next
    <span className="dfp-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;
    <span className="dfp-keyword">delete</span> nodeToDelete
    <span className="dfp-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;
    <span className="dfp-keyword">return</span>
    <span className="dfp-symbol">;</span>
  </>,

  <>
    <span className="dfp-symbol">{"}"}</span>
  </>,
];

const DeleteFromPosition = () => {
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

  useAutoAdvance({ playing, index, setIndex, setPlaying, speed, stepsLength: steps.length });

  return (
    <div className="delete-from-position-wrapper">
      <div className="delete-from-position">
        <p className="dfp-eyebrow">linked list</p>
        <h1 className="dfp-title">Delete From Position</h1>

        <div className="dfp-header">
          <p className="dfp-blurb">
            Traverse to the desired position, then adjust the links to bypass the node and delete it.
          </p>

          <div className="dfp-complexity">
            <div>
              <div className="dfp-complexity-label">time</div>
              <div className="dfp-time-value">O(n)</div>
            </div>
            <div>
              <div className="dfp-complexity-label">space</div>
              <div className="dfp-space-value">O(1)</div>
            </div>
          </div>
        </div>

        <div className="dfp-grid">
          <div className="dfp-stage">
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
                                color: (current.phase === "done") && index === prevPosition ? "#b4ff39" : current.phase === "traversing" && current.active === index ? "#ff6a3d" : undefined,
                                borderColor: (current.phase === "done") && index === prevPosition ? "#b4ff39" : current.phase === "traversing" && current.active === index ? "#ff6a3d" : undefined,
                                transform: current.phase === "linking" && index === prevPosition + 1 ? "translateY(-100px)" : ""
                              }}
                            >
                              <div className="data">{value}</div>
                            </div>
                            <span
                              className="arrow"
                              style={{
                                color: (current.phase === "done") && index === prevPosition ? "#b4ff39" : current.phase === "traversing" && current.active === index ? "#ff6a3d" : undefined,
                              }}
                            > <MoveRightIcon /> </span>
                          </div>

                          {
                            current.active === index && (current.phase === "deleting" || current.phase === "traversing" || current.phase === "deleted") && (
                              <span
                                className="head"
                                style={{
                                  transform: "translateY(30px)"
                                }}
                              >TEMP</span>
                            )
                          }
                        </div>
                      </Fragment>
                    );
                  })
                }
                <div className="null node">NULL</div>
              </div>
            </div>
            <p className="dfp-status">{current.description}</p>
          </div>

          <div className="dfp-code-panel">
            <div className="dfp-code-header">
              <div className="dfp-dummy-btns">
                <span className="dfp-red-btn"></span>
                <span className="dfp-yellow-btn"></span>
                <span className="dfp-green-btn"></span>
                <span className="dfp-filename">delete_from_position.cpp</span>
              </div>
              <span className="dfp-header-complexity">O(n)</span>
            </div>

            <pre className="dfp-code-block">
              {
                CodeLines.map((line, i) => (
                  <div
                    key={i}
                    className={`dfp-code-line ${current.codeLine === i + 1 ? "dfp-code-line-active" : ""}`}
                  >
                    <span className="dfp-line-no">{i + 1}</span>
                    {line}
                  </div>
                ))
              }
            </pre>
          </div>
        </div>

        <div className="dfp-controls">
          <button
            className="dfp-icon-btn"
            onClick={reset}
            style={{
              transform: "translateY(-70px)"
            }}
          >
            <ResetIcon />
          </button>

          <button
            className="dfp-icon-btn"
            onClick={stepBack}
            disabled={index === 0}
            style={{
              transform: "translateY(-70px)"
            }}
          >
            <StepBackIcon />
          </button>

          <button
            className="dfp-play-btn"
            onClick={togglePlay}
            style={{
              transform: "translateY(-70px)"
            }}
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>

          <button
            className="dfp-icon-btn"
            onClick={stepForward}
            disabled={false}
            style={{
              transform: "translateY(-70px)"
            }}
          >
            <StepForwardIcon />
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

          <div className="dfp-speed">
            <span>SPEED</span>
            <input type="range" min="1" max="10" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
          </div>

          <span className="dfp-steps">
            {index + 1} / {steps.length}
          </span>
        </div>

        <div
          className="dfp-stats"
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
