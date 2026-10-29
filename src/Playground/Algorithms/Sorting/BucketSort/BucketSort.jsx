import { useState } from "react";
import { usePlayback } from "../../../shared/usePlayback";
import { ResetIcon, StepBackIcon, PlayIcon, PauseIcon, StepForwardIcon, ShuffleIcon } from "../../../shared/icons";
import "./BucketSort.css";

const BUCKET_COUNT = 5;

function randomArray(size = 11) {
  const arr = [];

  for (let i = 0; i < size; i++) {
    arr.push(Math.floor(Math.random() * 100));
  }

  return arr;
}

function bucketSortSteps(input) {
  const arr = [...input];
  const n = arr.length;
  const steps = [];

  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const bucketSize = Math.max(1, Math.ceil((max - min + 1) / BUCKET_COUNT));

  const buckets = Array.from({ length: BUCKET_COUNT }, () => []);

  let distributions = 0;
  let comparisons = 0;

  function save(line, description, opts = {}) {
    steps.push({
      array: [...arr],
      codeLine: line,
      description,
      phase: opts.phase,
      activeIndex: opts.activeIndex ?? -1,
      activeBucket: opts.activeBucket ?? -1,
      buckets: buckets.map((b) => [...b]),
      output: opts.output ? [...opts.output] : [],
      bucketSize,
      distributions,
      comparisons,
    });
  }

  save(1, "Started Bucket Sort", { phase: "start" });
  save(3, `${BUCKET_COUNT} buckets, bucketSize = ${bucketSize}`, { phase: "start" });

  for (let i = 0; i < n; i++) {
    save(5, `Check i < ${n}`, { phase: "distributing", activeIndex: i });

    const bucketIdx = Math.min(BUCKET_COUNT - 1, Math.floor((arr[i] - min) / bucketSize));

    buckets[bucketIdx].push(arr[i]);
    distributions++;

    save(6, `arr[${i}] = ${arr[i]} → bucket[${bucketIdx}]`, {
      phase: "distributing", activeIndex: i, activeBucket: bucketIdx,
    });
  }

  for (let b = 0; b < BUCKET_COUNT; b++) {
    if (buckets[b].length < 2) continue;

    save(9, `Sort bucket[${b}] = [${buckets[b].join(", ")}]`, { phase: "sorting-bucket", activeBucket: b });

    for (let j = 1; j < buckets[b].length; j++) {
      let k = j;
      comparisons++;

      while (k > 0 && buckets[b][k - 1] > buckets[b][k]) {
        const tmp = buckets[b][k - 1];
        buckets[b][k - 1] = buckets[b][k];
        buckets[b][k] = tmp;
        k--;
        comparisons++;
      }

      save(9, `bucket[${b}] → [${buckets[b].join(", ")}]`, { phase: "sorting-bucket", activeBucket: b });
    }
  }

  const output = [];

  for (let b = 0; b < BUCKET_COUNT; b++) {
    for (const val of buckets[b]) {
      output.push(val);

      save(13, `Append ${val} from bucket[${b}] → output`, {
        phase: "concatenating", activeBucket: b, output,
      });
    }
  }

  for (let i = 0; i < n; i++) arr[i] = output[i];

  save(1, "Array Sorted!", { phase: "done", output });

  return steps;
}

const CodeLines = [
  <>
    <span className="bks-type">void</span> bucketSort
    <span className="bks-symbol">(</span>
    <span className="bks-type">vector</span>
    <span className="bks-symbol">&lt;</span>
    <span className="bks-type">int</span>
    <span className="bks-symbol">&gt;&amp;</span> arr
    <span className="bks-symbol">)</span>{" "}
    <span className="bks-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;
    <span className="bks-type">int</span> bucketCount
    <span className="bks-symbol"> = </span>
    <span className="bks-number">5</span>
    <span className="bks-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;
    <span className="bks-type">int</span> bucketSize
    <span className="bks-symbol"> = </span>
    ceil<span className="bks-symbol">((</span>maxVal <span className="bks-symbol">-</span> minVal <span className="bks-symbol">+</span> <span className="bks-number">1</span>
    <span className="bks-symbol">) / </span>bucketCount<span className="bks-symbol">);</span>
  </>,

  <>
    &nbsp;&nbsp;
    <span className="bks-type">vector</span>
    <span className="bks-symbol">&lt;</span>
    <span className="bks-type">vector</span>
    <span className="bks-symbol">&lt;</span>
    <span className="bks-type">int</span>
    <span className="bks-symbol">&gt;&gt;</span> buckets
    <span className="bks-symbol">(</span>bucketCount
    <span className="bks-symbol">);</span>
  </>,

  <>
    &nbsp;&nbsp;
    <span className="bks-keyword">for</span>
    <span className="bks-symbol">(</span>
    <span className="bks-type">int</span> i
    <span className="bks-symbol"> = </span>
    <span className="bks-number">0</span>
    <span className="bks-symbol">;</span> i
    <span className="bks-symbol"> &lt; </span>n
    <span className="bks-symbol">;</span> i
    <span className="bks-symbol">++</span>
    <span className="bks-symbol">)</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;
    buckets<span className="bks-symbol">[(</span>
    arr<span className="bks-symbol">[</span>i<span className="bks-symbol">]</span>
    <span className="bks-symbol"> - </span>minVal
    <span className="bks-symbol">) / </span>bucketSize
    <span className="bks-symbol">].</span>push_back
    <span className="bks-symbol">(</span>
    arr<span className="bks-symbol">[</span>i<span className="bks-symbol">]);</span>
  </>,

  <>&nbsp;</>,

  <>
    &nbsp;&nbsp;
    <span className="bks-keyword">for</span>
    <span className="bks-symbol">(</span>
    <span className="bks-type">int</span> b
    <span className="bks-symbol"> = </span>
    <span className="bks-number">0</span>
    <span className="bks-symbol">;</span> b
    <span className="bks-symbol"> &lt; </span>bucketCount
    <span className="bks-symbol">;</span> b
    <span className="bks-symbol">++</span>
    <span className="bks-symbol">)</span>
  </>,

  <>&nbsp;</>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;
    sort<span className="bks-symbol">(</span>
    buckets<span className="bks-symbol">[</span>b<span className="bks-symbol">].</span>begin
    <span className="bks-symbol">(),</span> buckets<span className="bks-symbol">[</span>b<span className="bks-symbol">].</span>end
    <span className="bks-symbol">());</span>
  </>,

  <>&nbsp;</>,

  <>
    &nbsp;&nbsp;
    <span className="bks-type">int</span> idx
    <span className="bks-symbol"> = </span>
    <span className="bks-number">0</span>
    <span className="bks-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;
    <span className="bks-keyword">for</span>
    <span className="bks-symbol">(</span>
    <span className="bks-type">int</span> b
    <span className="bks-symbol"> = </span>
    <span className="bks-number">0</span>
    <span className="bks-symbol">;</span> b
    <span className="bks-symbol"> &lt; </span>bucketCount
    <span className="bks-symbol">;</span> b
    <span className="bks-symbol">++</span>
    <span className="bks-symbol">)</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;
    <span className="bks-keyword">for</span>
    <span className="bks-symbol">(</span>
    <span className="bks-type">int</span> val
    <span className="bks-symbol"> : </span>buckets<span className="bks-symbol">[</span>b<span className="bks-symbol">])</span> arr
    <span className="bks-symbol">[</span>idx<span className="bks-symbol">++] = </span>val
    <span className="bks-symbol">;</span>
  </>,

  <>
    <span className="bks-symbol">{"}"}</span>
  </>,
];

const BucketSort = () => {
  const [seed, setSeed] = useState(randomArray());

  const steps = bucketSortSteps(seed);
  const { index, playing, speed, setSpeed, reset, stepForward, stepBack, togglePlay } = usePlayback(steps.length);
  const current = steps[index];
  const isDone = current.phase === "done";

  const min = Math.min(...current.array);

  const shuffle = () => {
    setSeed(randomArray());
    reset();
  };

  return (
    <div className="bucket-sort-wrapper">
      <div className="bucket-sort">
        <p className="bks-eyebrow">sorting</p>

        <h1 className="bks-title">Bucket Sort</h1>

        <div className="bks-header">
          <p className="bks-blurb">
            Distributes values into buckets by range, sorts each bucket individually, then concatenates them back together.
          </p>

          <div className="bks-complexity">
            <div>
              <div className="bks-complexity-label">time</div>
              <div className="bks-time-value">O(n + k)</div>
            </div>

            <div>
              <div className="bks-complexity-label">space</div>
              <div className="bks-space-value">O(n + k)</div>
            </div>
          </div>
        </div>

        <div className="bks-grid">
          <div className="bks-stage">
            <div className="bks-row">
              {current.array.map((value, i) => {
                const isActive = i === current.activeIndex;

                return (
                  <div key={i} className="bks-chip-wrapper">
                    <div className="bks-chip-index">{i}</div>
                    <div className={`bks-chip ${isActive ? "bks-chip-active" : ""}`}>
                      {value}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bks-buckets">
              {current.buckets.map((bucket, b) => {
                const isActive = b === current.activeBucket;
                const rangeStart = min + b * current.bucketSize;
                const rangeEnd = rangeStart + current.bucketSize - 1;

                return (
                  <div
                    key={b}
                    className={`bks-lane ${isActive ? "bks-lane-active" : ""}`}
                  >
                    <div className="bks-lane-label">
                      bucket {b}
                      <span className="bks-lane-range">{rangeStart}–{rangeEnd}</span>
                    </div>

                    <div className="bks-lane-stack">
                      {bucket.map((value, vi) => (
                        <div key={vi} className="bks-bucket-chip">
                          {value}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bks-row bks-output-row">
              {current.array.map((_, i) => {
                const val = current.output[i];
                const isPlaced = val !== undefined;

                return (
                  <div key={i} className="bks-chip-wrapper">
                    <div className={`bks-chip bks-output-chip ${isPlaced ? "bks-chip-placed" : ""}`}>
                      {isPlaced ? val : "·"}
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="bks-status">{current.description}</p>
          </div>

          <div className="bks-code-panel">
            <div className="bks-code-header">
              <div className="bks-dummy-btns">
                <span className="bks-red-btn"></span>
                <span className="bks-yellow-btn"></span>
                <span className="bks-green-btn"></span>
                <span className="bks-filename">bucket_sort.cpp</span>
              </div>

              <span className="bks-header-complexity">O(n + k)</span>
            </div>

            <pre className="bks-code-block">
              {CodeLines.map((line, i) => (
                <div
                  key={i}
                  className={`bks-code-line ${current.codeLine === i + 1 ? "bks-code-line-active" : ""}`}
                >
                  <span className="bks-line-no">{i + 1}</span>
                  {line}
                </div>
              ))}
            </pre>
          </div>
        </div>

        <div className="bks-controls">
          <button className="bks-icon-btn" onClick={reset}>
            <ResetIcon />
          </button>

          <button
            className="bks-icon-btn"
            onClick={stepBack}
            disabled={index === 0}
          >
            <StepBackIcon />
          </button>

          <button className="bks-play-btn" onClick={togglePlay}>
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>

          <button
            className="bks-icon-btn"
            onClick={stepForward}
            disabled={index === steps.length - 1}
          >
            <StepForwardIcon />
          </button>

          <button className="bks-shuffle-btn" onClick={shuffle}>
            <ShuffleIcon />
            Shuffle
          </button>

          <div className="bks-speed">
            <span>SPEED</span>

            <input
              type="range"
              min="1"
              max="10"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
          </div>

          <span className="bks-steps">
            {index + 1} / {steps.length}
          </span>
        </div>

        <div className="bks-stats">
          <span>
            distributions: <b>{current.distributions}</b>
          </span>

          <span>
            comparisons: <b>{current.comparisons}</b>
          </span>

          <span>
            buckets: <b>{BUCKET_COUNT}</b>
          </span>
        </div>

        {isDone && <p className="bks-done-flag">Array Sorted</p>}
      </div>
    </div>
  );
};

export default BucketSort;
