import { Fragment, useEffect, useState } from "react";
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
      },
      {
        id: 3,
        value: 30,
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
        <h1 className="iap-title">Insert At Tail</h1>

        <div className="iap-header">
          <p className="iap-blurb">
            Traverse to the last node, then connect the new node at the end.
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
                                      color: current.phase === "linking" || current.phase === "linking" || current.phase === "done" ? "#b4ff39" : ""
                                    }}
                                  ><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-move-right-icon lucide-move-right"><path d="M18 8L22 12L18 16" /><path d="M2 12H22" /></svg></span>
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
                          > <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-move-right-icon lucide-move-right"><path d="M18 8L22 12L18 16" /><path d="M2 12H22" /></svg> </span>
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

export default InsertAtPosition;
