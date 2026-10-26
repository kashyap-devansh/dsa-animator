import { useEffect, useState } from "react";
import { useAutoAdvance } from "../../../shared/useAutoAdvance";
import { ResetIcon, StepBackIcon, PlayIcon, PauseIcon, StepForwardIcon, MoveRightIcon } from "../../../shared/icons";
import "./DeleteFromTail.css";

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
    save(2, "Check if list is empty", "checking");
    save(3, "Nothing to delete", "done");
    return steps;
  }

  save(5, "Check if only one node exists", "checking");

  if (list.length === 1) {
    save(6, `Delete node ${list[0]}`, "deleting", 0);

    list.pop();

    save(7, "Head becomes nullptr", "done");
    return steps;
  }

  save(9, "Initialize temp = head", "traversing", 0);

  for (let i = 0; i < list.length - 2; i++) {
    save(11, "Check while condition", "traversing", i);
    save(12, `Traverse to node ${list[i + 1]}`, "traversing", i + 1);
  }

  save(14, `Delete tail node ${list[list.length - 1]}`, "deleting", list.length - 1);

  list.pop();

  save(15, "Set previous node next = nullptr", "linked", list.length - 1);

  save(16, "Deletion completed", "done", list.length - 1);

  return steps;
}

const CodeLines = [
  <>
    <span className="dft-type">void</span> deleteFromTail
    <span className="dft-symbol">(</span>
    <span className="dft-type">Node*&nbsp;</span> head
    <span className="dft-symbol">)</span>{" "}
    <span className="dft-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;
    <span className="dft-keyword">if</span>{" "}
    <span className="dft-symbol">(</span>head{" "}
    <span className="dft-symbol">==</span>{" "}
    <span className="dft-keyword">nullptr</span>
    <span className="dft-symbol">)</span>{" "}
    <span className="dft-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;
    <span className="dft-keyword">return</span>
    <span className="dft-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;
    <span className="dft-symbol">{"}"}</span>
  </>,

  <>
    &nbsp;&nbsp;
    <span className="dft-keyword">if</span>{" "}
    <span className="dft-symbol">(</span>head
    <span className="dft-symbol">-&gt;</span>next{" "}
    <span className="dft-symbol">==</span>{" "}
    <span className="dft-keyword">nullptr</span>
    <span className="dft-symbol">)</span>{" "}
    <span className="dft-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;
    <span className="dft-keyword">delete</span> head
    <span className="dft-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;
    head <span className="dft-symbol">=</span>{" "}
    <span className="dft-keyword">nullptr</span>
    <span className="dft-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;
    <span className="dft-keyword">return</span>
    <span className="dft-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;
    <span className="dft-symbol">{"}"}</span>
  </>,

  <>
    &nbsp;&nbsp;
    <span className="dft-type">Node*</span> temp{" "}
    <span className="dft-symbol">=</span> head
    <span className="dft-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;
    <span className="dft-keyword">while</span>{" "}
    <span className="dft-symbol">(</span>temp
    <span className="dft-symbol">-&gt;</span>next
    <span className="dft-symbol">-&gt;</span>next{" "}
    <span className="dft-symbol">!=</span>{" "}
    <span className="dft-keyword">nullptr</span>
    <span className="dft-symbol">)</span>{" "}
    <span className="dft-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;
    temp <span className="dft-symbol">=</span> temp
    <span className="dft-symbol">-&gt;</span>next
    <span className="dft-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;
    <span className="dft-symbol">{"}"}</span>
  </>,

  <>
    &nbsp;&nbsp;
    <span className="dft-keyword">delete</span>{" "}
    temp<span className="dft-symbol">-&gt;</span>next
    <span className="dft-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;
    temp<span className="dft-symbol">-&gt;</span>next{" "}
    <span className="dft-symbol">=</span>{" "}
    <span className="dft-keyword">nullptr</span>
    <span className="dft-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;
    <span className="dft-keyword">return</span>
    <span className="dft-symbol">;</span>
  </>,

  <>
    <span className="dft-symbol">{"}"}</span>
  </>,
];

const DeleteFromTail = () => {
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
    }
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
        setNodes(prev => prev.slice(0, -1));
        setIndex(0);
        setPlaying(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [current.phase]);

  useAutoAdvance({ playing, index, setIndex, setPlaying, speed, stepsLength: steps.length });

  return (
    <div className="delete-from-tail-wrapper">
      <div className="delete-from-tail">
        <p className="dft-eyebrow">linked list</p>
        <h1 className="dft-title">Delete From Tail</h1>

        <div className="dft-header">
          <p className="dft-blurb">
            Traverse to the second-last node, then remove the last node.
          </p>

          <div className="dft-complexity">
            <div>
              <div className="dft-complexity-label">time</div>
              <div className="dft-time-value">O(n)</div>
            </div>
            <div>
              <div className="dft-complexity-label">space</div>
              <div className="dft-space-value">O(1)</div>
            </div>
          </div>
        </div>

        <div className="dft-grid">
          <div className="dft-stage">
            <div className="linked-list-container">
              <div className="linked-list">
                {
                  current.list.map((value, index) => (
                    <div
                      className="node-wrapper"
                      key={index}
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
                            color: current.phase === "traversing" && current.active === index ? "#ff6a3d" : current.phase === "done" && index === current.list.length - 1 ? "#b4ff39" : "",
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
                  ))
                }
                <div className="null node">NULL</div>
              </div>
            </div>
            <p className="dft-status">{current.description}</p>
          </div>

          <div className="dft-code-panel">
            <div className="dft-code-header">
              <div className="dft-dummy-btns">
                <span className="dft-red-btn"></span>
                <span className="dft-yellow-btn"></span>
                <span className="dft-green-btn"></span>
                <span className="dft-filename">insert_at_tail.cpp</span>
              </div>
              <span className="dft-header-complexity">O(n)</span>
            </div>

            <pre className="dft-code-block">
              {
                CodeLines.map((line, i) => (
                  <div
                    key={i}
                    className={`dft-code-line ${current.codeLine === i + 1 ? "dft-code-line-active" : ""}`}
                  >
                    <span className="dft-line-no">{i + 1}</span>
                    {line}
                  </div>
                ))
              }
            </pre>
          </div>
        </div>

        <div className="dft-controls">
          <button
            className="dft-icon-btn"
            onClick={reset}
            style={{
              transform: "translateY(-120px)"
            }}

          >
            <ResetIcon />
          </button>

          <button
            className="dft-icon-btn"
            onClick={stepBack}
            disabled={index === 0}
            style={{
              transform: "translateY(-120px)"
            }}

          >
            <StepBackIcon />
          </button>

          <button
            className="dft-play-btn"
            onClick={togglePlay}
            style={{
              transform: "translateY(-120px)"
            }}

          >
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>

          <button
            className="dft-icon-btn"
            onClick={stepForward}
            disabled={false}
            style={{
              transform: "translateY(-120px)"
            }}

          >
            <StepForwardIcon />
          </button>

          <div className="dft-speed">
            <span>SPEED</span>
            <input type="range" min="1" max="10" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
          </div>

          <span className="dft-steps">
            {index + 1} / {steps.length}
          </span>
        </div>

        <div
          className="dft-stats"
          style={{
            transform: "translateY(-120px)"
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

export default DeleteFromTail;
