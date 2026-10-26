import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "./BST.css";

function randomValues(count = 11) {
  const values = new Set();

  while (values.size < count) {
    values.add(Math.floor(Math.random() * 90) + 10);
  }

  return Array.from(values);
}

function buildFinalTree(values) {
  let idCounter = 0;
  let root = null;

  function insert(node, value, parentId) {
    if (node === null) {
      idCounter++;
      return { id: idCounter, value, left: null, right: null, parentId };
    }

    if (value < node.value) {
      node.left = insert(node.left, value, node.id);
    } else if (value > node.value) {
      node.right = insert(node.right, value, node.id);
    }

    return node;
  }

  for (const value of values) {
    root = insert(root, value, null);
  }

  return root;
}

function assignPositions(root) {
  const positions = {};
  let cursor = 0;

  function walk(node, depth) {
    if (!node) return;

    walk(node.left, depth + 1);
    positions[node.id] = { x: cursor, depth };
    cursor++;
    walk(node.right, depth + 1);
  }

  walk(root, 0);

  return positions;
}

function bstInsertSteps(values, positions) {
  const steps = [];

  let idCounter = 0;
  let root = null;
  let comparisons = 0;
  let inserts = 0;

  function snapshot() {
    const nodes = [];

    (function walk(node) {
      if (!node) return;

      const pos = positions[node.id];

      nodes.push({
        id: node.id,
        value: node.value,
        parentId: node.parentId,
        x: pos.x,
        depth: pos.depth,
      });

      walk(node.left);
      walk(node.right);
    })(root);

    return nodes;
  }

  function save(line, description, activeId, newId = null) {
    steps.push({
      nodes: snapshot(),
      codeLine: line,
      description,
      activeId,
      newId,
      comparisons,
      inserts,
    });
  }

  save(1, "Started BST Insert", null);

  for (const value of values) {
    if (root === null) {
      idCounter++;
      root = { id: idCounter, value, left: null, right: null, parentId: null };
      inserts++;
      save(3, `Insert ${value} as root`, null, idCounter);
      continue;
    }

    let node = root;

    while (true) {
      comparisons++;
      save(5, `Compare ${value} with ${node.value}`, node.id);

      if (value < node.value) {
        if (node.left === null) {
          idCounter++;
          node.left = { id: idCounter, value, left: null, right: null, parentId: node.id };
          inserts++;
          save(6, `${value} < ${node.value} — insert left`, node.id, idCounter);
          break;
        }

        save(6, `${value} < ${node.value} — go left`, node.id);
        node = node.left;
      } else if (value > node.value) {
        if (node.right === null) {
          idCounter++;
          node.right = { id: idCounter, value, left: null, right: null, parentId: node.id };
          inserts++;
          save(8, `${value} > ${node.value} — insert right`, node.id, idCounter);
          break;
        }

        save(8, `${value} > ${node.value} — go right`, node.id);
        node = node.right;
      } else {
        save(9, `${value} already in tree — skip`, node.id);
        break;
      }
    }
  }

  save(11, "Tree Complete!", null);

  return steps;
}

const CodeLines = [
  <>
    <span className="bt-type">Node*</span> insert<span className="bt-symbol">(</span><span className="bt-type">Node*</span> root<span className="bt-symbol">,</span> <span className="bt-type">int</span> val<span className="bt-symbol">)</span> <span className="bt-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="bt-keyword">if</span> <span className="bt-symbol">(</span>root <span className="bt-symbol">==</span> <span className="bt-keyword">nullptr</span><span className="bt-symbol">)</span> <span className="bt-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;<span className="bt-keyword">return</span> <span className="bt-keyword">new</span> Node<span className="bt-symbol">(</span>val<span className="bt-symbol">)</span><span className="bt-symbol">;</span>
  </>,

  <>&nbsp;&nbsp;<span className="bt-symbol">{"}"}</span></>,

  <>
    &nbsp;&nbsp;<span className="bt-keyword">if</span> <span className="bt-symbol">(</span>val <span className="bt-symbol">{"<"}</span> root<span className="bt-symbol">-&gt;</span>val<span className="bt-symbol">)</span> <span className="bt-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;root<span className="bt-symbol">-&gt;</span>left <span className="bt-symbol">=</span> insert<span className="bt-symbol">(</span>root<span className="bt-symbol">-&gt;</span>left<span className="bt-symbol">,</span> val<span className="bt-symbol">)</span><span className="bt-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="bt-symbol">{"}"}</span> <span className="bt-keyword">else if</span> <span className="bt-symbol">(</span>val <span className="bt-symbol">{">"}</span> root<span className="bt-symbol">-&gt;</span>val<span className="bt-symbol">)</span> <span className="bt-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;root<span className="bt-symbol">-&gt;</span>right <span className="bt-symbol">=</span> insert<span className="bt-symbol">(</span>root<span className="bt-symbol">-&gt;</span>right<span className="bt-symbol">,</span> val<span className="bt-symbol">)</span><span className="bt-symbol">;</span>
  </>,

  <>&nbsp;&nbsp;<span className="bt-symbol">{"}"}</span></>,

  <>
    &nbsp;&nbsp;<span className="bt-keyword">return</span> root<span className="bt-symbol">;</span>
  </>,

  <><span className="bt-symbol">{"}"}</span></>,
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

const BST = () => {
  const [seed, setSeed] = useState(randomValues());
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(5);

  const finalRoot = buildFinalTree(seed);
  const positions = assignPositions(finalRoot);
  const steps = bstInsertSteps(seed, positions);
  const current = steps[index];

  const positionList = Object.values(positions);
  const maxX = Math.max(...positionList.map((p) => p.x), 0);
  const maxDepth = Math.max(...positionList.map((p) => p.depth), 0);

  const unitX = 64;
  const unitY = 76;
  const padding = 40;
  const width = (maxX + 1) * unitX + padding * 2;
  const height = (maxDepth + 1) * unitY + padding * 2;

  const nodeById = Object.fromEntries(current.nodes.map((n) => [n.id, n]));

  useEffect(() => {
    if (!playing || index >= steps.length - 1) {
      if (index >= steps.length - 1) {
        setPlaying(false);
      }
      return;
    }

    const timer = setTimeout(() => setIndex((i) => i + 1), SpeedDelay[speed]);

    return () => clearTimeout(timer);
  }, [playing, index, speed, steps.length]);

  const reset = () => {
    setPlaying(false);
    setIndex(0);
  };

  const shuffle = () => {
    setSeed(randomValues());
    reset();
  };

  const stepForward = () => {
    setPlaying(false);

    if (index < steps.length - 1) {
      setIndex(index + 1);
    }
  };

  const stepBack = () => {
    setPlaying(false);

    if (index > 0) {
      setIndex(index - 1);
    }
  };

  const togglePlay = () => {
    if (index === steps.length - 1) {
      setIndex(0);
    }

    setPlaying(!playing);
  };

  return (
    <div className="bst-wrapper">
      <div className="bst">
        <p className="bt-eyebrow">searching</p>

        <h1 className="bt-title">Binary Search Tree</h1>

        <div className="bt-header">
          <p className="bt-blurb">
            Each insert compares against a node and steps left or right until an empty spot opens up.
          </p>

          <div className="bt-complexity">
            <div>
              <div className="bt-complexity-label">time (avg)</div>
              <div className="bt-time-value">O(log n)</div>
            </div>

            <div>
              <div className="bt-complexity-label">time (worst)</div>
              <div className="bt-worst-value">O(n)</div>
            </div>

            <div>
              <div className="bt-complexity-label">space</div>
              <div className="bt-space-value">O(n)</div>
            </div>
          </div>
        </div>

        <div className="bt-grid">
          <div className="bt-stage">
            <svg
              className="bt-tree"
              viewBox={`0 0 ${width} ${height}`}
              xmlns="http://www.w3.org/2000/svg"
            >
              {current.nodes.map((node) => {
                if (node.parentId === null) return null;

                const parent = nodeById[node.parentId];
                if (!parent) return null;

                const x1 = parent.x * unitX + padding;
                const y1 = parent.depth * unitY + padding;
                const x2 = node.x * unitX + padding;
                const y2 = node.depth * unitY + padding;

                return (
                  <line
                    key={`edge-${node.id}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#262629"
                    strokeWidth="2"
                  />
                );
              })}

              {current.nodes.map((node) => {
                const cx = node.x * unitX + padding;
                const cy = node.depth * unitY + padding;

                const isActive = current.activeId === node.id;
                const isNew = current.newId === node.id;

                let fill = "#1c1c1f";
                let stroke = "#3a3a3f";

                if (isNew) {
                  stroke = "#b4ff39";
                  fill = "#1c2612";
                } else if (isActive) {
                  stroke = "#ff6a3d";
                  fill = "#26160f";
                }

                return (
                  <motion.g key={node.id}>
                    <circle cx={cx} cy={cy} r="22" fill={fill} stroke={stroke} strokeWidth="2" />
                    <text
                      x={cx}
                      y={cy + 5}
                      textAnchor="middle"
                      fontFamily="JetBrains Mono, monospace"
                      fontSize="13"
                      fill="#f3f2ed"
                    >
                      {node.value}
                    </text>
                  </motion.g>
                );
              })}
            </svg>

            <p className="bt-status">{current.description}</p>
          </div>

          <div className="bt-code-panel">
            <div className="bt-code-header">
              <div className="bt-dummy-btns">
                <span className="bt-red-btn"></span>
                <span className="bt-yellow-btn"></span>
                <span className="bt-green-btn"></span>
                <span className="bt-filename">bst_insert.cpp</span>
              </div>

              <span className="bt-header-complexity">O(log n)</span>
            </div>

            <pre className="bt-code-block">
              {CodeLines.map((line, i) => {
                return (
                  <div
                    key={i}
                    className={`bt-code-line ${current.codeLine === i + 1 ? "bt-code-line-active" : ""}`}
                  >
                    <span className="bt-line-no">{i + 1}</span>
                    {line}
                  </div>
                );
              })}
            </pre>
          </div>
        </div>

        <div className="bt-controls">
          <button className="bt-icon-btn" onClick={reset}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
          </button>

          <button className="bt-icon-btn" onClick={stepBack} disabled={index === 0}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.971 4.285A2 2 0 0 1 21 6v12a2 2 0 0 1-3.029 1.715l-9.997-5.998a2 2 0 0 1-.003-3.432z" /><path d="M3 20V4" /></svg>
          </button>

          <button className="bt-play-btn" onClick={togglePlay}>
            {playing ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0a0a0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="14" y="3" width="5" height="18" rx="1" /><rect x="5" y="3" width="5" height="18" rx="1" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0a0a0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" /></svg>
            )}
          </button>

          <button className="bt-icon-btn" onClick={stepForward} disabled={index === steps.length - 1}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 4v16" /><path d="M6.029 4.285A2 2 0 0 0 3 6v12a2 2 0 0 0 3.029 1.715l9.997-5.998a2 2 0 0 0 .003-3.432z" /></svg>
          </button>

          <button className="bt-shuffle-btn" onClick={shuffle}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 14 4 4-4 4" /><path d="m18 2 4 4-4 4" /><path d="M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22" /><path d="M2 6h1.972a4 4 0 0 1 3.6 2.2" /><path d="M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45" /></svg>
            Shuffle
          </button>

          <div className="bt-speed">
            <span>SPEED</span>
            <input
              type="range"
              min="1"
              max="10"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
          </div>

          <span className="bt-steps">
            {index + 1} / {steps.length}
          </span>
        </div>

        <div className="bt-stats">
          <span>
            comparisons: <b>{current.comparisons}</b>
          </span>

          <span>
            inserts: <b>{current.inserts}</b>
          </span>
        </div>
      </div>
    </div>
  );
};

export default BST;
