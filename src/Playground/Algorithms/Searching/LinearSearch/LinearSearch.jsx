import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "./LinearSearch.css";

function randomArray(size = 16) {
  const arr = [];

  for (let i = 0; i < size; i++) {
    arr.push(Math.floor(Math.random() * 90) + 10);
  }

  return arr;
}

function linearSearchSteps(input, target) {
  const arr = [...input];
  const steps = [];

  let comparisons = 0;

  function save(line, description, currentIndex = -1, found = false) {
    steps.push({
      array: [...arr],
      codeLine: line,
      description,
      currentIndex,
      target,
      found,
      comparisons,
    });
  }

  save(1, "Start Linear Search");

  for (let i = 0; i < arr.length; i++) {

    comparisons++;
    save(3, `Check index ${i} (value ${arr[i]})`, i);

    if (arr[i] === target) {
      save(3, `Found ${target} at index ${i}`, i, true);

      save(4, `Return index ${i}`, i, true);

      return steps;
    }
  }

  save(6, `${target} not found`);
  save(7, "Return -1");

  return steps;
}
const CodeLines = [
  <>
    <span className="ls-type">int</span> linearSearch
    <span className="ls-symbol">(</span><span className="ls-type">vector</span><span className="ls-symbol">&lt;</span><span className="ls-type">int</span><span className="ls-symbol">&gt;&amp;</span> arr<span className="ls-symbol">,</span> <span className="ls-type">int</span> target<span className="ls-symbol">)</span> <span className="ls-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="ls-keyword">for</span> <span className="ls-symbol">(</span>
    <span className="ls-type">int</span> i <span className="ls-symbol">=</span> <span className="ls-number">0</span><span className="ls-symbol">;</span>
    {" "}i <span className="ls-symbol">{"<"}</span> arr<span className="ls-symbol">.</span>size<span className="ls-symbol">()</span><span className="ls-symbol">;</span>
    {" "}i<span className="ls-symbol">++</span><span className="ls-symbol">)</span> <span className="ls-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;
    <span className="ls-keyword">if</span> <span className="ls-symbol">(</span>
    arr<span className="ls-symbol">[</span>i<span className="ls-symbol">]</span>
    <span className="ls-symbol"> == </span>
    target
    <span className="ls-symbol">)</span> <span className="ls-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    <span className="ls-keyword">return</span> i<span className="ls-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;
    <span className="ls-symbol">{"}"}</span>
  </>,

  <>
    &nbsp;&nbsp;
    <span className="ls-symbol">{"}"}</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="ls-keyword">return</span> <span className="ls-symbol">-</span><span className="ls-number">1</span><span className="ls-symbol">;</span>
  </>,

  <>
    <span className="ls-symbol">{"}"}</span>
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

const LinearSearch = () => {
  const [seed, setSeed] = useState(randomArray());
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(5);

  const [target, setTarget] = useState(seed[Math.floor(Math.random() * seed.length)]);

  const steps = linearSearchSteps(seed, target);
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
    const newSeed = randomArray();

    setSeed(newSeed);
    setTarget(newSeed[Math.floor(Math.random() * newSeed.length)]);
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
    <div className="linear-search-wrapper">
      <div className="linear-search">
        <p className="ls-eyebrow">searching</p>

        <h1 className="ls-title">Linear Search</h1>

        <div className="ls-header">
          <p className="ls-blurb">
            Walks the array one element at a time until it finds a match.
          </p>

          <div className="ls-complexity">
            <div>
              <div className="ls-complexity-label">time</div>
              <div className="ls-time-value">O(n)</div>
            </div>

            <div>
              <div className="ls-complexity-label">space</div>
              <div className="ls-space-value">O(1)</div>
            </div>
          </div>
        </div>

        <div className="ls-grid">
          <div className="ls-stage">
            <div className="ls-boxs">
              {current.array.map((value, i) => {
                const isCurrent = i === current.currentIndex;
                const isFound = current.found && isCurrent;

                let color = "#2b2b31";

                if (isFound) color = "#b4ff39";
                else if (isCurrent) color = "#ff6a3d";

                return (
                  <div key={i} className="ls-box-wrapper">
                    <div className="ls-index">{i}</div>

                    <motion.div
                      className="ls-box"
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
            <p className="ls-status">{current.description}</p>
          </div>

          <div className="ls-code-panel">
            <div className="ls-code-header">
              <div className="ls-dummy-btns">
                <span className="ls-red-btn"></span>
                <span className="ls-yellow-btn"></span>
                <span className="ls-green-btn"></span>
                <span className="ls-filename">linearSearch.cpp</span>
              </div>

              <span className="ls-header-complexity">O(n)</span>
            </div>

            <pre className="ls-code-block">
              {CodeLines.map((line, i) => {
                return (
                  <div
                    key={i}
                    className={`ls-code-line ${current.codeLine === i + 1 ? "ls-code-line-active" : ""}`}
                  >
                    <span className="ls-line-no">{i + 1}</span>
                    {line}
                  </div>
                );
              })}
            </pre>
          </div>
        </div>

        <div className="ls-controls">
          <button className="ls-icon-btn" onClick={reset}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rotate-ccw-icon lucide-rotate-ccw"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
          </button>

          <button
            className="ls-icon-btn"
            onClick={stepBack}
            disabled={index === 0}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-skip-back-icon lucide-skip-back"><path d="M17.971 4.285A2 2 0 0 1 21 6v12a2 2 0 0 1-3.029 1.715l-9.997-5.998a2 2 0 0 1-.003-3.432z" /><path d="M3 20V4" /></svg>
          </button>

          <button className="ls-play-btn" onClick={togglePlay}>
            {playing ? <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0a0a0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pause-icon lucide-pause"><rect x="14" y="3" width="5" height="18" rx="1" /><rect x="5" y="3" width="5" height="18" rx="1" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0a0a0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-play-icon lucide-play"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" /></svg>}
          </button>

          <button
            className="ls-icon-btn"
            onClick={stepForward}
            disabled={index === steps.length - 1}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-skip-forward-icon lucide-skip-forward"><path d="M21 4v16" /><path d="M6.029 4.285A2 2 0 0 0 3 6v12a2 2 0 0 0 3.029 1.715l9.997-5.998a2 2 0 0 0 .003-3.432z" /></svg>
          </button>

          <button className="ls-shuffle-btn" onClick={shuffle}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shuffle-icon lucide-shuffle"><path d="m18 14 4 4-4 4" /><path d="m18 2 4 4-4 4" /><path d="M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22" /><path d="M2 6h1.972a4 4 0 0 1 3.6 2.2" /><path d="M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45" /></svg>
            New array
          </button>

          <input
            className="ls-input"
            type="number"
            value={target}
            onChange={(e) => {
              setTarget(Number(e.target.value))
              reset();
            }}
          />

          <div className="ls-speed">
            <span>SPEED</span>

            <input
              type="range"
              min="1"
              max="10"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
          </div>

          <span className="ls-steps">
            {index + 1} / {steps.length}
          </span>
        </div>

        <div className="ls-stats">
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

export default LinearSearch;
