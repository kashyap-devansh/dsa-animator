import { useState } from "react";
import { randomArray } from "../../../shared/randomArray";
import { usePlayback } from "../../../shared/usePlayback";
import { ResetIcon, StepBackIcon, PlayIcon, PauseIcon, StepForwardIcon, ShuffleIcon } from "../../../shared/icons";
import "./MergeSort.css";

function mergeSortSteps(input) {
  const arr = [...input];
  const steps = [];
  const n = arr.length;

  let comparisons = 0;
  let merges = 0;
  let nodeId = 0;
  let maxDepth = 0;
  const nodes = [];

  function createNode(l, r, depth, parentId) {
    const node = {
      id: nodeId++,
      l,
      r,
      depth,
      parentId,
      status: "active",
    };

    nodes.push(node);
    maxDepth = Math.max(maxDepth, depth);

    return node;
  }

  function cloneNodes() {
    return nodes.map((nd) => ({ ...nd }));
  }

  function save(
    line,
    description,
    range,
    compare,
    placed,
    activeNodeId
  ) {
    steps.push({
      array: [...arr],
      codeLine: line,
      description,
      range: range || [],
      compare: compare || [],
      placed: placed ?? -1,
      merges,
      comparisons,
      callTree: cloneNodes(),
      activeNodeId: activeNodeId ?? -1,
      maxDepth,
    });
  }

  function merge(l, m, r, node) {
    // Line 9
    save(
      9,
      `merge(${l}, ${m}, ${r})`,
      [l, r],
      [],
      -1,
      node.id
    );

    // Line 10
    const temp = [];

    save(
      10,
      "Initialize temp array",
      [l, r],
      [],
      -1,
      node.id
    );

    // Line 11
    let i = l;
    let j = m + 1;

    save(
      11,
      `Initialize i = ${i}, j = ${j}`,
      [l, r],
      [],
      -1,
      node.id
    );

    // Line 12
    while (i <= m && j <= r) {
      save(
        12,
        `Check while condition: i <= ${m} && j <= ${r}`,
        [l, r],
        [],
        -1,
        node.id
      );

      // Line 13
      comparisons++;

      save(
        13,
        `Compare arr[${i}] = ${arr[i]} and arr[${j}] = ${arr[j]}`,
        [l, r],
        [i, j],
        -1,
        node.id
      );

      if (arr[i] <= arr[j]) {
        temp.push(arr[i]);

        save(
          13,
          `arr[${i}] <= arr[${j}], push ${arr[i]} to temp`,
          [l, r],
          [i, j],
          -1,
          node.id
        );

        i++;
      } else {
        // Line 14
        temp.push(arr[j]);

        save(
          14,
          `arr[${i}] > arr[${j}], push ${arr[j]} to temp`,
          [l, r],
          [i, j],
          -1,
          node.id
        );

        j++;
      }
    }

    // Line 15
    save(
      15,
      "First while loop finished",
      [l, r],
      [],
      -1,
      node.id
    );

    // Line 16
    while (i <= m) {
      save(
        16,
        `Check remaining left elements: i <= ${m}`,
        [l, r],
        [i],
        -1,
        node.id
      );

      // Line 17
      temp.push(arr[i]);

      save(
        17,
        `Push remaining left element ${arr[i]} to temp`,
        [l, r],
        [i],
        -1,
        node.id
      );

      i++;
    }

    // Line 18
    save(
      18,
      "Remaining left elements processed",
      [l, r],
      [],
      -1,
      node.id
    );

    // Line 19
    while (j <= r) {
      save(
        19,
        `Check remaining right elements: j <= ${r}`,
        [l, r],
        [j],
        -1,
        node.id
      );

      // Line 20
      temp.push(arr[j]);

      save(
        20,
        `Push remaining right element ${arr[j]} to temp`,
        [l, r],
        [j],
        -1,
        node.id
      );

      j++;
    }

    // Line 21
    save(
      21,
      "Remaining right elements processed",
      [l, r],
      [],
      -1,
      node.id
    );

    // Line 22
    for (let k = l; k <= r; k++) {
      arr[k] = temp[k - l];

      merges++;

      save(
        22,
        `Placed ${arr[k]} at index ${k}`,
        [l, r],
        [],
        k,
        node.id
      );
    }

    // Line 23
    node.status = "done";

    save(
      23,
      `Merge complete for [${l}, ${r}]`,
      [l, r],
      [],
      -1,
      node.id
    );
  }

  function mergeSort(l, r, depth, parentId) {
    // Line 1
    const node = createNode(l, r, depth, parentId);

    save(
      1,
      `mergeSort(${l}, ${r})`,
      [l, r],
      [],
      -1,
      node.id
    );

    // Line 2
    if (l >= r) {
      node.status = "done";

      save(
        2,
        "Base case reached",
        [l, r],
        [],
        -1,
        node.id
      );

      return;
    }

    // Line 3
    const m = l + Math.floor((r - l) / 2);

    save(
      3,
      `Mid index = ${m}`,
      [l, r],
      [],
      -1,
      node.id
    );

    // Line 4
    save(
      4,
      `mergeSort(${l}, ${m})`,
      [l, m],
      [],
      -1,
      node.id
    );

    mergeSort(l, m, depth + 1, node.id);

    // Line 5
    save(
      5,
      `mergeSort(${m + 1}, ${r})`,
      [m + 1, r],
      [],
      -1,
      node.id
    );

    mergeSort(m + 1, r, depth + 1, node.id);

    // Line 6
    save(
      6,
      `merge(${l}, ${m}, ${r})`,
      [l, r],
      [],
      -1,
      node.id
    );

    merge(l, m, r, node);
  }

  // Start
  save(
    1,
    "Started Merge Sort",
    [0, n - 1],
    [],
    -1,
    -1
  );

  mergeSort(0, n - 1, 0, null);

  save(
    1,
    "Array Sorted!",
    [0, n - 1],
    [],
    -1,
    -1
  );

  return steps;
}

const CodeLines = [
  // 1
  <>
    <span className="ms-type">void</span> mergeSort
    <span className="ms-symbol">(</span>
    <span className="ms-type">vector</span>
    <span className="ms-symbol">&lt;</span>
    <span className="ms-type">int</span>
    <span className="ms-symbol">&gt;&amp;</span> arr
    <span className="ms-symbol">,</span>{" "}
    <span className="ms-type">int</span> l
    <span className="ms-symbol">,</span>{" "}
    <span className="ms-type">int</span> r
    <span className="ms-symbol">)</span>{" "}
    <span className="ms-symbol">{"{"}</span>
  </>,

  // 2
  <>
    &nbsp;&nbsp;
    <span className="ms-keyword">if</span>
    <span className="ms-symbol">(</span>
    l <span className="ms-symbol">&gt;=</span> r
    <span className="ms-symbol">)</span>{" "}
    <span className="ms-keyword">return</span>
    <span className="ms-symbol">;</span>
  </>,

  // 3
  <>
    &nbsp;&nbsp;
    <span className="ms-type">int</span> m
    <span className="ms-symbol"> = </span>
    l <span className="ms-symbol">+</span>
    <span className="ms-symbol">(</span>
    r <span className="ms-symbol">-</span> l
    <span className="ms-symbol">)</span>
    <span className="ms-symbol"> / </span>
    <span className="ms-number">2</span>
    <span className="ms-symbol">;</span>
  </>,

  // 4
  <>
    &nbsp;&nbsp;
    mergeSort
    <span className="ms-symbol">(</span>
    arr<span className="ms-symbol">,</span> l
    <span className="ms-symbol">,</span> m
    <span className="ms-symbol">)</span>
    <span className="ms-symbol">;</span>
  </>,

  // 5
  <>
    &nbsp;&nbsp;
    mergeSort
    <span className="ms-symbol">(</span>
    arr<span className="ms-symbol">,</span>{" "}
    m <span className="ms-symbol">+</span>{" "}
    <span className="ms-number">1</span>
    <span className="ms-symbol">,</span> r
    <span className="ms-symbol">)</span>
    <span className="ms-symbol">;</span>
  </>,

  // 6
  <>
    &nbsp;&nbsp;
    merge
    <span className="ms-symbol">(</span>
    arr<span className="ms-symbol">,</span> l
    <span className="ms-symbol">,</span> m
    <span className="ms-symbol">,</span> r
    <span className="ms-symbol">)</span>
    <span className="ms-symbol">;</span>
  </>,

  // 7
  <>
    <span className="ms-symbol">{"}"}</span>
  </>,

  // 8
  <>&nbsp;</>,

  // 9
  <>
    <span className="ms-type">void</span> merge
    <span className="ms-symbol">(</span>
    <span className="ms-type">vector</span>
    <span className="ms-symbol">&lt;</span>
    <span className="ms-type">int</span>
    <span className="ms-symbol">&gt;&amp;</span> arr
    <span className="ms-symbol">,</span>{" "}
    <span className="ms-type">int</span> l
    <span className="ms-symbol">,</span>{" "}
    <span className="ms-type">int</span> m
    <span className="ms-symbol">,</span>{" "}
    <span className="ms-type">int</span> r
    <span className="ms-symbol">)</span>{" "}
    <span className="ms-symbol">{"{"}</span>
  </>,

  // 10
  <>
    &nbsp;&nbsp;
    <span className="ms-type">vector</span>
    <span className="ms-symbol">&lt;</span>
    <span className="ms-type">int</span>
    <span className="ms-symbol">&gt;</span> temp
    <span className="ms-symbol">;</span>
  </>,

  // 11
  <>
    &nbsp;&nbsp;
    <span className="ms-type">int</span> i
    <span className="ms-symbol"> = </span> l
    <span className="ms-symbol">,</span> j
    <span className="ms-symbol"> = </span>
    m <span className="ms-symbol">+</span>{" "}
    <span className="ms-number">1</span>
    <span className="ms-symbol">;</span>
  </>,

  // 12
  <>
    &nbsp;&nbsp;
    <span className="ms-keyword">while</span>
    <span className="ms-symbol">(</span>
    i <span className="ms-symbol">&lt;=</span> m
    <span className="ms-symbol"> &amp;&amp; </span>
    j <span className="ms-symbol">&lt;=</span> r
    <span className="ms-symbol">)</span>
    <span className="ms-symbol">{"{"}</span>
  </>,

  // 13
  <>
    &nbsp;&nbsp;&nbsp;&nbsp;
    <span className="ms-keyword">if</span>
    <span className="ms-symbol">(</span>
    arr<span className="ms-symbol">[</span>i
    <span className="ms-symbol">]</span>
    <span className="ms-symbol"> &lt;= </span>
    arr<span className="ms-symbol">[</span>j
    <span className="ms-symbol">]</span>
    <span className="ms-symbol">)</span>{" "}
    temp<span className="ms-symbol">.</span>
    push_back
    <span className="ms-symbol">(</span>
    arr<span className="ms-symbol">[</span>
    i<span className="ms-symbol">++</span>
    <span className="ms-symbol">]</span>
    <span className="ms-symbol">)</span>
    <span className="ms-symbol">;</span>
  </>,

  // 14
  <>
    &nbsp;&nbsp;&nbsp;&nbsp;
    <span className="ms-keyword">else</span>{" "}
    temp<span className="ms-symbol">.</span>
    push_back
    <span className="ms-symbol">(</span>
    arr<span className="ms-symbol">[</span>
    j<span className="ms-symbol">++</span>
    <span className="ms-symbol">]</span>
    <span className="ms-symbol">)</span>
    <span className="ms-symbol">;</span>
  </>,

  // 15
  <>
    &nbsp;&nbsp;
    <span className="ms-symbol">{"}"}</span>
  </>,

  // 16
  <>
    &nbsp;&nbsp;
    <span className="ms-keyword">while</span>
    <span className="ms-symbol">(</span>
    i <span className="ms-symbol">&lt;=</span> m
    <span className="ms-symbol">)</span>
    <span className="ms-symbol">{"{"}</span>
  </>,

  // 17
  <>
    &nbsp;&nbsp;&nbsp;&nbsp;
    temp<span className="ms-symbol">.</span>
    push_back
    <span className="ms-symbol">(</span>
    arr<span className="ms-symbol">[</span>
    i<span className="ms-symbol">++</span>
    <span className="ms-symbol">]</span>
    <span className="ms-symbol">)</span>
    <span className="ms-symbol">;</span>
  </>,

  // 18
  <>
    &nbsp;&nbsp;
    <span className="ms-symbol">{"}"}</span>
  </>,

  // 19
  <>
    &nbsp;&nbsp;
    <span className="ms-keyword">while</span>
    <span className="ms-symbol">(</span>
    j <span className="ms-symbol">&lt;=</span> r
    <span className="ms-symbol">)</span>
    <span className="ms-symbol">{"{"}</span>
  </>,

  // 20
  <>
    &nbsp;&nbsp;&nbsp;&nbsp;
    temp<span className="ms-symbol">.</span>
    push_back
    <span className="ms-symbol">(</span>
    arr<span className="ms-symbol">[</span>
    j<span className="ms-symbol">++</span>
    <span className="ms-symbol">]</span>
    <span className="ms-symbol">)</span>
    <span className="ms-symbol">;</span>
  </>,

  // 21
  <>
    &nbsp;&nbsp;
    <span className="ms-symbol">{"}"}</span>
  </>,

  // 22
  <>
    &nbsp;&nbsp;
    <span className="ms-keyword">for</span>
    <span className="ms-symbol">(</span>
    <span className="ms-type">int</span> k
    <span className="ms-symbol"> = </span> l
    <span className="ms-symbol">;</span>{" "}
    k <span className="ms-symbol">&lt;=</span> r
    <span className="ms-symbol">;</span>{" "}
    k<span className="ms-symbol">++</span>
    <span className="ms-symbol">)</span>{" "}
    arr<span className="ms-symbol">[</span>k
    <span className="ms-symbol">]</span>
    <span className="ms-symbol"> = </span>
    temp<span className="ms-symbol">[</span>
    k <span className="ms-symbol">-</span> l
    <span className="ms-symbol">]</span>
    <span className="ms-symbol">;</span>
  </>,

  // 23
  <>
    <span className="ms-symbol">{"}"}</span>
  </>,
];

const CELL_W = 46;
const CELL_H = 46;
const LEVEL_GAP = 96;
const PAD_TOP = 10;

const MergeSort = () => {
  const [seed, setSeed] = useState(randomArray());

  const steps = mergeSortSteps(seed);
  const { index, playing, speed, setSpeed, reset, stepForward, stepBack, togglePlay } = usePlayback(steps.length);
  const current = steps[index];
  const isDone = index === steps.length - 1;
  const n = current.array.length;
  const nodes = current.callTree;

  const svgWidth = n * CELL_W;
  const svgHeight = (current.maxDepth + 1) * LEVEL_GAP + CELL_H + PAD_TOP + 10;

  const shuffle = () => {
    setSeed(randomArray());
    reset();
  };

  const nodeBox = (node) => ({
    x0: node.l * CELL_W,
    y0: node.depth * LEVEL_GAP + PAD_TOP,
    width: (node.r - node.l + 1) * CELL_W,
  });

  const cellFill = (idx) => {
    if (idx === current.placed) return "#b4ff39";
    if (current.compare.includes(idx)) return "#ff6a3d";
    return "#f3f2ed";
  };

  return (
    <div className="merge-sort-wrapper">
      <div className="merge-sort">
        <p className="ms-eyebrow">sorting</p>

        <h1 className="ms-title">Merge Sort</h1>

        <div className="ms-header">
          <p className="ms-blurb">
            Divides the array in half, recursively sorts each half, then merges them back together.
          </p>

          <div className="ms-complexity">
            <div>
              <div className="ms-complexity-label">time</div>
              <div className="ms-time-value">O(n log n)</div>
            </div>

            <div>
              <div className="ms-complexity-label">space</div>
              <div className="ms-space-value">O(n)</div>
            </div>
          </div>
        </div>

        <div className="ms-grid">
          <div className="ms-stage">
            <div className="ms-tree-wrap">
              <svg
                className="ms-tree-svg"
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                width={svgWidth}
                height={svgHeight}
              >
                <defs>
                  <marker
                    id="ms-arrowhead"
                    markerWidth="8"
                    markerHeight="8"
                    refX="4"
                    refY="4"
                    orient="auto"
                  >
                    <path d="M0,0 L8,4 L0,8 Z" fill="#7a7a80" />
                  </marker>
                </defs>

                {nodes.map((node) => {
                  const children = nodes
                    .filter((c) => c.parentId === node.id)
                    .sort((a, b) => a.l - b.l);

                  if (children.length === 0) return null;

                  const { x0, y0, width } = nodeBox(node);
                  const fromX = x0 + width / 2;
                  const fromY = y0 + CELL_H;

                  return children.map((child) => {
                    const childBox = nodeBox(child);
                    const toX = childBox.x0 + childBox.width / 2;
                    const toY = childBox.y0;

                    return (
                      <line
                        key={`arrow-${node.id}-${child.id}`}
                        x1={fromX}
                        y1={fromY}
                        x2={toX}
                        y2={toY - 5}
                        stroke="#7a7a80"
                        strokeWidth="1.6"
                        markerEnd="url(#ms-arrowhead)"
                      />
                    );
                  });
                })}

                {nodes.map((node) => {
                  const { x0, y0, width } = nodeBox(node);
                  const isActive = node.id === current.activeNodeId;
                  const isNodeDone = node.status === "done" || isDone;
                  const isLeaf = node.r === node.l;
                  const mid = node.l + Math.floor((node.r - node.l) / 2);
                  const splitX = (mid + 1) * CELL_W;

                  return (
                    <g key={node.id}>
                      <rect
                        x={x0}
                        y={y0}
                        width={width}
                        height={CELL_H}
                        rx="8"
                        fill={isNodeDone ? "rgba(180, 255, 57, 0.08)" : "transparent"}
                        stroke={isNodeDone ? "#b4ff39" : isActive ? "#ff6a3d" : "#33333a"}
                        strokeWidth={isActive ? 2 : 1.4}
                      />

                      {Array.from({ length: node.r - node.l }, (_, k) => node.l + k + 1).map(
                        (divIdx) => (
                          <line
                            key={divIdx}
                            x1={divIdx * CELL_W}
                            y1={y0}
                            x2={divIdx * CELL_W}
                            y2={y0 + CELL_H}
                            stroke="#262629"
                            strokeWidth="1"
                          />
                        )
                      )}

                      {!isNodeDone && !isLeaf && (
                        <line
                          x1={splitX}
                          y1={y0 - 4}
                          x2={splitX}
                          y2={y0 + CELL_H + 4}
                          stroke="#ff6a3d"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      )}

                      {Array.from({ length: node.r - node.l + 1 }, (_, k) => node.l + k).map(
                        (idx) => (
                          <text
                            key={idx}
                            x={idx * CELL_W + CELL_W / 2}
                            y={y0 + CELL_H / 2 + 5}
                            textAnchor="middle"
                            className="ms-tree-value"
                            fill={isNodeDone ? "#b4ff39" : isActive ? cellFill(idx) : "#f3f2ed"}
                          >
                            {current.array[idx]}
                          </text>
                        )
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            <p className="ms-status">{current.description}</p>
          </div>

          <div className="ms-code-panel">
            <div className="ms-code-header">
              <div className="ms-dummy-btns">
                <span className="ms-red-btn"></span>
                <span className="ms-yellow-btn"></span>
                <span className="ms-green-btn"></span>
                <span className="ms-filename">merge_sort.cpp</span>
              </div>

              <span className="ms-header-complexity">O(n log n)</span>
            </div>

            <pre className="ms-code-block">
              {
                CodeLines.map((line, i) => {
                  return (
                    <div
                      key={i}
                      className={`ms-code-line ${current.codeLine === i + 1 ? "ms-code-line-active" : ""}`}
                    >
                      <span className="ms-line-no">{i + 1}</span>
                      {line}
                    </div>
                  );
                })
              }
            </pre>
          </div>
        </div>

        <div className="ms-controls">
          <button className="ms-icon-btn" onClick={reset}>
            <ResetIcon />
          </button>

          <button
            className="ms-icon-btn"
            onClick={stepBack}
            disabled={index === 0}
          >
            <StepBackIcon />
          </button>

          <button className="ms-play-btn" onClick={togglePlay}>
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>

          <button
            className="ms-icon-btn"
            onClick={stepForward}
            disabled={index === steps.length - 1}
          >
            <StepForwardIcon />
          </button>

          <button className="ms-shuffle-btn" onClick={shuffle}>
            <ShuffleIcon />
            Shuffle
          </button>

          <div className="ms-speed">
            <span>SPEED</span>

            <input
              type="range"
              min="1"
              max="10"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
          </div>

          <span className="ms-steps">
            {index + 1} / {steps.length}
          </span>
        </div>

        <div className="ms-stats">
          <span>
            comparisons: <b>{current.comparisons}</b>
          </span>

          <span>
            merges: <b>{current.merges}</b>
          </span>
        </div>
      </div>
    </div>
  );
};

export default MergeSort;
