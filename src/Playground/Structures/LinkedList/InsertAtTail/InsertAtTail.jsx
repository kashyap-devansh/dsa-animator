import { useEffect, useState } from "react";
import { useAutoAdvance } from "../../../shared/useAutoAdvance";
import { ResetIcon, StepBackIcon, PlayIcon, PauseIcon, StepForwardIcon, MoveRightIcon } from "../../../shared/icons";
import "./InsertAtTail.css";

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

  if (list.length === 0) {
    save(3, "Check if list is empty", "checking");

    list.push(input);

    save(4, `Head points to ${input}`, "placed", 0);

    save(5, "Return from function", "done", 0);
  }
  else {
    save(7, "Initialize temp = head", "traversing", 0);

    for (let i = 0; i < list.length - 1; i++) {
      save(8, `Check while condition`, "traversing", i);
      save(9, `Traverse to node ${list[i + 1]}`, "traversing", i + 1);
    }

    save(11, `Tail node points to new node ${input}`, "linked", list.length - 1);

    list.push(input);

    save(12, `Insertion completed.`, "done", list.length - 1);
  }
  return steps;
}

const CodeLines = [
  <>
    <span className="iat-type">void</span> insertAtTail
    <span className="iat-symbol">(</span>
    <span className="iat-type">Node*&nbsp;</span> head<span className="iat-symbol">,</span>{" "}
    <span className="iat-type">int</span> data
    <span className="iat-symbol">)</span>{" "}
    <span className="iat-symbol">{"{"}</span>
  </>,
  <>
    &nbsp;&nbsp;
    <span className="iat-type">Node*</span> newNode{" "}
    <span className="iat-symbol">=</span>{" "}
    <span className="iat-keyword">new</span>{" "}
    Node<span className="iat-symbol">(</span>data<span className="iat-symbol">)</span>
    <span className="iat-symbol">;</span>
  </>,
  <>
    &nbsp;&nbsp;
    <span className="iat-keyword">if</span>{" "}
    <span className="iat-symbol">(</span>head{" "}
    <span className="iat-symbol">==</span>{" "}
    <span className="iat-keyword">nullptr</span>
    <span className="iat-symbol">)</span>{" "}
    <span className="iat-symbol">{"{"}</span>
  </>,
  <>
    &nbsp;&nbsp;&nbsp;&nbsp;
    head <span className="iat-symbol">=</span> newNode
    <span className="iat-symbol">;</span>
  </>,
  <>
    &nbsp;&nbsp;&nbsp;&nbsp;
    <span className="iat-keyword">return</span>
    <span className="iat-symbol">;</span>
  </>,
  <>
    &nbsp;&nbsp;
    <span className="iat-symbol">{"}"}</span>
  </>,
  <>
    &nbsp;&nbsp;
    <span className="iat-type">Node*</span> temp{" "}
    <span className="iat-symbol">=</span> head
    <span className="iat-symbol">;</span>
  </>,
  <>
    &nbsp;&nbsp;
    <span className="iat-keyword">while</span>{" "}
    <span className="iat-symbol">(</span>temp
    <span className="iat-symbol">-&gt;</span>next{" "}
    <span className="iat-symbol">!=</span>{" "}
    <span className="iat-keyword">nullptr</span>
    <span className="iat-symbol">)</span>{" "}
    <span className="iat-symbol">{"{"}</span>
  </>,
  <>
    &nbsp;&nbsp;&nbsp;&nbsp;
    temp <span className="iat-symbol">=</span> temp
    <span className="iat-symbol">-&gt;</span>next
    <span className="iat-symbol">;</span>
  </>,
  <>
    &nbsp;&nbsp;
    <span className="iat-symbol">{"}"}</span>
  </>,
  <>
    &nbsp;&nbsp;
    temp<span className="iat-symbol">-&gt;</span>next{" "}
    <span className="iat-symbol">=</span> newNode
    <span className="iat-symbol">;</span>
  </>,
  <>
    &nbsp;&nbsp;
    <span className="iat-keyword">return</span>
    <span className="iat-symbol">;</span>
  </>,
  <>
    <span className="iat-symbol">{"}"}</span>
  </>,
];

const InsertAtTail = () => {
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
        ...prev,
        {
          id: newNode.id,
          value: newNode.value,
        }
      ]);

      setNewNode(null);
      setIndex(0);
      setPlaying(false);
    }
  }, [current.phase]);

  useAutoAdvance({ playing, index, setIndex, setPlaying, speed, stepsLength: steps.length });

  return (
    <div className="insert-at-tail-wrapper">
      <div className="insert-at-tail">
        <p className="iat-eyebrow">linked list</p>
        <h1 className="iat-title">Insert At Tail</h1>

        <div className="iat-header">
          <p className="iat-blurb">
            Traverse to the last node, then connect the new node at the end.
          </p>

          <div className="iat-complexity">
            <div>
              <div className="iat-complexity-label">time</div>
              <div className="iat-time-value">O(n)</div>
            </div>
            <div>
              <div className="iat-complexity-label">space</div>
              <div className="iat-space-value">O(1)</div>
            </div>
          </div>
        </div>

        <div className="iat-grid">
          <div className="iat-stage">
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
                            color: current.phase === "linked" && index === current.list.length - 1 ? "#b4ff39" : current.phase === "traversing" && current.active === index ? "#ff6a3d" : undefined,
                          }}
                        > <MoveRightIcon /> </span>
                      </div>
                    </div>
                  ))
                }
                {
                  newNode && (current.phase === "created" || current.phase === "linked" || current.phase === "traversing") && (
                    <div className="node-wrapper">
                      <span
                        className="head"
                        style={{
                          transform: current.phase !== "linked" ? "translateY(-100px)" : "translateY(0px)",
                        }}
                      >NEW</span>

                      <div className="node-row">
                        <div
                          className="node"
                          style={{
                            transform: current.phase !== "linked" ? "translateY(-100px)" : "translateY(0px)",
                            marginRight: current.phase !== "linked" ? "24px" : "0px",
                            color: current.phase === "linked" ? "#b4ff39" : "#ff6a3d",
                            borderColor: current.phase === "linked" ? "#b4ff39" : "#ff6a3d"
                          }}
                        >
                          <div className="data">{newNode.value}</div>
                        </div>
                        {
                          (current.phase === "linked") && (
                            <span className="arrow"><MoveRightIcon /></span>
                          )
                        }
                      </div>
                    </div>
                  )
                }
                <div
                  className="null node"
                  style={{
                    marginLeft: current.phase === "created" || current.phase === "traversing" ? "-70px" : "0px",

                  }}
                >NULL</div>
              </div>
            </div>
            <p className="iat-status">{current.description}</p>
          </div>

          <div className="iat-code-panel">
            <div className="iat-code-header">
              <div className="iat-dummy-btns">
                <span className="iat-red-btn"></span>
                <span className="iat-yellow-btn"></span>
                <span className="iat-green-btn"></span>
                <span className="iat-filename">insert_at_tail.cpp</span>
              </div>
              <span className="iat-header-complexity">O(n)</span>
            </div>

            <pre className="iat-code-block">
              {
                CodeLines.map((line, i) => (
                  <div
                    key={i}
                    className={`iat-code-line ${current.codeLine === i + 1 ? "iat-code-line-active" : ""}`}
                  >
                    <span className="iat-line-no">{i + 1}</span>
                    {line}
                  </div>
                ))
              }
            </pre>
          </div>
        </div>

        <div className="iat-controls">
          <button className="iat-icon-btn" onClick={reset}>
            <ResetIcon />
          </button>

          <button className="iat-icon-btn" onClick={stepBack} disabled={index === 0}>
            <StepBackIcon />
          </button>

          <button className="iat-play-btn" onClick={togglePlay}>
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>

          <button className="iat-icon-btn" onClick={stepForward} disabled={false}>
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

          <div className="iat-speed">
            <span>SPEED</span>
            <input type="range" min="1" max="10" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
          </div>

          <span className="iat-steps">
            {index + 1} / {steps.length}
          </span>
        </div>

        <div className="iat-stats">
          <span>
            nodes: <b>{nodes.length}</b>
          </span>
        </div>
      </div>
    </div>
  );
};

export default InsertAtTail;
