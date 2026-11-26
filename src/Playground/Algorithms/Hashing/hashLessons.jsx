import { useMemo, useState } from "react";
import Lesson from "../../../lesson/Lesson";
import IsoArray from "../../../iso/IsoArray";
import { usePlayback } from "../../shared/usePlayback";

// Hash table basics, separate chaining and linear probing. Keys float above
// the bucket their hash points at, then drop in. Chains stack upward.

const randKeys = (n, max = 99) => {
  const s = new Set();
  while (s.size < n) s.add(Math.floor(Math.random() * max) + 1);
  return [...s];
};

/* ---------- direct hashing ---------- */

const M_TABLE = 7;

const TABLE_CODE = [
  "int hash(int key) { return key % M; }",
  "",
  "void put(int key) {",
  "  table[hash(key)] = key;",
  "}",
  "",
  "bool contains(int key) {",
  "  return table[hash(key)] == key;",
  "}",
];

// Pick keys that land in distinct buckets, so this lesson is about the idea
// of hashing and the collision lessons come next.
function distinctKeys(n, m) {
  const used = new Set();
  const keys = [];
  while (keys.length < n) {
    const k = Math.floor(Math.random() * 98) + 1;
    if (!used.has(k % m)) {
      used.add(k % m);
      keys.push(k);
    }
  }
  return keys;
}

function tableSteps(keys) {
  const m = M_TABLE;
  const table = Array(m).fill(null);
  const steps = [];
  let ops = 0;
  const save = (s) => steps.push({ table: [...table], floating: null, hot: null, ops, ...s });

  save({ phase: "idea", line: 1, title: "Turn a key into an index", body: `A hash function maps any key to one of ${m} buckets. Here it's key mod ${m}: the remainder after dividing by ${m}.`, notice: "Jumping straight to the right bucket is what makes lookups O(1) on average." });

  keys.forEach((k) => {
    const h = k % m;
    ops++;
    save({ phase: "hash", line: 1, floating: { key: k, pos: h }, hot: h, title: `hash(${k}) = ${k} mod ${m} = ${h}`, body: `${k} ÷ ${m} leaves remainder ${h}, so ${k} belongs in bucket ${h}.` });
    table[h] = k;
    save({ phase: "put", line: 4, hot: h, title: `Put ${k} in bucket ${h}`, body: "No searching: the hash said exactly where to go." });
  });

  const probe = keys[Math.floor(Math.random() * keys.length)];
  const h = probe % m;
  ops++;
  save({ phase: "lookup", line: 8, floating: { key: probe, pos: h, ghost: true }, hot: h, title: `Is ${probe} in the table?`, body: `Hash it again: bucket ${h}. Look in that one bucket only, and there it is.`, notice: "Every key went into its own bucket here. When two keys share a bucket, that's a collision: the next two lessons handle it." });

  return steps;
}

/* ---------- chaining ---------- */

const M_CHAIN = 5;

const CHAIN_CODE = [
  "vector<list<int>> table(M);",
  "",
  "void put(int key) {",
  "  table[key % M].push_back(key);",
  "}",
  "",
  "bool contains(int key) {",
  "  for (int x : table[key % M])",
  "    if (x == key) return true;",
  "  return false;",
  "}",
];

function chainSteps(keys) {
  const m = M_CHAIN;
  const chains = Array.from({ length: m }, () => []);
  const steps = [];
  let ops = 0;
  const save = (s) => steps.push({ chains: chains.map((c) => [...c]), floating: null, hot: null, scan: null, ops, ...s });

  save({ phase: "idea", line: 1, title: "Each bucket holds a list", body: `With only ${m} buckets, keys will collide. Chaining lets each bucket hold a short list, so colliding keys just queue up together.`, notice: "If keys spread evenly, each list stays about n / m long, the load factor α." });

  keys.forEach((k) => {
    const h = k % m;
    ops++;
    save({ phase: "hash", line: 4, floating: { key: k, pos: h, level: chains[h].length }, hot: h, title: `hash(${k}) = ${h}`, body: chains[h].length ? `Bucket ${h} already holds ${chains[h].join(", ")}. That's a collision, and it's fine: add to the list.` : `Bucket ${h} is empty.` });
    chains[h].push(k);
    save({ phase: "put", line: 4, hot: h, title: `${k} joins bucket ${h}`, body: `Bucket ${h} now holds ${chains[h].length} key${chains[h].length > 1 ? "s" : ""}.` });
  });

  const target = keys[keys.length - 1];
  const h = target % m;
  chains[h].forEach((x, i) => {
    ops++;
    save({ phase: "scan", line: 9, hot: h, scan: i, title: `Check ${x}`, body: x === target ? `${x} is the key we wanted. Found it after looking at ${i + 1} key${i ? "s" : ""}.` : `Not ${target}, keep walking the list.` });
  });

  save({ phase: "done", line: 9, hot: h, scan: chains[h].indexOf(target), title: `Found ${target}`, body: `Only bucket ${h}'s list was searched, never the whole table.` });
  return steps;
}

/* ---------- linear probing ---------- */

const M_PROBE = 8;

const PROBE_CODE = [
  "void put(int key) {",
  "  int i = key % M;",
  "  while (table[i] != EMPTY) {",
  "    i = (i + 1) % M;",
  "  }",
  "  table[i] = key;",
  "}",
];

// Force a few collisions so probing actually happens.
function collidingKeys() {
  const base = Math.floor(Math.random() * M_PROBE);
  const keys = new Set();
  while (keys.size < 3) keys.add(base + M_PROBE * (Math.floor(Math.random() * 11) + 1));
  while (keys.size < 6) keys.add(Math.floor(Math.random() * 98) + 1);
  return [...keys].sort(() => Math.random() - 0.5);
}

function probeSteps(keys) {
  const m = M_PROBE;
  const table = Array(m).fill(null);
  const steps = [];
  let probes = 0;
  const save = (s) => steps.push({ table: [...table], floating: null, hot: null, probes, ...s });

  save({ phase: "idea", line: 1, title: "If the bucket is taken, try the next", body: "Open addressing keeps every key in the table itself. On a collision, step to the next bucket, wrapping around at the end, until an empty one turns up.", notice: "Keys that collide bunch together into clusters, which makes later probes longer. Keep the table well under full." });

  keys.forEach((k) => {
    let i = k % m;
    probes++;
    save({ phase: "hash", line: 2, floating: { key: k, pos: i }, hot: i, title: `hash(${k}) = ${i}`, body: table[i] === null ? `Bucket ${i} is free.` : `Bucket ${i} already holds ${table[i]}.` });
    while (table[i] !== null) {
      const from = i;
      i = (i + 1) % m;
      probes++;
      save({ phase: "probe", line: 4, floating: { key: k, pos: i }, hot: i, title: `Taken, try bucket ${i}`, body: from === m - 1 ? `Past the end, so wrap around to bucket 0.` : table[i] === null ? `Bucket ${i} is free.` : `Bucket ${i} holds ${table[i]} too. Keep going.` });
    }
    table[i] = k;
    save({ phase: "put", line: 6, hot: i, title: `${k} goes in bucket ${i}`, body: i === k % m ? "Straight in, no probing." : `It sits ${(i - (k % m) + m) % m} bucket${(i - (k % m) + m) % m > 1 ? "s" : ""} away from its home bucket ${k % m}.` });
  });

  save({ phase: "done", line: 7, title: `${keys.length} keys, ${probes} probes`, body: `Load factor ${keys.length}/${m}. As the table fills, the average number of probes per insert rises sharply.` });
  return steps;
}

/* ---------- page ---------- */

const TAGS = { idea: "Idea", hash: "Hash", put: "Insert", lookup: "Lookup", scan: "Scan", done: "Done", probe: "Probe" };

const HashLesson = ({ kind }) => {
  const make = () => (kind === "table" ? distinctKeys(5, M_TABLE) : kind === "chain" ? randKeys(9) : collidingKeys());
  const [keys, setKeys] = useState(make);
  const steps = useMemo(() => (kind === "table" ? tableSteps(keys) : kind === "chain" ? chainSteps(keys) : probeSteps(keys)), [kind, keys]);
  const playback = usePlayback(steps.length);
  const s = steps[Math.min(playback.index, steps.length - 1)];
  const m = kind === "table" ? M_TABLE : kind === "chain" ? M_CHAIN : M_PROBE;

  const cells = [];
  const tiles = {};
  if (kind === "chain") {
    s.chains.forEach((chain, b) => {
      if (!chain.length) tiles[b] = "slot";
      chain.forEach((k, level) => {
        const scanning = b === s.hot && s.scan !== null;
        cells.push({
          id: `k${k}`,
          value: k,
          pos: b,
          lift: level * 0.42,
          h: 0.38,
          shape: "cylinder",
          shadow: false,
          tone: scanning && level === s.scan ? (s.phase === "done" ? "sage" : "coral") : scanning && level < s.scan ? "dark" : b === s.hot ? "soft" : "idle",
        });
      });
    });
    if (s.floating) cells.push({ id: `k${s.floating.key}`, value: s.floating.key, pos: s.floating.pos, lift: s.floating.level * 0.42 + 1.6, h: 0.38, shape: "cylinder", tone: "coral" });
  } else {
    s.table.forEach((k, b) => {
      if (k === null) tiles[b] = "slot";
      else cells.push({ id: `k${k}`, value: k, pos: b, tone: b === s.hot ? (s.phase === "lookup" ? "sage" : "coral") : "idle" });
    });
    if (s.floating && !s.floating.ghost) cells.push({ id: `k${s.floating.key}`, value: s.floating.key, pos: s.floating.pos, lift: 2.1, tone: s.table[s.floating.pos] === null ? "coral" : "amber" });
  }

  const callouts = s.hot !== null && s.floating ? [{ id: s.floating.ghost ? `k${s.floating.key}` : `k${s.floating.key}`, text: s.phase === "probe" ? `try bucket ${s.floating.pos}` : `${s.floating.key} mod ${m} = ${s.floating.key % m}`, small: true }] : [];
  const code = kind === "table" ? TABLE_CODE : kind === "chain" ? CHAIN_CODE : PROBE_CODE;
  const filled = kind === "chain" ? s.chains.reduce((a, c) => a + c.length, 0) : s.table.filter((x) => x !== null).length;

  return (
    <Lesson
      steps={steps}
      playback={playback}
      timeline={(st) => st.title}
      onShuffle={() => {
        setKeys(make());
        playback.reset();
      }}
      shuffleLabel="New keys"
      complexity={
        kind === "chain"
          ? [
              { label: "average", value: "O(1 + α)" },
              { label: "worst", value: "O(n)" },
            ]
          : [
              { label: "average", value: "O(1)" },
              { label: "worst", value: "O(n)" },
            ]
      }
      stage={<IsoArray cells={cells} slots={m} tiles={tiles} callouts={callouts} indexHighlight={s.hot !== null ? [s.hot] : []} extraTop={kind === "chain" ? 3.4 : 2.8} label="Hash table" />}
      narration={{ tag: TAGS[s.phase], title: s.title, body: <p>{s.body}</p>, notice: s.notice }}
      code={{ lines: code, active: s.line, file: "hash_table.cpp" }}
      panels={[
        {
          title: "The table",
          rows: [
            { label: "Buckets", value: m },
            { label: "Keys stored", value: filled },
            { label: "Load factor", value: (filled / m).toFixed(2) },
            { label: "Keys to insert", value: keys },
          ],
        },
        { title: "Work done", rows: [{ label: kind === "probe" ? "Probes" : "Operations", value: s.ops ?? s.probes }] },
      ]}
    />
  );
};

export const HashTable = () => <HashLesson kind="table" />;
export const Chaining = () => <HashLesson kind="chain" />;
export const Probing = () => <HashLesson kind="probe" />;
