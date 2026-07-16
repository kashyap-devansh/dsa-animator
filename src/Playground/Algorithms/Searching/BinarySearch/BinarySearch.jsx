import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "./BinarySearch.css";

function randomArray(size = 16) {
  const arr = [];

  for (let i = 0; i < size; i++) {
    arr.push(Math.floor(Math.random() * 90) + 10);
  }

  return arr;
}

function binarySearchSteps(input, target) {
  const arr = [...input].sort((a, b) => a - b);
  const steps = [];
  let comparisons = 0;

  function save(line, description, currentIndex = -1, left = -1, right = -1, found = false) {
    steps.push({
      array: [...arr],
      codeLine: line,
      description,
      currentIndex,
      left,
      right,
      target,
      found,
      comparisons,
    });
  }

  let left = 0;
  let right = arr.length - 1;

  save(1, `Search for ${target}`, -1, left, right);

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);

    comparisons++;
    save(4, `Check midpoint index ${mid} (value ${arr[mid]})`, mid, left, right);

    if (arr[mid] === target) {
      save(6, `Found ${target} at index ${mid}`, mid, left, right, true);
      return steps;
    }

    if (arr[mid] < target) {
      left = mid + 1;
      save(8, `${arr[mid]} < ${target} — search right half`, mid, left, right);
    }
    else {
      right = mid - 1;
      save(10, `${arr[mid]} > ${target} — search left half`, mid, left, right);
    }
  }

  save(13, `${target} not found`, -1, left, right);

  return steps;
}

const CodeLines = [
  <>
    <span className="bis-type">int</span> binarySearch
    <span className="bis-symbol">(</span><span className="bis-type">vector</span><span className="bis-symbol">&lt;</span><span className="bis-type">int</span><span className="bis-symbol">&gt;&amp;</span> arr<span className="bis-symbol">,</span> <span className="bis-type">int</span> target<span className="bis-symbol">)</span> <span className="bis-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="bis-type">int</span> left <span className="bis-symbol">=</span> <span className="bis-number">0</span><span className="bis-symbol">,</span> right <span className="bis-symbol">=</span> arr<span className="bis-symbol">.</span>size<span className="bis-symbol">()</span> <span className="bis-symbol">-</span> <span className="bis-number">1</span><span className="bis-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="bis-keyword">while</span> <span className="bis-symbol">(</span>left <span className="bis-symbol">&lt;=</span> right<span className="bis-symbol">)</span> <span className="bis-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;<span className="bis-type">int</span> mid <span className="bis-symbol">=</span> left <span className="bis-symbol">+</span> <span className="bis-symbol">(</span>right <span className="bis-symbol">-</span> left<span className="bis-symbol">)</span> <span className="bis-symbol">/</span> <span className="bis-number">2</span><span className="bis-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;<span className="bis-keyword">if</span> <span className="bis-symbol">(</span>arr<span className="bis-symbol">[</span>mid<span className="bis-symbol">]</span> <span className="bis-symbol">==</span> target<span className="bis-symbol">)</span> <span className="bis-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="bis-keyword">return</span> mid<span className="bis-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;<span className="bis-symbol">{"}"}</span> <span className="bis-keyword">else if</span> <span className="bis-symbol">(</span>arr<span className="bis-symbol">[</span>mid<span className="bis-symbol">]</span> <span className="bis-symbol">&lt;</span> target<span className="bis-symbol">)</span> <span className="bis-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;left <span className="bis-symbol">=</span> mid <span className="bis-symbol">+</span> <span className="bis-number">1</span><span className="bis-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;<span className="bis-symbol">{"}"}</span> <span className="bis-keyword">else</span> <span className="bis-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;right <span className="bis-symbol">=</span> mid <span className="bis-symbol">-</span> <span className="bis-number">1</span><span className="bis-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;<span className="bis-symbol">{"}"}</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="bis-symbol">{"}"}</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="bis-keyword">return</span> <span className="bis-symbol">-</span><span className="bis-number">1</span><span className="bis-symbol">;</span>
  </>,

  <>
    <span className="bis-symbol">{"}"}</span>
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

const BinarySearch = () => {
  const [seed, setSeed] = useState(randomArray());
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(5);

  const [target, setTarget] = useState(seed[Math.floor(Math.random() * seed.length)]);

  const steps = binarySearchSteps(seed, target);
  const current = steps[index];


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
    const newSeed = randomArray().sort((a, b) => a - b);

    setSeed(newSeed);
    setTarget(newSeed[Math.floor(Math.random() * newSeed.length)]);
    reset();
  };

  const stepForward = () => {
    setPlaying(false);

    if (index < steps.length - 1) {
      setIndex(i => i + 1);
    }
  };

  const stepBack = () => {
    setPlaying(false);

    if (index > 0) {
      setIndex(i => i - 1);
    }
  };

  const togglePlay = () => {
    if (index === steps.length - 1) {
      setIndex(0);
    }

    setPlaying(!playing);
  };

  return (
    <div className="binary-search-wrapper">
      <div className="binary-search">
        <p className="bis-eyebrow">searching</p>

        <h1 className="bis-title">Binary Search</h1>

        <div className="bis-header">
          <p className="bis-blurb">
            Halves the search range every step on a sorted array.
          </p>

          <div className="bis-complexity">
            <div>
              <div className="bis-complexity-label">time</div>
              <div className="bis-time-value">O(log n)</div>
            </div>

            <div>
              <div className="bis-complexity-label">space</div>
              <div className="bis-space-value">O(1)</div>
            </div>
          </div>
        </div>

        <div className="bis-grid">
          <div className="bis-stage">
            <div className="bis-boxs">
              {current.array.map((value, i) => {
                const isCurrent = i === current.currentIndex;
                const isFound = current.found && isCurrent;

                return (
                  <div key={i} className="bis-box-wrapper">
                    <div className="bis-index">{i}</div>

                    <motion.div
                      className={`bis-box ${i < current.left || i > current.right ? "dull-box" : ""}`}
                      animate={{
                        borderColor: isFound ? "#b4ff39" : isCurrent ? "#ff6a3d" : "#262629",
                        color: isFound ? "#b4ff39" : isCurrent ? "#ff6a3d" : "#f3f2ed",
                      }}
                    >
                      {value}
                    </motion.div>
                  </div>
                );
              })}
            </div>
            <p className="bis-status">{current.description}</p>
          </div>

          <div className="bis-code-panel">
            <div className="bis-code-header">
              <div className="bis-dummy-btns">
                <span className="bis-red-btn"></span>
                <span className="bis-yellow-btn"></span>
                <span className="bis-green-btn"></span>
                <span className="bis-filename">binarySearch.cpp</span>
              </div>

              <span className="bis-header-complexity">O(log n)</span>
            </div>

            <pre className="bis-code-block">
              {CodeLines.map((line, i) => {
                return (
                  <div
                    key={i}
                    className={`bis-code-line ${current.codeLine === i + 1 ? "bis-code-line-active" : ""}`}
                  >
                    <span className="bis-line-no">{i + 1}</span>
                    {line}
                  </div>
                );
              })}
            </pre>
          </div>
        </div>

        <div className="bis-controls">
          <button className="bis-icon-btn" onClick={reset}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rotate-ccw-icon lucide-rotate-ccw"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
          </button>

          <button
            className="bis-icon-btn"
            onClick={stepBack}
            disabled={index === 0}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-skip-back-icon lucide-skip-back"><path d="M17.971 4.285A2 2 0 0 1 21 6v12a2 2 0 0 1-3.029 1.715l-9.997-5.998a2 2 0 0 1-.003-3.432z" /><path d="M3 20V4" /></svg>
          </button>

          <button className="bis-play-btn" onClick={togglePlay}>
            {playing ? <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0a0a0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pause-icon lucide-pause"><rect x="14" y="3" width="5" height="18" rx="1" /><rect x="5" y="3" width="5" height="18" rx="1" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0a0a0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-play-icon lucide-play"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" /></svg>}
          </button>

          <button
            className="bis-icon-btn"
            onClick={stepForward}
            disabled={index === steps.length - 1}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-skip-forward-icon lucide-skip-forward"><path d="M21 4v16" /><path d="M6.029 4.285A2 2 0 0 0 3 6v12a2 2 0 0 0 3.029 1.715l9.997-5.998a2 2 0 0 0 .003-3.432z" /></svg>
          </button>

          <button className="bis-shuffle-btn" onClick={shuffle}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shuffle-icon lucide-shuffle"><path d="m18 14 4 4-4 4" /><path d="m18 2 4 4-4 4" /><path d="M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22" /><path d="M2 6h1.972a4 4 0 0 1 3.6 2.2" /><path d="M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45" /></svg>
            New array
          </button>

          <input
            className="bis-input"
            type="number"
            value={target}
            onChange={(e) => {
              setTarget(Number(e.target.value))
              reset();
            }}
          />

          <div className="bis-speed">
            <span>SPEED</span>

            <input
              type="range"
              min="1"
              max="10"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
          </div>

          <span className="bis-steps">
            {index + 1} / {steps.length}
          </span>
        </div>

        <div className="bis-stats">
          <span>
            comparisons: <b>{current.comparisons}</b>
          </span>

          <span>
            target: <b>{target}</b>
          </span>
        </div>
      </div>
    </div>
  );
};

export default BinarySearch;
