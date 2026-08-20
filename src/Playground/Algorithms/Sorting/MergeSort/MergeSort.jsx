import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "./MergeSort.css";

function randomArray(size = 16) {
  const arr = [];

  for (let i = 0; i < size; i++) {
    arr.push(Math.floor(Math.random() * 90) + 10);
  }

  return arr;
}

function mergeSortSteps(input) {
  const arr = [...input];
  const steps = [];
  const n = arr.length;

  let comparisons = 0;
  let merges = 0;

  function save(line, description, range, compare, placed) {
    steps.push({
      array: [...arr],
      codeLine: line,
      description,
      range: range || [],
      compare: compare || [],
      placed: placed ?? -1,
      merges,
      comparisons,
    });
  }

  function merge(l, m, r) {
    save(9, `Merging [${l}, ${m}] and [${m + 1}, ${r}]`, [l, r], [], -1);

    const temp = [];
    let i = l;
    let j = m + 1;

    save(13, "Initialize temp array", [l, r], [], -1);

    while (i <= m && j <= r) {
      comparisons++;
      save(17, `Compare index ${i} and ${j}`, [l, r], [i, j], -1);

      if (arr[i] <= arr[j]) {
        temp.push(arr[i]);
        i++;
      }
      else {
        temp.push(arr[j]);
        j++;
      }
    }

    while (i <= m) {
      temp.push(arr[i]);
      i++;
    }

    while (j <= r) {
      temp.push(arr[j]);
      j++;
    }

    for (let k = l; k <= r; k++) {
      arr[k] = temp[k - l];
      merges++;

      save(21, `Placed ${arr[k]} at index ${k}`, [l, r], [], k);
    }
  }

  function mergeSort(l, r) {
    save(1, `mergeSort(${l}, ${r})`, [l, r], [], -1);

    if (l >= r) {
      save(2, "Base case reached", [l, r], [], -1);
      return;
    }

    const m = l + Math.floor((r - l) / 2);
    save(4, `Mid index = ${m}`, [l, r], [], -1);

    mergeSort(l, m);
    mergeSort(m + 1, r);

    merge(l, m, r);
  }

  save(1, "Started Merge Sort", [0, n - 1], [], -1);

  mergeSort(0, n - 1);

  save(22, "Array Sorted!", [0, n - 1], [], -1);

  return steps;
}

const CodeLines = [
  <>
    <span className="ms-type">void</span> mergeSort<span className="ms-symbol">(</span><span className="ms-type">vector</span><span className="ms-symbol">&lt;</span><span className="ms-type">int</span><span className="ms-symbol">&gt;&amp;</span> arr<span className="ms-symbol">,</span> <span className="ms-type">int</span> l<span className="ms-symbol">,</span> <span className="ms-type">int</span> r<span className="ms-symbol">)</span> <span className="ms-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="ms-keyword">if</span> <span className="ms-symbol">(</span>l <span className="ms-symbol">&gt;=</span> r<span className="ms-symbol">)</span> <span className="ms-keyword">return</span><span className="ms-symbol">;</span>
  </>,

  <>&nbsp;</>,

  <>
    &nbsp;&nbsp;<span className="ms-type">int</span> m <span className="ms-symbol">=</span> l <span className="ms-symbol">+</span> <span className="ms-symbol">(</span>r <span className="ms-symbol">-</span> l<span className="ms-symbol">)</span> <span className="ms-symbol">/</span> <span className="ms-number">2</span><span className="ms-symbol">;</span>
  </>,

  <>&nbsp;</>,

  <>
    &nbsp;&nbsp;mergeSort<span className="ms-symbol">(</span>arr<span className="ms-symbol">,</span> l<span className="ms-symbol">,</span> m<span className="ms-symbol">)</span><span className="ms-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;mergeSort<span className="ms-symbol">(</span>arr<span className="ms-symbol">,</span> m <span className="ms-symbol">+</span> <span className="ms-number">1</span><span className="ms-symbol">,</span> r<span className="ms-symbol">)</span><span className="ms-symbol">;</span>
  </>,

  <>&nbsp;</>,

  <>
    &nbsp;&nbsp;merge<span className="ms-symbol">(</span>arr<span className="ms-symbol">,</span> l<span className="ms-symbol">,</span> m<span className="ms-symbol">,</span> r<span className="ms-symbol">)</span><span className="ms-symbol">;</span>
  </>,

  <><span className="ms-symbol">{"}"}</span></>,

  <>&nbsp;</>,

  <>
    <span className="ms-type">void</span> merge<span className="ms-symbol">(</span><span className="ms-type">vector</span><span className="ms-symbol">&lt;</span><span className="ms-type">int</span><span className="ms-symbol">&gt;&amp;</span> arr<span className="ms-symbol">,</span> <span className="ms-type">int</span> l<span className="ms-symbol">,</span> <span className="ms-type">int</span> m<span className="ms-symbol">,</span> <span className="ms-type">int</span> r<span className="ms-symbol">)</span> <span className="ms-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="ms-type">vector</span><span className="ms-symbol">&lt;</span><span className="ms-type">int</span><span className="ms-symbol">&gt;</span> temp<span className="ms-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="ms-type">int</span> i <span className="ms-symbol">=</span> l<span className="ms-symbol">,</span> j <span className="ms-symbol">=</span> m <span className="ms-symbol">+</span> <span className="ms-number">1</span><span className="ms-symbol">;</span>
  </>,

  <>&nbsp;</>,

  <>
    &nbsp;&nbsp;<span className="ms-keyword">while</span> <span className="ms-symbol">(</span>i <span className="ms-symbol">&lt;=</span> m <span className="ms-symbol">&amp;&amp;</span> j <span className="ms-symbol">&lt;=</span> r<span className="ms-symbol">)</span> <span className="ms-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;
    <span className="ms-keyword">if</span> <span className="ms-symbol">(</span>arr<span className="ms-symbol">[</span>i<span className="ms-symbol">]</span> <span className="ms-symbol">&lt;=</span> arr<span className="ms-symbol">[</span>j<span className="ms-symbol">]</span><span className="ms-symbol">)</span> temp<span className="ms-symbol">.</span>push_back<span className="ms-symbol">(</span>arr<span className="ms-symbol">[</span>i<span className="ms-symbol">++</span><span className="ms-symbol">]</span><span className="ms-symbol">)</span><span className="ms-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;
    <span className="ms-keyword">else</span> temp<span className="ms-symbol">.</span>push_back<span className="ms-symbol">(</span>arr<span className="ms-symbol">[</span>j<span className="ms-symbol">++</span><span className="ms-symbol">]</span><span className="ms-symbol">)</span><span className="ms-symbol">;</span>
  </>,

  <>&nbsp;&nbsp;<span className="ms-symbol">{"}"}</span></>,

  <>&nbsp;</>,

  <>
    &nbsp;&nbsp;<span className="ms-keyword">for</span> <span className="ms-symbol">(</span>
    <span className="ms-type">int</span> k <span className="ms-symbol">=</span> l<span className="ms-symbol">;</span>
    {" "}k <span className="ms-symbol">&lt;=</span> r<span className="ms-symbol">;</span>
    {" "}k<span className="ms-symbol">++</span><span className="ms-symbol">)</span> arr<span className="ms-symbol">[</span>k<span className="ms-symbol">]</span> <span className="ms-symbol">=</span> temp<span className="ms-symbol">[</span>k <span className="ms-symbol">-</span> l<span className="ms-symbol">]</span><span className="ms-symbol">;</span>
  </>,

  <><span className="ms-symbol">{"}"}</span></>,
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

const MergeSort = () => {
  const [seed, setSeed] = useState(randomArray());
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(5);

  const steps = mergeSortSteps(seed);
  const current = steps[index];
  const max = Math.max(...current.array);
  const isDone = index === steps.length - 1;

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
            <div className="ms-bars">
              {current.array.map((value, i) => {
                const inRange = i >= current.range[0] && i <= current.range[1];
                const isCompare = current.compare.includes(i);
                const isPlaced = i === current.placed;

                let color = "#3a3a3f";

                if (isDone) color = "#b4ff39";
                else if (isPlaced) color = "#b4ff39";
                else if (isCompare) color = "#ff6a3d";
                else if (inRange) color = "#4a4a52";

                return (
                  <motion.div
                    key={i}
                    className="ms-bar"
                    style={{
                      height: `${(value / max) * 400 + 6}px`,
                      backgroundColor: color,
                    }}
                  />
                );
              })}
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
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rotate-ccw-icon lucide-rotate-ccw"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
          </button>

          <button
            className="ms-icon-btn"
            onClick={stepBack}
            disabled={index === 0}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-skip-back-icon lucide-skip-back"><path d="M17.971 4.285A2 2 0 0 1 21 6v12a2 2 0 0 1-3.029 1.715l-9.997-5.998a2 2 0 0 1-.003-3.432z" /><path d="M3 20V4" /></svg>
          </button>

          <button className="ms-play-btn" onClick={togglePlay}>
            {playing ? <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0a0a0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pause-icon lucide-pause"><rect x="14" y="3" width="5" height="18" rx="1" /><rect x="5" y="3" width="5" height="18" rx="1" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0a0a0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-play-icon lucide-play"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" /></svg>}
          </button>

          <button
            className="ms-icon-btn"
            onClick={stepForward}
            disabled={index === steps.length - 1}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-skip-forward-icon lucide-skip-forward"><path d="M21 4v16" /><path d="M6.029 4.285A2 2 0 0 0 3 6v12a2 2 0 0 0 3.029 1.715l9.997-5.998a2 2 0 0 0 .003-3.432z" /></svg>
          </button>

          <button className="ms-shuffle-btn" onClick={shuffle}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shuffle-icon lucide-shuffle"><path d="m18 14 4 4-4 4" /><path d="m18 2 4 4-4 4" /><path d="M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22" /><path d="M2 6h1.972a4 4 0 0 1 3.6 2.2" /><path d="M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45" /></svg>
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
