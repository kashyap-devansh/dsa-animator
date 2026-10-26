import { useEffect, useState } from "react";
import { useAutoAdvance } from "../../../shared/useAutoAdvance";
import { ResetIcon, StepBackIcon, PlayIcon, PauseIcon, StepForwardIcon, MoveRightIcon } from "../../../shared/icons";
import "./InsertAtHead.css";

function linkedListSteps(input, existingList = []) {
  const list = [...existingList];
  const steps = [];

  function save(codeLine, description, phase, active = -1) {
    steps.push({
      list: [...list],
      value: input,
      phase,
      codeLine,
      description,
      active,
      length: list.length,
    });
  }

  save(1, list.length ? "Current Linked List." : "Linked List is empty", "idle");

  save(2, `Create new node with value ${input}`, "created");

  save(3, `Point new node to current head`, "linked");

  list.unshift(input);

  save(4, `Move head to ${input}`, "placed", 0);

  save(5, `Insertion completed.`, "done");

  return steps;
}

const CodeLines = [
  <>
    <span className="iah-type">void</span> insertAtHead
    <span className="iah-symbol">(</span>
    <span className="iah-type">Node*&nbsp;</span> head<span className="iah-symbol">,</span>{" "}
    <span className="iah-type">int</span> data
    <span className="iah-symbol">)</span>{" "}
    <span className="iah-symbol">{"{"}</span>
  </>,
  <>
    &nbsp;&nbsp;
    <span className="iah-type">Node*</span> newNode{" "}
    <span className="iah-symbol">=</span>{" "}
    <span className="iah-keyword">new</span>{" "}
    Node<span className="iah-symbol">(</span>data<span className="iah-symbol">)</span>
    <span className="iah-symbol">;</span>
  </>,
  <>
    &nbsp;&nbsp;
    newNode<span className="iah-symbol">-&gt;</span>next{" "}
    <span className="iah-symbol">=</span> head
    <span className="iah-symbol">;</span>
  </>,
  <>
    &nbsp;&nbsp;
    head <span className="iah-symbol">=</span> newNode
    <span className="iah-symbol">;</span>
  </>,
  <>
    &nbsp;&nbsp;
    <span className="iah-keyword">return</span>
    <span className="iah-symbol">;</span>
  </>,
  <>
    <span className="iah-symbol">{"}"}</span>
  </>,
];

const InsertAtHead = () => {
  const [inputValue, setInputValue] = useState("");
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(5);

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

  const steps = linkedListSteps(
    newNode ? newNode.value : "",
    nodes.map(node => node.value)
  );

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
      setNodes(prev => [
        { id: newNode.id, value: newNode.value },
        ...prev,
      ]);

      setNewNode(null);
      setIndex(0);
      setPlaying(false);
    }
  }, [current.phase]);

  useAutoAdvance({ playing, index, setIndex, setPlaying, speed, stepsLength: steps.length });

  return (
    <div className="insert-at-head-wrapper">
      <div className="insert-at-head">
        <p className="iah-eyebrow">linked list</p>
        <h1 className="iah-title">Insert At Head</h1>

        <div className="iah-header">
          <p className="iah-blurb">
            New node points to the old head, then head moves to the new node.
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
                  newNode && (current.phase === "created" || current.phase === "linked") && (
                    <div className="node-wrapper">
                      <span className="head">NEW</span>

                      <div className="node-row">
                        <div
                          className="node"
                          style={{
                            marginRight: current.phase !== "linked" ? "24px" : "0px",
                            color: current.phase === "linked" ? "#b4ff39" : "#ff6a3d",
                            borderColor: current.phase === "linked" ? "#b4ff39" : "#ff6a3d"
                          }}
                        >
                          <div className="data">{newNode.value}</div>
                        </div>
                        {
                          (current.phase === "linked") && (
                            <span className="arrow"><MoveRightIcon color="#b4ff39" /></span>
                          )
                        }
                      </div>
                    </div>
                  )
                }
                {
                  current.list.map((value, index) => (
                    <div
                      className="node-wrapper"
                      key={index}
                    >
                      {index === 0 ? <span className="head">HEAD</span> : null}

                      <div className="node-row">
                        <div className="node">
                          <div className="data">{value}</div>
                        </div>
                        <span className="arrow"> <MoveRightIcon /> </span>
                      </div>
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
            <ResetIcon />
          </button>

          <button className="iah-icon-btn" onClick={stepBack} disabled={index === 0}>
            <StepBackIcon />
          </button>

          <button className="iah-play-btn" onClick={togglePlay}>
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>

          <button className="iah-icon-btn" onClick={stepForward} disabled={false}>
            <StepForwardIcon />
          </button>

          <input
            className="bis-input"
            type="number"
            placeholder="value"
            value={inputValue}
            onChange={(e) => {
              setInputValue(Number(e.target.value))
            }}
          />

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

export default InsertAtHead;
