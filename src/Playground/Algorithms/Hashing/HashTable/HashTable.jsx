import { useState, useEffect } from "react";
import { useAutoAdvance } from "../../../shared/useAutoAdvance";
import { ResetIcon, StepBackIcon, PlayIcon, PauseIcon, StepForwardIcon, ShuffleIcon } from "../../../shared/icons";
import "./HashTable.css";

const TABLE_SIZE = 7;

function hashTableSteps(key, existingTable) {
  const table = [...existingTable];
  const steps = [];

  function save(codeLine, description, phase, slot = -1) {
    steps.push({
      table: [...table],
      key,
      codeLine,
      description,
      phase,
      slot,
    });
  }

  save(1, `insert(${key})`, "start");

  const slot = key % TABLE_SIZE;

  save(2, `index = ${key} % ${TABLE_SIZE} = ${slot}`, "hash", slot);

  save(3, `Check table[${slot}]`, "check", slot);

  if (table[slot] === null) {
    table[slot] = key;
    save(4, `table[${slot}] = ${key}`, "placed", slot);
  } else {
    save(6, `Slot ${slot} already holds ${table[slot]} — collision`, "collision", slot);
  }

  save(8, "Insert complete", "done", slot);

  return steps;
}

const emptyTable = () => new Array(TABLE_SIZE).fill(null);

const CodeLines = [
  <>
    <span className="hst-type">void</span> insert
    <span className="hst-symbol">(</span><span className="hst-type">int</span> key<span className="hst-symbol">)</span>{" "}
    <span className="hst-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="hst-type">int</span> index <span className="hst-symbol">=</span> key{" "}
    <span className="hst-symbol">%</span> SIZE<span className="hst-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="hst-keyword">if</span> <span className="hst-symbol">(</span>table
    <span className="hst-symbol">[</span>index<span className="hst-symbol">]</span>{" "}
    <span className="hst-symbol">==</span> EMPTY<span className="hst-symbol">)</span>{" "}
    <span className="hst-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;table<span className="hst-symbol">[</span>index<span className="hst-symbol">]</span>{" "}
    <span className="hst-symbol">=</span> key<span className="hst-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="hst-symbol">{"}"}</span> <span className="hst-keyword">else</span>{" "}
    <span className="hst-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;<span className="hst-function">cout</span> <span className="hst-symbol">&lt;&lt;</span>{" "}
    <span className="hst-string">"Collision"</span><span className="hst-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="hst-symbol">{"}"}</span>
  </>,

  <>
    <span className="hst-symbol">{"}"}</span>
  </>,
];

const HashTable = () => {
  const [inputValue, setInputValue] = useState("");
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(5);

  const [pendingKey, setPendingKey] = useState(null);
  const [table, setTable] = useState(emptyTable());
  const [insertions, setInsertions] = useState(0);
  const [collisions, setCollisions] = useState(0);

  const steps = hashTableSteps(pendingKey ?? 0, table);
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
    setCollisions(0);
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
    let collided = 0;

    for (let i = 0; i < 5; i++) {
      const key = Math.floor(Math.random() * 90) + 10;
      const slot = key % TABLE_SIZE;

      if (fresh[slot] === null) {
        fresh[slot] = key;
        placed++;
      } else {
        collided++;
      }
    }

    setPlaying(false);
    setIndex(0);
    setPendingKey(null);
    setInputValue("");
    setTable(fresh);
    setInsertions(placed);
    setCollisions(collided);
  };

  useEffect(() => {
    if (current.phase !== "done" || pendingKey === null) return;

    const landed = current.table[current.slot] === pendingKey;

    setTable(current.table);
    setInsertions((n) => n + (landed ? 1 : 0));
    setCollisions((n) => n + (landed ? 0 : 1));
    setPendingKey(null);
    setIndex(0);
    setPlaying(false);
  }, [current, pendingKey]);

  useAutoAdvance({ playing, index, setIndex, setPlaying, speed, stepsLength: steps.length });

  return (
    <div className="hash-table-wrapper">
      <div className="hash-table">
        <p className="hst-eyebrow">hashing</p>

        <h1 className="hst-title">Hash Table</h1>

        <div className="hst-header">
          <p className="hst-blurb">
            Maps a key to a slot index with key % size — fast, until two keys land on the same slot.
          </p>

          <div className="hst-complexity">
            <div>
              <div className="hst-complexity-label">time</div>
              <div className="hst-time-value">O(1)</div>
            </div>

            <div>
              <div className="hst-complexity-label">space</div>
              <div className="hst-space-value">O(n)</div>
            </div>
          </div>
        </div>

        <div className="hst-grid">
          <div className="hst-stage">
            <div className="hst-table-rows">
              {current.table.map((value, slot) => {
                const isActive = slot === current.slot;
                const isCollision = isActive && current.phase === "collision";
                const isPlaced = isActive && current.phase === "placed";

                return (
                  <div key={slot} className="hst-row">
                    <span className="hst-row-index">{slot}</span>

                    <div
                      className={`hst-slot ${value === null ? "hst-slot-empty" : ""} ${isActive ? "hst-slot-active" : ""
                        } ${isCollision ? "hst-slot-collision" : ""} ${isPlaced ? "hst-slot-placed" : ""}`}
                    >
                      {value === null ? "·" : value}
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="hst-status">{current.description}</p>
          </div>

          <div className="hst-code-panel">
            <div className="hst-code-header">
              <div className="hst-dummy-btns">
                <span className="hst-red-btn"></span>
                <span className="hst-yellow-btn"></span>
                <span className="hst-green-btn"></span>
                <span className="hst-filename">hash_table.cpp</span>
              </div>

              <span className="hst-header-complexity">O(1)</span>
            </div>

            <pre className="hst-code-block">
              {CodeLines.map((line, i) => (
                <div
                  key={i}
                  className={`hst-code-line ${current.codeLine === i + 1 ? "hst-code-line-active" : ""}`}
                >
                  <span className="hst-line-no">{i + 1}</span>
                  {line}
                </div>
              ))}
            </pre>
          </div>
        </div>

        <div className="hst-controls">
          <button className="hst-icon-btn" onClick={reset}>
            <ResetIcon />
          </button>

          <button className="hst-icon-btn" onClick={stepBack} disabled={index === 0}>
            <StepBackIcon />
          </button>

          <button className="hst-play-btn" onClick={togglePlay}>
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>

          <button className="hst-icon-btn" onClick={stepForward} disabled={false}>
            <StepForwardIcon />
          </button>

          <button className="hst-shuffle-btn" onClick={shuffle}>
            <ShuffleIcon />
            Random keys
          </button>

          <input
            className="hst-input"
            type="number"
            placeholder="key"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />

          <div className="hst-speed">
            <span>SPEED</span>
            <input type="range" min="1" max="10" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
          </div>

          <span className="hst-steps">
            {index + 1} / {steps.length}
          </span>
        </div>

        <div className="hst-stats">
          <span>
            insertions: <b>{insertions}</b>
          </span>

          <span>
            collisions: <b>{collisions}</b>
          </span>
        </div>
      </div>
    </div>
  );
};

export default HashTable;
