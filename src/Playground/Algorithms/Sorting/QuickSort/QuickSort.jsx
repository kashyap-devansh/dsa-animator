import { useState } from "react";
import { randomArray } from "../../../shared/randomArray";
import { usePlayback } from "../../../shared/usePlayback";
import { ResetIcon, StepBackIcon, PlayIcon, PauseIcon, StepForwardIcon, ShuffleIcon } from "../../../shared/icons";
import "./QuickSort.css";

const CodeMeanings = {
  1: "Sort the subarray from index l to r.",
  2: "If the range has 0 or 1 elements, it's already sorted — stop.",
  4: "Partition the subarray around a pivot and get its final index p.",
  6: "Recursively sort everything left of the pivot.",
  7: "Recursively sort everything right of the pivot.",
  11: "Pick the last element as the pivot.",
  12: "i marks the last position known to hold a value ≤ pivot; start just before l.",
  14: "Scan j across the subarray, checking each element against the pivot.",
  15: "If the current element belongs in the left (≤ pivot) partition...",
  16: "...advance i to make room for it in the left partition...",
  17: "...and swap it into that position.",
  21: "Move the pivot right after the ≤-pivot region — its final sorted spot.",
  22: "Return the pivot's final index so the caller knows where to split.",
};

function quickSortSteps(input) {
  const arr = [...input];
  const steps = [];
  const n = arr.length;

  let comparisons = 0;
  let swaps = 0;
  let partitionsCount = 0;
  let maxDepth = 0;
  let nodeId = 0;
  const nodes = [];

  function createNode(l, r, depth, parentId) {
    const node = { id: nodeId++, l, r, depth, parentId, status: "pending", p: null };
    nodes.push(node);
    maxDepth = Math.max(maxDepth, depth);
    return node;
  }

  function cloneNodes() {
    return nodes.map((nd) => ({ ...nd }));
  }

  function save(opts) {
    const range = opts.range || [];

    steps.push({
      array: [...arr],
      codeLine: opts.line,
      codeMeaning: CodeMeanings[opts.line] || "",
      description: opts.description,
      explanation: opts.explanation || "",
      range,
      compare: opts.compare || [],
      swap: opts.swap || [],
      pivot: opts.pivotIdx ?? -1,
      pivotVal: opts.pivotVal ?? null,
      placed: opts.placed ?? -1,
      l: range.length ? range[0] : null,
      r: range.length ? range[1] : null,
      i: opts.i ?? null,
      j: opts.j ?? null,
      p: opts.p ?? null,
      phase: opts.phase || "",
      comparisons,
      swaps,
      partitions: partitionsCount,
      maxDepth,
      callTree: cloneNodes(),
      activeNodeId: opts.activeNodeId ?? -1,
    });
  }

  function swapArr(a, b) {
    const t = arr[a];
    arr[a] = arr[b];
    arr[b] = t;
  }

  function partition(l, r, node) {
    const pivotVal = arr[r];

    save({
      line: 11,
      range: [l, r],
      pivotIdx: r,
      pivotVal,
      activeNodeId: node.id,
      phase: "pivot",
      description: `Pivot = ${pivotVal} (index ${r})`,
      explanation: `The last element, ${pivotVal}, is chosen as the pivot. Elements ≤ ${pivotVal} will end up on its left, everything greater on its right.`,
    });

    let i = l - 1;

    save({
      line: 12,
      range: [l, r],
      pivotIdx: r,
      pivotVal,
      i,
      activeNodeId: node.id,
      phase: "init-i",
      description: `i = ${i}`,
      explanation: "i tracks the last position known to hold a value ≤ pivot. It starts one before l, since nothing has been classified yet.",
    });

    for (let j = l; j < r; j++) {
      comparisons++;

      save({
        line: 15,
        range: [l, r],
        pivotIdx: r,
        pivotVal,
        i,
        j,
        compare: [j],
        activeNodeId: node.id,
        phase: "compare",
        description: `Compare arr[${j}] = ${arr[j]} with pivot ${pivotVal}`,
        explanation: `j = ${j} is the element being examined. Is ${arr[j]} ≤ ${pivotVal}?`,
      });

      if (arr[j] <= pivotVal) {
        i++;

        save({
          line: 16,
          range: [l, r],
          pivotIdx: r,
          pivotVal,
          i,
          j,
          compare: [j],
          activeNodeId: node.id,
          phase: "advance-i",
          description: `${arr[j]} ≤ ${pivotVal} → i moves forward`,
          explanation: `${arr[j]} belongs in the left partition, so i advances to ${i} to make room for it.`,
        });

        swapArr(i, j);
        swaps++;

        save({
          line: 17,
          range: [l, r],
          pivotIdx: r,
          pivotVal,
          i,
          j,
          swap: [i, j],
          activeNodeId: node.id,
          phase: "swap",
          description: `Swap index ${i} and ${j}`,
          explanation: `Swapping puts ${arr[i]} into the left (≤ pivot) partition at index ${i}.`,
        });
      } else {
        save({
          line: 15,
          range: [l, r],
          pivotIdx: r,
          pivotVal,
          i,
          j,
          compare: [j],
          activeNodeId: node.id,
          phase: "skip",
          description: `${arr[j]} > ${pivotVal} → leave it, continue`,
          explanation: `${arr[j]} is greater than the pivot, so it stays where it is for now.`,
        });
      }
    }

    swapArr(i + 1, r);
    swaps++;
    partitionsCount++;

    save({
      line: 21,
      range: [l, r],
      i,
      p: i + 1,
      swap: [i + 1, r],
      placed: i + 1,
      activeNodeId: node.id,
      phase: "place-pivot",
      description: `Place pivot at index ${i + 1}`,
      explanation: `The pivot swaps into index ${i + 1}, right after the ≤-pivot region. Everything left of it is ≤ pivot, everything right is greater — the pivot is now in its final sorted position.`,
    });

    save({
      line: 22,
      range: [l, r],
      i,
      p: i + 1,
      placed: i + 1,
      activeNodeId: node.id,
      phase: "return-p",
      description: `Return index ${i + 1}`,
      explanation: "The caller uses this index to split the array into a left subarray and a right subarray.",
    });

    return i + 1;
  }

  function quickSort(l, r, depth, parentId) {
    const node = createNode(l, r, depth, parentId);
    node.status = "active";

    save({
      line: 1,
      range: [l, r],
      activeNodeId: node.id,
      phase: "call",
      description: `quickSort(${l}, ${r})`,
      explanation:
        depth === 0
          ? `Sorting the full array from index ${l} to ${r}.`
          : `Recursively sorting the subarray from index ${l} to ${r}.`,
    });

    if (l >= r) {
      node.status = "done";

      save({
        line: 2,
        range: [l, r],
        activeNodeId: node.id,
        phase: "base",
        description: "Base case reached",
        explanation:
          l === r
            ? "A single element is already sorted — nothing to do."
            : "An empty range needs no sorting.",
      });

      return;
    }

    const p = partition(l, r, node);
    node.p = p;

    save({
      line: 4,
      range: [l, r],
      p,
      activeNodeId: node.id,
      phase: "partition-done",
      description: `Partition index p = ${p}`,
      explanation: `The array is now split at index ${p}: [${l}..${p - 1}] ≤ pivot, and [${p + 1}..${r}] > pivot.`,
    });

    save({
      line: 6,
      range: [l, Math.max(l, p - 1)],
      p,
      activeNodeId: node.id,
      phase: "recurse-left",
      description: `Now recursively sort the LEFT subarray [${l}, ${p - 1}]`,
      explanation: "The left partition still needs to be sorted, so quickSort calls itself on it.",
    });

    quickSort(l, p - 1, depth + 1, node.id);

    save({
      line: 7,
      range: [Math.min(r, p + 1), r],
      p,
      activeNodeId: node.id,
      phase: "recurse-right",
      description: `Now recursively sort the RIGHT subarray [${p + 1}, ${r}]`,
      explanation: "Now the right partition gets the same treatment.",
    });

    quickSort(p + 1, r, depth + 1, node.id);

    node.status = "done";

    save({
      line: 8,
      range: [l, r],
      activeNodeId: node.id,
      phase: "call-done",
      description: `quickSort(${l}, ${r}) complete`,
      explanation: "Both halves are sorted and the pivot is placed — this range is fully sorted.",
    });
  }

  save({
    line: 1,
    range: [0, n - 1],
    activeNodeId: -1,
    phase: "start",
    description: "Started Quick Sort",
    explanation: "Quick Sort repeatedly picks a pivot, partitions around it, and recurses on the two sides.",
  });

  quickSort(0, n - 1, 0, null);

  save({
    line: 23,
    range: [0, n - 1],
    activeNodeId: -1,
    phase: "done",
    description: "Array Sorted!",
    explanation:
      "Every pivot has been placed in its final position, and each smaller subarray was recursively sorted — so the whole array is sorted.",
  });

  return steps;
}

const CodeLines = [
  <>
    <span className="qs-type">void</span> quickSort<span className="qs-symbol">(</span><span className="qs-type">vector</span><span className="qs-symbol">&lt;</span><span className="qs-type">int</span><span className="qs-symbol">&gt;&amp;</span> arr<span className="qs-symbol">,</span> <span className="qs-type">int</span> l<span className="qs-symbol">,</span> <span className="qs-type">int</span> r<span className="qs-symbol">)</span> <span className="qs-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="qs-keyword">if</span> <span className="qs-symbol">(</span>l <span className="qs-symbol">&gt;=</span> r<span className="qs-symbol">)</span> <span className="qs-keyword">return</span><span className="qs-symbol">;</span>
  </>,

  <>&nbsp;</>,

  <>
    &nbsp;&nbsp;<span className="qs-type">int</span> p <span className="qs-symbol">=</span> partition<span className="qs-symbol">(</span>arr<span className="qs-symbol">,</span> l<span className="qs-symbol">,</span> r<span className="qs-symbol">)</span><span className="qs-symbol">;</span>
  </>,

  <>&nbsp;</>,

  <>
    &nbsp;&nbsp;quickSort<span className="qs-symbol">(</span>arr<span className="qs-symbol">,</span> l<span className="qs-symbol">,</span> p <span className="qs-symbol">-</span> <span className="qs-number">1</span><span className="qs-symbol">)</span><span className="qs-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;quickSort<span className="qs-symbol">(</span>arr<span className="qs-symbol">,</span> p <span className="qs-symbol">+</span> <span className="qs-number">1</span><span className="qs-symbol">,</span> r<span className="qs-symbol">)</span><span className="qs-symbol">;</span>
  </>,

  <><span className="qs-symbol">{"}"}</span></>,

  <>&nbsp;</>,

  <>
    <span className="qs-type">int</span> partition<span className="qs-symbol">(</span><span className="qs-type">vector</span><span className="qs-symbol">&lt;</span><span className="qs-type">int</span><span className="qs-symbol">&gt;&amp;</span> arr<span className="qs-symbol">,</span> <span className="qs-type">int</span> l<span className="qs-symbol">,</span> <span className="qs-type">int</span> r<span className="qs-symbol">)</span> <span className="qs-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="qs-type">int</span> pivot <span className="qs-symbol">=</span> arr<span className="qs-symbol">[</span>r<span className="qs-symbol">]</span><span className="qs-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="qs-type">int</span> i <span className="qs-symbol">=</span> l <span className="qs-symbol">-</span> <span className="qs-number">1</span><span className="qs-symbol">;</span>
  </>,

  <>&nbsp;</>,

  <>
    &nbsp;&nbsp;<span className="qs-keyword">for</span> <span className="qs-symbol">(</span>
    <span className="qs-type">int</span> j <span className="qs-symbol">=</span> l<span className="qs-symbol">;</span>
    {" "}j <span className="qs-symbol">&lt;</span> r<span className="qs-symbol">;</span>
    {" "}j<span className="qs-symbol">++</span><span className="qs-symbol">)</span> <span className="qs-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;
    <span className="qs-keyword">if</span> <span className="qs-symbol">(</span>arr<span className="qs-symbol">[</span>j<span className="qs-symbol">]</span> <span className="qs-symbol">&lt;=</span> pivot<span className="qs-symbol">)</span> <span className="qs-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;i<span className="qs-symbol">++</span><span className="qs-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;swap<span className="qs-symbol">(</span>arr<span className="qs-symbol">[</span>i<span className="qs-symbol">]</span><span className="qs-symbol">,</span> arr<span className="qs-symbol">[</span>j<span className="qs-symbol">]</span><span className="qs-symbol">)</span><span className="qs-symbol">;</span>
  </>,

  <>&nbsp;&nbsp;&nbsp;&nbsp;<span className="qs-symbol">{"}"}</span></>,

  <>&nbsp;&nbsp;<span className="qs-symbol">{"}"}</span></>,

  <>&nbsp;</>,

  <>
    &nbsp;&nbsp;swap<span className="qs-symbol">(</span>arr<span className="qs-symbol">[</span>i <span className="qs-symbol">+</span> <span className="qs-number">1</span><span className="qs-symbol">]</span><span className="qs-symbol">,</span> arr<span className="qs-symbol">[</span>r<span className="qs-symbol">]</span><span className="qs-symbol">)</span><span className="qs-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="qs-keyword">return</span> i <span className="qs-symbol">+</span> <span className="qs-number">1</span><span className="qs-symbol">;</span>
  </>,

  <><span className="qs-symbol">{"}"}</span></>,
];

const fmt = (v) => (v === null || v === undefined || v === -1 ? "–" : v);

const PARTITION_PHASES = [
  "pivot",
  "init-i",
  "compare",
  "advance-i",
  "swap",
  "skip",
  "place-pivot",
  "return-p",
];

const QuickSort = () => {
  const [seed, setSeed] = useState(randomArray());
  const [beginnerMode, setBeginnerMode] = useState(true);
  const [recursionOpen, setRecursionOpen] = useState(false);

  const steps = quickSortSteps(seed);
  const { index, playing, speed, setSpeed, reset, stepForward, stepBack, togglePlay } = usePlayback(steps.length);
  const current = steps[index];
  const max = Math.max(...current.array);
  const isDone = index === steps.length - 1;
  const n = current.array.length;

  const shuffle = () => {
    setSeed(randomArray());
    reset();
  };

  const markerMap = {};

  if (current.i !== null && current.i >= 0) {
    markerMap[current.i] = markerMap[current.i] ? `${markerMap[current.i]},i` : "i";
  }

  if (current.j !== null && current.j >= 0) {
    markerMap[current.j] = markerMap[current.j] ? `${markerMap[current.j]},j` : "j";
  }

  const markers = Object.entries(markerMap).map(([idx, label]) => ({
    idx: Number(idx),
    label,
  }));

  const isPartitionPhase = PARTITION_PHASES.includes(current.phase);

  let brackets = [];

  if (isPartitionPhase && current.l !== null && current.r !== null) {
    const iVal = current.i !== null ? current.i : current.l - 1;

    brackets = [
      { start: current.l, end: iVal, label: "≤ pivot", cls: "qs-bracket-left" },
      { start: iVal + 1, end: current.r - 1, label: "unprocessed", cls: "qs-bracket-mid" },
      { start: current.r, end: current.r, label: "pivot", cls: "qs-bracket-pivot" },
    ].filter((s) => s.end >= s.start);
  }

  return (
    <div className="quick-sort-wrapper">
      <div className="quick-sort">
        <p className="qs-eyebrow">sorting</p>

        <h1 className="qs-title">Quick Sort</h1>

        <div className="qs-header">
          <p className="qs-blurb">
            Picks a pivot, partitions the array around it, then recursively sorts each side.
          </p>

          <div className="qs-header-right">
            <div className="qs-complexity">
              <div>
                <div className="qs-complexity-label">time</div>
                <div className="qs-time-value">O(n log n)</div>
              </div>

              <div>
                <div className="qs-complexity-label">space</div>
                <div className="qs-space-value">O(log n)</div>
              </div>
            </div>

            <button
              className={`qs-mode-toggle ${beginnerMode ? "qs-mode-on" : ""}`}
              onClick={() => setBeginnerMode(!beginnerMode)}
            >
              Beginner Mode: {beginnerMode ? "ON" : "OFF"}
            </button>
          </div>
        </div>

        <div className="qs-grid">
          <div className="qs-stage">
            <div className="qs-vars">
              <span><b>l</b>{fmt(current.l)}</span>
              <span><b>r</b>{fmt(current.r)}</span>
              <span><b>i</b>{fmt(current.i)}</span>
              <span><b>j</b>{fmt(current.j)}</span>
              <span><b>pivot</b>{fmt(current.pivotVal)}</span>
              <span><b>p</b>{fmt(current.p)}</span>
            </div>

            {beginnerMode && brackets.length > 0 && (
              <div className="qs-partition-brackets">
                {brackets.map((b, bi) => (
                  <div
                    key={bi}
                    className={`qs-bracket ${b.cls}`}
                    style={{
                      left: `${(b.start / n) * 100}%`,
                      width: `${((b.end - b.start + 1) / n) * 100}%`,
                    }}
                  >
                    <span>{b.label}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="qs-bars-area">
              {markers.length > 0 && (
                <div className="qs-index-markers">
                  {markers.map((m) => (
                    <div
                      key={m.idx}
                      className="qs-index-marker"
                      style={{ left: `${((m.idx + 0.5) / n) * 100}%` }}
                    >
                      <span className="qs-marker-label">{m.label}</span>
                      <span className="qs-marker-arrow">↓</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="qs-bars">
                {current.array.map((value, i) => {
                  const inRange = i >= current.range[0] && i <= current.range[1];
                  const isCompare = current.compare.includes(i);
                  const isSwap = current.swap.includes(i);
                  const isPivot = i === current.pivot;
                  const isPlaced = i === current.placed;

                  let color = "#3a3a3f";

                  if (isDone) color = "#b4ff39";
                  else if (isPlaced) color = "#b4ff39";
                  else if (isPivot) color = "#7c8cff";
                  else if (isSwap) color = "#ffbd2e";
                  else if (isCompare) color = "#ff6a3d";
                  else if (inRange) color = "#4a4a52";

                  return (
                    <div
                      key={i}
                      className="qs-bar"
                      style={{
                        height: `${(value / max) * 400 + 6}px`,
                        backgroundColor: color,
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {!isDone && <p className="qs-status">{current.description}</p>}

            {beginnerMode && !isDone && current.explanation && (
              <p className="qs-explanation">{current.explanation}</p>
            )}

            {isDone && (
              <div className="qs-completion">
                <div className="qs-completion-title">Quick Sort Complete</div>
                <p className="qs-completion-text">
                  The array is sorted because every pivot has been placed in its final position, and each
                  smaller subarray was recursively sorted.
                </p>
                <div className="qs-completion-stats">
                  <span>comparisons: <b>{current.comparisons}</b></span>
                  <span>swaps: <b>{current.swaps}</b></span>
                  <span>partitions: <b>{current.partitions}</b></span>
                  <span>max depth: <b>{current.maxDepth}</b></span>
                </div>
              </div>
            )}
          </div>

          <div className="qs-code-panel">
            <div className="qs-code-header">
              <div className="qs-dummy-btns">
                <span className="qs-red-btn"></span>
                <span className="qs-yellow-btn"></span>
                <span className="qs-green-btn"></span>
                <span className="qs-filename">quick_sort.cpp</span>
              </div>

              <span className="qs-header-complexity">O(n log n)</span>
            </div>

            <pre className="qs-code-block">
              {CodeLines.map((line, i) => {
                return (
                  <div
                    key={i}
                    className={`qs-code-line ${current.codeLine === i + 1 ? "qs-code-line-active" : ""}`}
                  >
                    <span className="qs-line-no">{i + 1}</span>
                    {line}
                  </div>
                );
              })}
            </pre>

            {beginnerMode && current.codeMeaning && (
              <div className="qs-code-meaning">
                <span className="qs-code-meaning-label">Meaning</span>
                <p>{current.codeMeaning}</p>
              </div>
            )}
          </div>
        </div>

        {beginnerMode && (
          <div className="qs-recursion-panel">
            <button className="qs-recursion-toggle" onClick={() => setRecursionOpen(!recursionOpen)}>
              Recursion {recursionOpen ? "▾" : "▸"}
            </button>

            {recursionOpen && (
              <div className="qs-recursion-tree">
                {current.callTree.length === 0 && (
                  <p className="qs-recursion-empty">Recursion hasn't started yet.</p>
                )}

                {current.callTree.map((node) => (
                  <div
                    key={node.id}
                    className={`qs-recursion-node ${node.id === current.activeNodeId ? "qs-recursion-active" : ""
                      } ${node.status === "done" ? "qs-recursion-done" : ""}`}
                    style={{ paddingLeft: `${node.depth * 16 + 12}px` }}
                  >
                    QuickSort({node.l}, {node.r})
                    {node.p !== null && (
                      <span className="qs-recursion-p"> — Partition → p = {node.p}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="qs-controls">
          <button className="qs-icon-btn" onClick={reset}>
            <ResetIcon />
          </button>

          <button
            className="qs-icon-btn"
            onClick={stepBack}
            disabled={index === 0}
          >
            <StepBackIcon />
          </button>

          <button className="qs-play-btn" onClick={togglePlay}>
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>

          <button
            className="qs-icon-btn"
            onClick={stepForward}
            disabled={index === steps.length - 1}
          >
            <StepForwardIcon />
          </button>

          <button className="qs-shuffle-btn" onClick={shuffle}>
            <ShuffleIcon />
            Shuffle
          </button>

          <div className="qs-speed">
            <span>SPEED</span>

            <input
              type="range"
              min="1"
              max="10"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
          </div>

          <span className="qs-steps">
            {index + 1} / {steps.length}
          </span>
        </div>

        <div className="qs-legend">
          <span className="qs-legend-item"><span className="qs-legend-dot" style={{ background: "#7c8cff" }}></span>Pivot</span>
          <span className="qs-legend-item"><span className="qs-legend-dot" style={{ background: "#ff6a3d" }}></span>Comparing</span>
          <span className="qs-legend-item"><span className="qs-legend-dot" style={{ background: "#ffbd2e" }}></span>Swapping</span>
          <span className="qs-legend-item"><span className="qs-legend-dot" style={{ background: "#b4ff39" }}></span>Placed</span>
          <span className="qs-legend-item"><span className="qs-legend-dot" style={{ background: "#4a4a52" }}></span>Active range</span>
          <span className="qs-legend-item"><span className="qs-legend-badge">i</span>Left boundary</span>
          <span className="qs-legend-item"><span className="qs-legend-badge">j</span>Scan pointer</span>
        </div>

        <div className="qs-stats">
          <span>comparisons: <b>{current.comparisons}</b></span>
          <span>swaps: <b>{current.swaps}</b></span>
          <span>partitions: <b>{current.partitions}</b></span>
          <span>max depth: <b>{current.maxDepth}</b></span>
        </div>
      </div>
    </div>
  );
};

export default QuickSort;
