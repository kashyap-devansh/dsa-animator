import { Fragment, useEffect, useState } from "react";
import { useAutoAdvance } from "../../../shared/useAutoAdvance";
import { ResetIcon, StepBackIcon, PlayIcon, PauseIcon, StepForwardIcon, MoveRightIcon } from "../../../shared/icons";
import "./InsertAtPosition.css";

function linkedListSteps(input, position = null, existingList = []) {
  const list = [...existingList];
  const steps = [];

  if (position === null) {
    position = Math.floor(list.length / 2);
  }

  position = Math.max(0, Math.min(position, list.length));

  function save(codeLine, description, phase, active = -1) {
    steps.push({
      list: [...list],
      value: input,
      position,
      phase,
      codeLine,
      description,
      active,
      length: list.length,
    });
  }

  save(1, list.length ? "Current Linked List." : "Linked List is empty", "idle");

  save(2, `Create new node with value ${input}`, "created");

  if (position === 0) {
    save(3, "Check if inserting at head", "checking");
    save(4, `New node points to head`, "linking", 0);

    list.unshift(input);

    save(5, `New node becomes head`, "placed", 0);
    save(6, "Return from function", "done", 0);
    return steps;
  }

  save(8, "Initialize temp = head", "traversing", 0);

  for (let i = 0; i < position - 1; i++) {
    save(9, "Traverse to next node", "traversing", i);
    save(10, `Move to node ${list[i + 1]}`, "traversing", i + 1);
  }

  save(12, "New node points to temp->next", "linking", position - 1);

  save(13, "temp->next points to new node", "linking", position - 1);

  list.splice(position, 0, input);

  save(14, `Inserted ${input} at position ${position}`, "done", position);

  return steps;
}

const CodeLines = [
  <>
    <span className="iap-type">void</span> insertAtPosition
    <span className="iap-symbol">(</span>
    <span className="iap-type">Node*&nbsp;</span> head
    <span className="iap-symbol">,</span>{" "}
    <span className="iap-type">int</span> data
    <span className="iap-symbol">,</span>{" "}
    <span className="iap-type">int</span> position
    <span className="iap-symbol">)</span>{" "}
    <span className="iap-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;
    <span className="iap-type">Node*</span> newNode{" "}
    <span className="iap-symbol">=</span>{" "}
    <span className="iap-keyword">new</span>{" "}
    Node<span className="iap-symbol">(</span>data<span className="iap-symbol">)</span>
    <span className="iap-symbol">;</span>
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
    newNode<span className="iap-symbol">-&gt;</span>next{" "}
    <span className="iap-symbol">=</span> head
    <span className="iap-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;
    head <span className="iap-symbol">=</span> newNode
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
    newNode<span className="iap-symbol">-&gt;</span>next{" "}
    <span className="iap-symbol">=</span>{" "}
    temp<span className="iap-symbol">-&gt;</span>next
    <span className="iap-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;
    temp<span className="iap-symbol">-&gt;</span>next{" "}
    <span className="iap-symbol">=</span>{" "}
    newNode
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

const InsertAtPosition = () => {
  const [inputValue, setInputValue] = useState("");
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(5);
  const [position, setPosition] = useState(null);

  const [newNode, setNewNode] = useState(null);
  const [nodes, setNodes] = useState([
    {
      id: 1,
      value: 10,
    },
    {
      id: 2,
      value: 20,
    }
  ]);

  const steps = linkedListSteps(newNode ? newNode.value : "", position, nodes.map(node => node.value));

  const current = steps[index];

  const reset = () => {
    setPlaying(false);
    setIndex(0);
    setNewNode(null);
    setInputValue("");
    setNodes([
      {
        id: 1,
        value: 10,
      },
      {
        id: 2,
        value: 20,
      }
    ]);
  };

  const stepForward = () => {
    setPlaying(false);
    if (index < steps.length - 1) {
      if (!newNode) {
        setNewNode({
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

    if (!newNode) {
      setNewNode({
        id: Date.now(),
        value: inputValue === "" || isNaN(Number(inputValue)) ? Math.floor(Math.random() * 99) : Number(inputValue),
      });
    }
    setPlaying(!playing);
  };

  useEffect(() => {
    if (current.phase === "done" && newNode) {
      setNodes(prev => {
        const updated = [...prev];
        updated.splice(current.position, 0, {
          id: newNode.id,
          value: newNode.value
        });
        return updated;
      });

      setNewNode(null);
      setIndex(0);
      setPlaying(false);
    }
  }, [current.phase]);

  useAutoAdvance({ playing, index, setIndex, setPlaying, speed, stepsLength: steps.length });

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
                  current.list.map((value, index) => (
                    <Fragment key={index}>
                      {
                        current.position === index && newNode && (current.phase === "created" || current.phase === "linking" || current.phase === "traversing") && (
                          <div className="node-wrapper">
                            <span
                              className="head"
                              style={{
                                transform: current.phase !== "linked" ? "translateY(-100px)" : "translateY(0px)",
                                color: current.phase === "linking" ? "#b4ff39" : "#ff6a3d",
                              }}
                            >NEW</span>

                            <div className="node-row">
                              <div
                                className="node"
                                style={{
                                  transform: current.phase !== "linked" ? "translateY(-100px)" : "translateY(0px)",
                                  marginRight: current.phase !== "linked" ? "24px" : "0px",
                                  color: current.phase === "linking" ? "#b4ff39" : "#ff6a3d",
                                  borderColor: current.phase === "linking" ? "#b4ff39" : "#ff6a3d"
                                }}
                              >
                                <div className="data">{newNode.value}</div>
                              </div>
                              {
                                (current.phase === "linked" || current.phase === "linking" || current.phase === "done") && (
                                  <span className="arrow"
                                    style={{
                                      color: current.phase === "linked" || current.phase === "linking" || current.phase === "done" ? "#b4ff39" : ""
                                    }}
                                  ><MoveRightIcon /></span>
                                )
                              }
                            </div>
                          </div>
                        )
                      }
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
                              color: (current.phase === "linked" || current.phase === "done") && index === current.list.length - 1 ? "#b4ff39" : current.phase === "traversing" && current.active === index ? "#ff6a3d" : undefined,
                            }}
                          > <MoveRightIcon /> </span>
                        </div>
                      </div>
                    </Fragment>
                  ))
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
            <ResetIcon />
          </button>

          <button
            className="iap-icon-btn"
            onClick={stepBack}
            disabled={index === 0}
            style={{
              transform: "translateY(-70px)"
            }}
          >
            <StepBackIcon />
          </button>

          <button
            className="iap-play-btn"
            onClick={togglePlay}
            style={{
              transform: "translateY(-70px)"
            }}
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>

          <button
            className="iap-icon-btn"
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

export default InsertAtPosition;
