import { useState, useEffect } from "react";
import { useAutoAdvance } from "../../../shared/useAutoAdvance";
import { ResetIcon, StepBackIcon, PlayIcon, PauseIcon, StepForwardIcon, ShuffleIcon } from "../../../shared/icons";
import "./Chaining.css";

const TABLE_SIZE = 7;

function chainingSteps(key, existingTable) {
  const table = existingTable.map((chain) => [...chain]);
  const steps = [];

  function save(codeLine, description, phase, slot = -1) {
    steps.push({
      table: table.map((chain) => [...chain]),
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

  save(
    3,
    table[slot].length
      ? `table[${slot}] already has ${table[slot].length} key(s) — append ${key} to its chain`
      : `table[${slot}]'s chain is empty — append ${key}`,
    "appending",
    slot
  );

  table[slot].push(key);

  save(3, `${key} appended to table[${slot}]'s chain`, "appended", slot);

  save(4, "Insert complete", "done", slot);

  return steps;
}

const emptyTable = () => Array.from({ length: TABLE_SIZE }, () => []);

const CodeLines = [
  <>
    <span className="chn-type">void</span> insert
    <span className="chn-symbol">(</span><span className="chn-type">int</span> key<span className="chn-symbol">)</span>{" "}
    <span className="chn-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;<span className="chn-type">int</span> index <span className="chn-symbol">=</span> key{" "}
    <span className="chn-symbol">%</span> SIZE<span className="chn-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;table<span className="chn-symbol">[</span>index<span className="chn-symbol">]</span>
    <span className="chn-symbol">.</span>push_back<span className="chn-symbol">(</span>key<span className="chn-symbol">)</span>
    <span className="chn-symbol">;</span>
  </>,

  <>
    <span className="chn-symbol">{"}"}</span>
  </>,
];

const Chaining = () => {
  const [inputValue, setInputValue] = useState("");
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(5);

  const [pendingKey, setPendingKey] = useState(null);
  const [table, setTable] = useState(emptyTable());
  const [insertions, setInsertions] = useState(0);

  const steps = chainingSteps(pendingKey ?? 0, table);
  const current = steps[index];

  const totalKeys = current.table.reduce((sum, chain) => sum + chain.length, 0);
  const longestChain = current.table.reduce((max, chain) => Math.max(max, chain.length), 0);

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

    for (let i = 0; i < 6; i++) {
      const key = Math.floor(Math.random() * 90) + 10;
      fresh[key % TABLE_SIZE].push(key);
    }

    setPlaying(false);
    setIndex(0);
    setPendingKey(null);
    setInputValue("");
    setTable(fresh);
    setInsertions(6);
  };

  useEffect(() => {
    if (current.phase !== "done" || pendingKey === null) return;

    setTable(current.table);
    setInsertions((n) => n + 1);
    setPendingKey(null);
    setIndex(0);
    setPlaying(false);
  }, [current, pendingKey]);

  useAutoAdvance({ playing, index, setIndex, setPlaying, speed, stepsLength: steps.length });

  return (
    <div className="chaining-wrapper">
      <div className="chaining">
        <p className="chn-eyebrow">hashing</p>

        <h1 className="chn-title">Chaining</h1>

        <div className="chn-header">
          <p className="chn-blurb">
            Collisions aren't a problem when every slot holds a linked list — just append the new key
            to its slot's chain.
          </p>

          <div className="chn-complexity">
            <div>
              <div className="chn-complexity-label">time</div>
              <div className="chn-time-value">O(1 + &alpha;)</div>
            </div>

            <div>
              <div className="chn-complexity-label">space</div>
              <div className="chn-space-value">O(n)</div>
            </div>
          </div>
        </div>

        <div className="chn-grid">
          <div className="chn-stage">
            <div className="chn-table-rows">
              {current.table.map((chain, slot) => {
                const isActive = slot === current.slot;
                const justAppended = isActive && current.phase === "appended";

                return (
                  <div key={slot} className="chn-row">
                    <span className="chn-row-index">{slot}</span>

                    <div className={`chn-chain ${isActive ? "chn-chain-active" : ""}`}>
                      {chain.map((value, i) => {
                        const isNew = justAppended && i === chain.length - 1;

                        return (
                          <span key={i} className="chn-node-group">
                            <span className={`chn-node ${isNew ? "chn-node-new" : ""}`}>{value}</span>
                            <span className="chn-arrow">&rarr;</span>
                          </span>
                        );
                      })}

                      <span className="chn-null">&empty;</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="chn-status">{current.description}</p>
          </div>

          <div className="chn-code-panel">
            <div className="chn-code-header">
              <div className="chn-dummy-btns">
                <span className="chn-red-btn"></span>
                <span className="chn-yellow-btn"></span>
                <span className="chn-green-btn"></span>
                <span className="chn-filename">chaining.cpp</span>
              </div>

              <span className="chn-header-complexity">O(1 + &alpha;)</span>
            </div>

            <pre className="chn-code-block">
              {CodeLines.map((line, i) => (
                <div
                  key={i}
                  className={`chn-code-line ${current.codeLine === i + 1 ? "chn-code-line-active" : ""}`}
                >
                  <span className="chn-line-no">{i + 1}</span>
                  {line}
                </div>
              ))}
            </pre>
          </div>
        </div>

        <div className="chn-controls">
          <button className="chn-icon-btn" onClick={reset}>
            <ResetIcon />
          </button>

          <button className="chn-icon-btn" onClick={stepBack} disabled={index === 0}>
            <StepBackIcon />
          </button>

          <button className="chn-play-btn" onClick={togglePlay}>
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>

          <button className="chn-icon-btn" onClick={stepForward} disabled={false}>
            <StepForwardIcon />
          </button>

          <button className="chn-shuffle-btn" onClick={shuffle}>
            <ShuffleIcon />
            Random keys
          </button>

          <input
            className="chn-input"
            type="number"
            placeholder="key"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />

          <div className="chn-speed">
            <span>SPEED</span>
            <input type="range" min="1" max="10" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
          </div>

          <span className="chn-steps">
            {index + 1} / {steps.length}
          </span>
        </div>

        <div className="chn-stats">
          <span>
            insertions: <b>{insertions}</b>
          </span>

          <span>
            keys stored: <b>{totalKeys}</b>
          </span>

          <span>
            longest chain: <b>{longestChain}</b>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Chaining;
