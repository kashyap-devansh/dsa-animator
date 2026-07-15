import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "./BubbleSort.css";

function randomArray(size = 16) {
  const arr = [];

  for (let i = 0; i < size; i++) {
    arr.push(Math.floor(Math.random() * 90) + 10);
  }

  return arr;
}

function bubbleSortSteps(input) {
  const arr = [...input];
  const steps = [];
  const n = arr.length;

  let comparisons = 0;
  let swaps = 0;

  function save(line, description, compare, sortedFrom) {
    steps.push({
      array: [...arr],
      codeLine: line,
      description,
      compare,
      sortedFrom,
      swaps,
      comparisons,
    });
  }

  save(1, "Started Bubble Sort", [], n);

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      comparisons++;
      save(4, `Compare ${j} and ${j + 1}`, [j, j + 1], n - i);

      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];

        swaps++;
        save(6, `Swap ${j} and ${j + 1}`, [j, j + 1], n - i);
      }
    }

    save(2, `Index ${n - 1 - i} sorted`, [], n - i - 1);
  }

  save(10, "Array Sorted!", [], 0);

  return steps;
}

const CodeLines = [
  <>
    <span className="bs-type">void</span> bubbleSort<span className="bs-symbol">(</span><span className="bs-type">vector</span><span className="bs-symbol">&lt;</span><span className="bs-type">int</span><span className="bs-symbol">&gt;&amp;</span> arr<span className="bs-symbol">)</span> <span className="bs-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="bs-type">int</span> n <span className="bs-symbol">=</span> arr<span className="bs-symbol">.</span>size<span className="bs-symbol">()</span><span className="bs-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="bs-keyword">for</span> <span className="bs-symbol">(</span>
    <span className="bs-type">int</span> i <span className="bs-symbol">=</span> <span className="bs-number">0</span><span className="bs-symbol">;</span>
    {" "}i <span className="bs-symbol">{"<"}</span> n <span className="bs-symbol">-</span> <span className="bs-number">1</span><span className="bs-symbol">;</span>
    {" "}i<span className="bs-symbol">++</span><span className="bs-symbol">)</span> <span className="bs-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;<span className="bs-keyword">for</span> <span className="bs-symbol">(</span>
    <span className="bs-type">int</span> j <span className="bs-symbol">=</span> <span className="bs-number">0</span><span className="bs-symbol">;</span>
    {" "}j <span className="bs-symbol">{"<"}</span> n <span className="bs-symbol">-</span> <span className="bs-number">1</span> <span className="bs-symbol">-</span> i<span className="bs-symbol">;</span>
    {" "}j<span className="bs-symbol">++</span><span className="bs-symbol">)</span> <span className="bs-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    <span className="bs-keyword">if</span> <span className="bs-symbol">(</span>arr<span className="bs-symbol">[</span>j<span className="bs-symbol">]</span> <span className="bs-symbol">{">"}</span> arr<span className="bs-symbol">[</span>j <span className="bs-symbol">+</span> <span className="bs-number">1</span><span className="bs-symbol">]</span><span className="bs-symbol">)</span> <span className="bs-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    swap<span className="bs-symbol">(</span>arr<span className="bs-symbol">[</span>j<span className="bs-symbol">]</span><span className="bs-symbol">,</span> arr<span className="bs-symbol">[</span>j <span className="bs-symbol">+</span> <span className="bs-number">1</span><span className="bs-symbol">]</span><span className="bs-symbol">)</span><span className="bs-symbol">;</span>
  </>,

  <>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="bs-symbol">{"}"}</span></>,
  <>&nbsp;&nbsp;&nbsp;&nbsp;<span className="bs-symbol">{"}"}</span></>,
  <>&nbsp;&nbsp;<span className="bs-symbol">{"}"}</span></>,

  <>
    &nbsp;&nbsp;<span className="bs-keyword">return</span><span className="bs-symbol">;</span>
  </>,

  <><span className="bs-symbol">{"}"}</span></>,
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

const BubbleSort = () => {
  const [seed, setSeed] = useState(randomArray());
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(5);

  const steps = bubbleSortSteps(seed);
  const current = steps[index];
  const max = Math.max(...current.array);

  useEffect(() => {
    if (!playing || index >= steps.length - 1) {
      if (index >= steps.length - 1) {
        setPlaying(false);
      }
      return;
    }

    const timer = setTimeout(
      () => setIndex(i => i + 1),
      SpeedDelay[speed]
    );

    return () => clearTimeout(timer);
  }, [playing, index, speed, steps.length]);

  const reset = () => {
    setPlaying(false);
    setIndex(0);
  };

  const shuffle = () => {
    setSeed(randomArray());
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
    <div className="bubble-sort-wrapper">
      <div className="bubble-sort">
        <p className="bs-eyebrow">sorting</p>

        <h1 className="bs-title">Bubble Sort</h1>

        <div className="bs-header">
          <p className="bs-blurb">
            Adjacent swaps bubble the largest value to the end each pass.
          </p>

          <div className="bs-complexity">
            <div>
              <div className="bs-complexity-label">time</div>
              <div className="bs-time-value">O(n²)</div>
            </div>

            <div>
              <div className="bs-complexity-label">space</div>
              <div className="bs-space-value">O(1)</div>
            </div>
          </div>
        </div>

        <div className="bs-grid">
          <div className="bs-stage">
            <div className="bs-bars">
              {current.array.map((value, i) => {
                const isSorted = i >= current.sortedFrom;
                const isCompare = current.compare.includes(i);

                let color = "#3a3a3f";

                if (isSorted) color = "#b4ff39";
                else if (isCompare) color = "#ff6a3d";

                return (
                  <motion.div
                    key={i}
                    className="bs-bar"
                    animate={{
                      height: `${(value / max) * 230 + 6}px`,
                      backgroundColor: color,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 26,
                    }}
                  />
                );
              })}
            </div>

            <p className="bs-status">{current.description}</p>
          </div>

          <div className="bs-code-panel">
            <div className="bs-code-header">
              <div className="bs-dummy-btns">
                <span className="bs-red-btn"></span>
                <span className="bs-yellow-btn"></span>
                <span className="bs-green-btn"></span>
                <span className="bs-filename">bubble_sort.cpp</span>
              </div>

              <span className="bs-header-complexity">O(n²)</span>
            </div>

            <pre className="bs-code-block">
              {CodeLines.map((line, i) => {
                return (
                  <div
                    key={i}
                    className={`bs-code-line ${current.codeLine === i + 1 ? "bs-code-line-active" : ""}`}
                  >
                    <span className="bs-line-no">{i + 1}</span>
                    {line}
                  </div>
                );
              })}
            </pre>
          </div>
        </div>

        <div className="bs-controls">
          <button className="bs-icon-btn" onClick={reset}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rotate-ccw-icon lucide-rotate-ccw"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
          </button>

          <button
            className="bs-icon-btn"
            onClick={stepBack}
            disabled={index === 0}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-skip-back-icon lucide-skip-back"><path d="M17.971 4.285A2 2 0 0 1 21 6v12a2 2 0 0 1-3.029 1.715l-9.997-5.998a2 2 0 0 1-.003-3.432z" /><path d="M3 20V4" /></svg>
          </button>

          <button className="bs-play-btn" onClick={togglePlay}>
            {playing ? <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0a0a0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pause-icon lucide-pause"><rect x="14" y="3" width="5" height="18" rx="1" /><rect x="5" y="3" width="5" height="18" rx="1" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0a0a0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-play-icon lucide-play"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" /></svg>}
          </button>

          <button
            className="bs-icon-btn"
            onClick={stepForward}
            disabled={index === steps.length - 1}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-skip-forward-icon lucide-skip-forward"><path d="M21 4v16" /><path d="M6.029 4.285A2 2 0 0 0 3 6v12a2 2 0 0 0 3.029 1.715l9.997-5.998a2 2 0 0 0 .003-3.432z" /></svg>
          </button>

          <button className="bs-shuffle-btn" onClick={shuffle}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shuffle-icon lucide-shuffle"><path d="m18 14 4 4-4 4" /><path d="m18 2 4 4-4 4" /><path d="M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22" /><path d="M2 6h1.972a4 4 0 0 1 3.6 2.2" /><path d="M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45" /></svg>
            Shuffle
          </button>

          <div className="bs-speed">
            <span>SPEED</span>

            <input
              type="range"
              min="1"
              max="10"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
          </div>

          <span className="bs-steps">
            {index + 1} / {steps.length}
          </span>
        </div>

        <div className="bs-stats">
          <span>
            comparisons: <b>{current.comparisons}</b>
          </span>

          <span>
            swaps: <b>{current.swaps}</b>
          </span>
        </div>
      </div>
    </div>
  );
};

export default BubbleSort;
