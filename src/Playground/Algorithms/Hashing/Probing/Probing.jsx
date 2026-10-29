import { useState, useEffect } from "react";
import { useAutoAdvance } from "../../../shared/useAutoAdvance";
import { ResetIcon, StepBackIcon, PlayIcon, PauseIcon, StepForwardIcon, ShuffleIcon } from "../../../shared/icons";
import "./Probing.css";

const TABLE_SIZE = 7;

function probingSteps(key, existingTable) {
  const table = [...existingTable];
  const steps = [];
  let probeCount = 0;

  function save(codeLine, description, phase, slot = -1, landed = false) {
    steps.push({
      table: [...table],
      key,
      codeLine,
      description,
      phase,
      slot,
      probeCount,
      landed,
    });
  }

  save(1, `insert(${key})`, "start");

  let slot = key % TABLE_SIZE;

  save(2, `index = ${key} % ${TABLE_SIZE} = ${slot}`, "hash", slot);

  let attempts = 0;

  save(4, `Check table[${slot}]`, "checking", slot);

  while (table[slot] !== null && attempts < TABLE_SIZE) {
    probeCount++;

    save(4, `table[${slot}] occupied by ${table[slot]} — keep probing`, "occupied", slot);

    slot = (slot + 1) % TABLE_SIZE;
    attempts++;

    save(5, `index = (index + 1) % ${TABLE_SIZE} = ${slot}`, "checking", slot);
  }

  let landed = false;

  if (attempts >= TABLE_SIZE) {
    save(8, "Table full — insert failed", "full", -1);
  } else {
    table[slot] = key;
    landed = true;
    save(9, `table[${slot}] = ${key}`, "placed", slot, true);
  }

  save(10, "Insert complete", "done", slot, landed);

  return steps;
}

const emptyTable = () => new Array(TABLE_SIZE).fill(null);

const CodeLines = [
  <>
    <span className="prb-type">void</span> insert
    <span className="prb-symbol">(</span><span className="prb-type">int</span> key<span className="prb-symbol">)</span>{" "}
    <span className="prb-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="prb-type">int</span> index <span className="prb-symbol">=</span> key{" "}
    <span className="prb-symbol">%</span> SIZE<span className="prb-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="prb-type">int</span> attempts <span className="prb-symbol">=</span>{" "}
    <span className="prb-number">0</span><span className="prb-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="prb-keyword">while</span> <span className="prb-symbol">(</span>table
    <span className="prb-symbol">[</span>index<span className="prb-symbol">]</span>{" "}
    <span className="prb-symbol">!=</span> EMPTY <span className="prb-symbol">&amp;&amp;</span> attempts{" "}
    <span className="prb-symbol">&lt;</span> SIZE<span className="prb-symbol">)</span>{" "}
    <span className="prb-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;index <span className="prb-symbol">=</span> <span className="prb-symbol">(</span>
    index <span className="prb-symbol">+</span> <span className="prb-number">1</span>
    <span className="prb-symbol">)</span> <span className="prb-symbol">%</span> SIZE
    <span className="prb-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;attempts<span className="prb-symbol">++;</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="prb-symbol">{"}"}</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="prb-keyword">if</span> <span className="prb-symbol">(</span>attempts{" "}
    <span className="prb-symbol">==</span> SIZE<span className="prb-symbol">)</span>{" "}
    <span className="prb-keyword">return</span><span className="prb-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;table<span className="prb-symbol">[</span>index<span className="prb-symbol">]</span>{" "}
    <span className="prb-symbol">=</span> key<span className="prb-symbol">;</span>
  </>,

  <>
    <span className="prb-symbol">{"}"}</span>
  </>,
];

const Probing = () => {
  const [inputValue, setInputValue] = useState("");
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(5);

  const [pendingKey, setPendingKey] = useState(null);
  const [table, setTable] = useState(emptyTable());
  const [insertions, setInsertions] = useState(0);
  const [totalProbes, setTotalProbes] = useState(0);
  const [longestProbe, setLongestProbe] = useState(0);

  const steps = probingSteps(pendingKey ?? 0, table);
  const current = steps[index];

  const nextKey = () =>
    inputValue === "" || isNaN(Number(inputValue))
      ? Math.floor(Math.random() * 90) + 10
      : Number(inputValue);

  const reset = () => {
    setPlaying(false);
    setIndex(0);
    setPendingKey(null);
    setInputValue("");
    setTable(emptyTable());
    setInsertions(0);
    setTotalProbes(0);
    setLongestProbe(0);
  };

  const stepForward = () => {
    setPlaying(false);

    if (index < steps.length - 1) {
      if (pendingKey === null) setPendingKey(nextKey());
      setIndex(index + 1);
    }
  };

  const stepBack = () => {
    setPlaying(false);
    if (index > 0) setIndex(index - 1);
  };

  const togglePlay = () => {
    if (index === steps.length - 1) setIndex(0);
    if (pendingKey === null) setPendingKey(nextKey());
    setPlaying(!playing);
  };

  const shuffle = () => {
    const fresh = emptyTable();
    let placed = 0;
    let probes = 0;
    let longest = 0;

    for (let i = 0; i < 5; i++) {
      const key = Math.floor(Math.random() * 90) + 10;
      let slot = key % TABLE_SIZE;
      let attempts = 0;

      while (fresh[slot] !== null && attempts < TABLE_SIZE) {
        slot = (slot + 1) % TABLE_SIZE;
        attempts++;
      }

      if (attempts < TABLE_SIZE) {
        fresh[slot] = key;
        placed++;
        probes += attempts;
        longest = Math.max(longest, attempts);
      }
    }

    setPlaying(false);
    setIndex(0);
    setPendingKey(null);
    setInputValue("");
    setTable(fresh);
    setInsertions(placed);
    setTotalProbes(probes);
    setLongestProbe(longest);
  };

  useEffect(() => {
    if (current.phase !== "done" || pendingKey === null) return;

    setTable(current.table);
    setInsertions((n) => n + (current.landed ? 1 : 0));
    setTotalProbes((n) => n + current.probeCount);
    setLongestProbe((n) => Math.max(n, current.probeCount));
    setPendingKey(null);
    setIndex(0);
    setPlaying(false);
  }, [current, pendingKey]);

  useAutoAdvance({ playing, index, setIndex, setPlaying, speed, stepsLength: steps.length });

  return (
    <div className="probing-wrapper">
      <div className="probing">
        <p className="prb-eyebrow">hashing</p>

        <h1 className="prb-title">Probing</h1>

        <div className="prb-header">
          <p className="prb-blurb">
            When a slot's taken, step to the next one — wrapping around the table — until an empty
            slot opens up.
          </p>

          <div className="prb-complexity">
            <div>
              <div className="prb-complexity-label">time</div>
              <div className="prb-time-value">O(1)</div>
            </div>

            <div>
              <div className="prb-complexity-label">space</div>
              <div className="prb-space-value">O(n)</div>
            </div>
          </div>
        </div>

        <div className="prb-grid">
          <div className="prb-stage">
            <div className="prb-table-rows">
              {current.table.map((value, slot) => {
                const isActive = slot === current.slot;
                const isOccupiedProbe = isActive && current.phase === "occupied";
                const isChecking = isActive && current.phase === "checking";
                const isPlaced = isActive && current.phase === "placed";

                return (
                  <div key={slot} className="prb-row">
                    <span className="prb-row-index">{slot}</span>

                    <div
                      className={`prb-slot ${value === null ? "prb-slot-empty" : ""} ${isOccupiedProbe || isChecking ? "prb-slot-probing" : ""
                        } ${isPlaced ? "prb-slot-placed" : ""}`}
                    >
                      {value === null ? "·" : value}
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="prb-status">{current.description}</p>
          </div>

          <div className="prb-code-panel">
            <div className="prb-code-header">
              <div className="prb-dummy-btns">
                <span className="prb-red-btn"></span>
                <span className="prb-yellow-btn"></span>
                <span className="prb-green-btn"></span>
                <span className="prb-filename">probing.cpp</span>
              </div>

              <span className="prb-header-complexity">O(1)</span>
            </div>

            <pre className="prb-code-block">
              {CodeLines.map((line, i) => (
                <div
                  key={i}
                  className={`prb-code-line ${current.codeLine === i + 1 ? "prb-code-line-active" : ""}`}
                >
                  <span className="prb-line-no">{i + 1}</span>
                  {line}
                </div>
              ))}
            </pre>
          </div>
        </div>

        <div className="prb-controls">
          <button className="prb-icon-btn" onClick={reset}>
            <ResetIcon />
          </button>

          <button className="prb-icon-btn" onClick={stepBack} disabled={index === 0}>
            <StepBackIcon />
          </button>

          <button className="prb-play-btn" onClick={togglePlay}>
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>

          <button className="prb-icon-btn" onClick={stepForward} disabled={false}>
            <StepForwardIcon />
          </button>

          <button className="prb-shuffle-btn" onClick={shuffle}>
            <ShuffleIcon />
            Random keys
          </button>

          <input
            className="prb-input"
            type="number"
            placeholder="key"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />

          <div className="prb-speed">
            <span>SPEED</span>
            <input type="range" min="1" max="10" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
          </div>

          <span className="prb-steps">
            {index + 1} / {steps.length}
          </span>
        </div>

        <div className="prb-stats">
          <span>
            insertions: <b>{insertions}</b>
          </span>

          <span>
            probe steps: <b>{totalProbes}</b>
          </span>

          <span>
            longest probe: <b>{longestProbe}</b>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Probing;
