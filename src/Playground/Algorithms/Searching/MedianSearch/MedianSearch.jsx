import { useState } from "react";
import { motion } from "framer-motion";
import { randomArray } from "../../../shared/randomArray";
import { usePlayback } from "../../../shared/usePlayback";
import { ResetIcon, StepBackIcon, PlayIcon, PauseIcon, StepForwardIcon, ShuffleIcon } from "../../../shared/icons";
import "./MedianSearch.css";

function quickSelectSteps(input) {
  const arr = [...input];
  const n = arr.length;
  const k = Math.floor((n - 1) / 2);
  const steps = [];

  let comparisons = 0;
  let swaps = 0;

  function save(line, description, opts = {}) {
    steps.push({
      array: [...arr],
      codeLine: line,
      description,
      range: opts.range || [0, n - 1],
      pivot: opts.pivot ?? -1,
      compare: opts.compare ?? -1,
      swap: opts.swap || [],
      foundIdx: opts.foundIdx ?? -1,
      k,
      comparisons,
      swaps,
    });
  }

  function swapArr(a, b) {
    const t = arr[a];
    arr[a] = arr[b];
    arr[b] = t;
  }

  function partition(l, r) {
    const pivot = arr[r];
    save(10, `Pivot = ${pivot} (index ${r})`, { range: [l, r], pivot: r });

    let i = l - 1;
    save(11, `i starts at ${i}`, { range: [l, r], pivot: r });

    for (let j = l; j < r; j++) {
      comparisons++;

      if (arr[j] <= pivot) {
        i++;
        swapArr(i, j);
        swaps++;
        save(13, `${arr[i]} ≤ ${pivot} — swap into index ${i}`, { range: [l, r], pivot: r, compare: j, swap: [i, j] });
      } else {
        save(13, `${arr[j]} > ${pivot} — leave it, continue`, { range: [l, r], pivot: r, compare: j });
      }
    }

    swapArr(i + 1, r);
    swaps++;
    save(14, `Place pivot at index ${i + 1}`, { range: [l, r], pivot: i + 1, swap: [i + 1, r] });

    save(15, `Return partition index ${i + 1}`, { range: [l, r], pivot: i + 1 });

    return i + 1;
  }

  function quickSelect(l, r) {
    save(1, `quickSelect(${l}, ${r}) — looking for rank k = ${k}`, { range: [l, r] });

    if (l === r) {
      save(2, `Single element left — index ${l} is the answer`, { range: [l, r], foundIdx: l });
      return l;
    }

    const p = partition(l, r);

    save(3, `Partition index p = ${p}`, { range: [l, r], pivot: p });

    if (k === p) {
      save(4, `k == p — median found at index ${p}`, { range: [l, r], pivot: p, foundIdx: p });
      return p;
    }

    if (k < p) {
      save(5, `k < p — recurse into the left half [${l}, ${p - 1}]`, { range: [l, p - 1], pivot: p });
      return quickSelect(l, p - 1);
    }

    save(6, `k > p — recurse into the right half [${p + 1}, ${r}]`, { range: [p + 1, r], pivot: p });
    return quickSelect(p + 1, r);
  }

  quickSelect(0, n - 1);

  return steps;
}

const CodeLines = [
  <>
    <span className="mds-type">int</span> quickSelect
    <span className="mds-symbol">(</span><span className="mds-type">vector</span><span className="mds-symbol">&lt;</span><span className="mds-type">int</span><span className="mds-symbol">&gt;&amp;</span> arr<span className="mds-symbol">,</span> <span className="mds-type">int</span> l<span className="mds-symbol">,</span> <span className="mds-type">int</span> r<span className="mds-symbol">,</span> <span className="mds-type">int</span> k<span className="mds-symbol">)</span> <span className="mds-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="mds-keyword">if</span> <span className="mds-symbol">(</span>l <span className="mds-symbol">==</span> r<span className="mds-symbol">)</span> <span className="mds-keyword">return</span> l<span className="mds-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="mds-type">int</span> p <span className="mds-symbol">=</span> partition<span className="mds-symbol">(</span>arr<span className="mds-symbol">,</span> l<span className="mds-symbol">,</span> r<span className="mds-symbol">);</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="mds-keyword">if</span> <span className="mds-symbol">(</span>k <span className="mds-symbol">==</span> p<span className="mds-symbol">)</span> <span className="mds-keyword">return</span> p<span className="mds-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="mds-keyword">else if</span> <span className="mds-symbol">(</span>k <span className="mds-symbol">&lt;</span> p<span className="mds-symbol">)</span> <span className="mds-keyword">return</span> quickSelect<span className="mds-symbol">(</span>arr<span className="mds-symbol">,</span> l<span className="mds-symbol">,</span> p <span className="mds-symbol">-</span> <span className="mds-number">1</span><span className="mds-symbol">,</span> k<span className="mds-symbol">);</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="mds-keyword">else</span> <span className="mds-keyword">return</span> quickSelect<span className="mds-symbol">(</span>arr<span className="mds-symbol">,</span> p <span className="mds-symbol">+</span> <span className="mds-number">1</span><span className="mds-symbol">,</span> r<span className="mds-symbol">,</span> k<span className="mds-symbol">);</span>
  </>,

  <>
    <span className="mds-symbol">{"}"}</span>
  </>,

  <>&nbsp;</>,

  <>
    <span className="mds-type">int</span> partition
    <span className="mds-symbol">(</span><span className="mds-type">vector</span><span className="mds-symbol">&lt;</span><span className="mds-type">int</span><span className="mds-symbol">&gt;&amp;</span> arr<span className="mds-symbol">,</span> <span className="mds-type">int</span> l<span className="mds-symbol">,</span> <span className="mds-type">int</span> r<span className="mds-symbol">)</span> <span className="mds-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="mds-type">int</span> pivot <span className="mds-symbol">=</span> arr<span className="mds-symbol">[</span>r<span className="mds-symbol">];</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="mds-type">int</span> i <span className="mds-symbol">=</span> l <span className="mds-symbol">-</span> <span className="mds-number">1</span><span className="mds-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="mds-keyword">for</span> <span className="mds-symbol">(</span><span className="mds-type">int</span> j <span className="mds-symbol">=</span> l<span className="mds-symbol">;</span> j <span className="mds-symbol">&lt;</span> r<span className="mds-symbol">;</span> j<span className="mds-symbol">++)</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;<span className="mds-keyword">if</span> <span className="mds-symbol">(</span>arr<span className="mds-symbol">[</span>j<span className="mds-symbol">]</span> <span className="mds-symbol">&lt;=</span> pivot<span className="mds-symbol">)</span> swap<span className="mds-symbol">(</span>arr<span className="mds-symbol">[++</span>i<span className="mds-symbol">],</span> arr<span className="mds-symbol">[</span>j<span className="mds-symbol">]);</span>
  </>,

  <>
    &nbsp;&nbsp;swap<span className="mds-symbol">(</span>arr<span className="mds-symbol">[</span>i <span className="mds-symbol">+</span> <span className="mds-number">1</span><span className="mds-symbol">],</span> arr<span className="mds-symbol">[</span>r<span className="mds-symbol">]);</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="mds-keyword">return</span> i <span className="mds-symbol">+</span> <span className="mds-number">1</span><span className="mds-symbol">;</span>
  </>,

  <>
    <span className="mds-symbol">{"}"}</span>
  </>,
];

const fmt = (v) => (v === null || v === undefined || v === -1 ? "–" : v);

const MedianSearch = () => {
  const [seed, setSeed] = useState(randomArray(11));

  const steps = quickSelectSteps(seed);
  const { index, playing, speed, setSpeed, reset, stepForward, stepBack, togglePlay } = usePlayback(steps.length);
  const current = steps[index];
  const isDone = current.foundIdx !== -1;

  const shuffle = () => {
    setSeed(randomArray(11));
    reset();
  };

  return (
    <div className="median-search-wrapper">
      <div className="median-search">
        <p className="mds-eyebrow">searching</p>

        <h1 className="mds-title">Median Search</h1>

        <div className="mds-header">
          <p className="mds-blurb">
            Finds the median by partitioning like Quick Sort, but only recurses into the half that holds it.
          </p>

          <div className="mds-complexity">
            <div>
              <div className="mds-complexity-label">time</div>
              <div className="mds-time-value">O(n)</div>
            </div>

            <div>
              <div className="mds-complexity-label">space</div>
              <div className="mds-space-value">O(log n)</div>
            </div>
          </div>
        </div>

        <div className="mds-grid">
          <div className="mds-stage">
            <div className="mds-vars">
              <span><b>range</b>[{current.range[0]}, {current.range[1]}]</span>
              <span><b>k</b>{fmt(current.k)}</span>
              <span><b>pivot</b>{fmt(current.pivot)}</span>
            </div>

            <div className="mds-boxs">
              {current.array.map((value, i) => {
                const inRange = i >= current.range[0] && i <= current.range[1];
                const isFound = i === current.foundIdx;
                const isPivot = i === current.pivot;
                const isCompare = i === current.compare;
                const isSwap = current.swap.includes(i);

                let borderColor = "#262629";
                let color = "#f3f2ed";

                if (isFound) {
                  borderColor = "#b4ff39";
                  color = "#b4ff39";
                } else if (isPivot) {
                  borderColor = "#7c8cff";
                  color = "#7c8cff";
                } else if (isSwap) {
                  borderColor = "#ffbd2e";
                  color = "#ffbd2e";
                } else if (isCompare) {
                  borderColor = "#ff6a3d";
                  color = "#ff6a3d";
                }

                return (
                  <div key={i} className="mds-box-wrapper">
                    <div className="mds-index">
                      {i}
                      {i === current.k && <span className="mds-k-marker">k</span>}
                    </div>

                    <motion.div
                      className={`mds-box ${inRange ? "" : "dull-box"}`}
                      animate={{ borderColor, color }}
                    >
                      {value}
                    </motion.div>
                  </div>
                );
              })}
            </div>

            <p className="mds-status">{current.description}</p>
          </div>

          <div className="mds-code-panel">
            <div className="mds-code-header">
              <div className="mds-dummy-btns">
                <span className="mds-red-btn"></span>
                <span className="mds-yellow-btn"></span>
                <span className="mds-green-btn"></span>
                <span className="mds-filename">medianSearch.cpp</span>
              </div>

              <span className="mds-header-complexity">O(n)</span>
            </div>

            <pre className="mds-code-block">
              {CodeLines.map((line, i) => {
                return (
                  <div
                    key={i}
                    className={`mds-code-line ${current.codeLine === i + 1 ? "mds-code-line-active" : ""}`}
                  >
                    <span className="mds-line-no">{i + 1}</span>
                    {line}
                  </div>
                );
              })}
            </pre>
          </div>
        </div>

        <div className="mds-controls">
          <button className="mds-icon-btn" onClick={reset}>
            <ResetIcon />
          </button>

          <button
            className="mds-icon-btn"
            onClick={stepBack}
            disabled={index === 0}
          >
            <StepBackIcon />
          </button>

          <button className="mds-play-btn" onClick={togglePlay}>
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>

          <button
            className="mds-icon-btn"
            onClick={stepForward}
            disabled={index === steps.length - 1}
          >
            <StepForwardIcon />
          </button>

          <button className="mds-shuffle-btn" onClick={shuffle}>
            <ShuffleIcon />
            Shuffle
          </button>

          <div className="mds-speed">
            <span>SPEED</span>

            <input
              type="range"
              min="1"
              max="10"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
          </div>

          <span className="mds-steps">
            {index + 1} / {steps.length}
          </span>
        </div>

        <div className="mds-stats">
          <span>
            comparisons: <b>{current.comparisons}</b>
          </span>

          <span>
            swaps: <b>{current.swaps}</b>
          </span>

          <span>
            median: <b>{isDone ? current.array[current.foundIdx] : "–"}</b>
          </span>
        </div>
      </div>
    </div>
  );
};

export default MedianSearch;
