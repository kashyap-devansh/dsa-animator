import IsoArray from "../../iso/IsoArray";
import TreeStage from "../../Playground/Structures/Tree/TreeStage";
import { useFrameLoop, pick, uniqueSorted } from "./useFrameLoop";
import "./MiniViz.css";

// Small, self-looping teaser animations for the landing page.


/* ---------- bubble sort bars ---------- */

function buildSort() {
  const n = 12;
  const items = Array.from({ length: n }, (_, id) => ({ id, v: 15 + Math.floor(Math.random() * 85) }));
  const frames = [];

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      frames.push({ items: [...items], cmp: [j, j + 1], sorted: n - i });
      if (items[j].v > items[j + 1].v) {
        [items[j], items[j + 1]] = [items[j + 1], items[j]];
        frames.push({ items: [...items], cmp: [j, j + 1], swap: true, sorted: n - i });
      }
    }
  }

  frames.push({ items: [...items], cmp: [], sorted: 0 });
  return frames;
}

export const MiniSort = () => {
  const [ref, f] = useFrameLoop(buildSort, 420, 6);
  const cells = f.items.map((item, k) => ({
    id: item.id,
    value: item.v,
    tone: f.cmp.includes(k) ? (f.swap ? "amber" : "coral") : k >= f.sorted ? "sage" : "idle",
    lift: f.cmp.includes(k) ? 0.3 : 0,
    label: "",
  }));

  return (
    <div ref={ref} className="mv mv-iso">
      <IsoArray cells={cells} slots={f.items.length} heights="value" maxValue={100} extraTop={0.4} label="Bubble sort" />
    </div>
  );
};

/* ---------- binary search ---------- */

function buildBinary() {
  const a = uniqueSorted(11, 2, 98);
  const target = pick(a);
  const frames = [];
  let lo = 0;
  let hi = a.length - 1;

  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    frames.push({ a, lo, hi, mid, target });
    if (a[mid] === target) {
      frames.push({ a, lo: mid, hi: mid, mid, target, found: true });
      break;
    }
    if (a[mid] < target) lo = mid + 1;
    else hi = mid - 1;
    frames.push({ a, lo, hi, mid: -1, target });
  }

  return frames;
}

export const MiniBinarySearch = () => {
  const [ref, f] = useFrameLoop(buildBinary, 900, 3);
  const cells = f.a.map((v, i) => ({
    id: i,
    value: v,
    tone: f.found && i === f.mid ? "sage" : i === f.mid ? "coral" : i < f.lo || i > f.hi ? "ghost" : "idle",
    lift: i === f.mid ? 0.35 : 0,
  }));
  const pointers = [];
  if (!f.found && f.lo <= f.hi) {
    pointers.push({ index: f.lo, text: "lo" });
    if (f.hi !== f.lo) pointers.push({ index: f.hi, text: "hi" });
  }

  return (
    <div ref={ref} className="mv mv-iso">
      <p className="mv-caption">
        target <b>{f.target}</b>
      </p>
      <IsoArray cells={cells} slots={f.a.length} pointers={pointers} callouts={f.mid >= 0 ? [{ index: f.mid, text: f.found ? "found" : "mid", tone: f.found ? "sage" : "coral", small: true }] : []} label="Binary search" />
    </div>
  );
};

/* ---------- BST search path ---------- */

function buildTree() {
  const values = uniqueSorted(15, 3, 97);
  const nodes = [];

  (function place(lo, hi, depth, parent) {
    if (lo > hi) return;
    const mid = (lo + hi) >> 1;
    const id = nodes.length;
    nodes.push({ id, v: values[mid], x: ((mid + 0.5) / values.length) * 100, depth, parent });
    place(lo, mid - 1, depth + 1, id);
    place(mid + 1, hi, depth + 1, id);
  })(0, values.length - 1, 0, null);

  const target = pick(values);
  const frames = [];
  const path = [];
  let at = 0;

  while (at !== undefined) {
    path.push(at);
    const node = nodes[at];
    frames.push({ nodes, path: [...path], target, done: node.v === target });
    if (node.v === target) break;
    at = nodes.find((n) => n.parent === at && (target < node.v ? n.x < node.x : n.x > node.x))?.id;
  }

  return frames;
}

export const MiniTree = () => {
  const [ref, f] = useFrameLoop(buildTree, 800, 4);
  const last = f.path[f.path.length - 1];
  const byX = [...f.nodes].sort((a, b) => a.x - b.x);
  const step = {
    nodes: f.nodes.map((n) => ({ id: n.id, value: n.v, depth: n.depth, rank: byX.indexOf(n), parentId: n.parent, bf: 0 })),
    marks: Object.fromEntries(f.path.map((id) => [id, id === last ? (f.done ? "found" : "active") : "path"])),
  };

  return (
    <div ref={ref} className="mv mv-iso">
      <p className="mv-caption">
        search <b>{f.target}</b>
      </p>
      <TreeStage step={step} bounds={{ count: f.nodes.length, depth: 3 }} />
    </div>
  );
};

/* ---------- BFS over a graph ---------- */

const GRAPH_NODES = [
  [10, 50], [26, 20], [28, 80], [44, 46], [52, 14], [58, 84], [68, 40], [80, 70], [86, 18], [92, 50],
];
const GRAPH_EDGES = [
  [0, 1], [0, 2], [0, 3], [1, 3], [1, 4], [2, 5], [3, 6], [3, 5], [4, 6], [4, 8], [5, 7], [6, 7], [6, 9], [8, 9], [7, 9], [2, 3],
];

function buildGraph() {
  const start = Math.floor(Math.random() * GRAPH_NODES.length);
  const level = { [start]: 0 };
  const parentEdge = {};
  const queue = [start];

  while (queue.length) {
    const u = queue.shift();
    GRAPH_EDGES.forEach(([a, b], e) => {
      const v = a === u ? b : b === u ? a : null;
      if (v !== null && level[v] === undefined) {
        level[v] = level[u] + 1;
        parentEdge[v] = e;
        queue.push(v);
      }
    });
  }

  const depth = Math.max(...Object.values(level));
  return Array.from({ length: depth + 1 }, (_, d) => ({ level, parentEdge, d, start }));
}

export const MiniGraph = () => {
  const [ref, f] = useFrameLoop(buildGraph, 800, 3);
  const treeEdges = new Set(Object.entries(f.parentEdge).filter(([v]) => f.level[v] <= f.d).map(([, e]) => e));

  return (
    <div ref={ref} className="mv mv-graph">
      <p className="mv-caption">
        BFS · level <b>{f.d}</b>
      </p>
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        {GRAPH_EDGES.map(([a, b], e) => (
          <line
            key={e}
            x1={GRAPH_NODES[a][0]}
            y1={GRAPH_NODES[a][1]}
            x2={GRAPH_NODES[b][0]}
            y2={GRAPH_NODES[b][1]}
            className={treeEdges.has(e) ? "mv-edge-hot" : "mv-edge"}
          />
        ))}
        {GRAPH_NODES.map(([x, y], i) => {
          const lv = f.level[i];
          const tone = lv === f.d ? "mv-node-hot mv-pulse" : lv < f.d ? "mv-node-found" : "";
          return (
            <g key={i} className={`mv-node ${tone}`}>
              <circle cx={x} cy={y} r="5" />
              <text x={x} y={y + 1.6}>{i === f.start ? "s" : lv <= f.d ? lv : ""}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

/* ---------- LCS table ---------- */

function buildDP() {
  const word = (n) => Array.from({ length: n }, () => pick(["A", "B", "C", "D"])).join("");
  const a = word(5);
  const b = word(6);
  const t = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(null));
  const frames = [];

  for (let i = 0; i <= a.length; i++) {
    for (let j = 0; j <= b.length; j++) {
      let deps = [];
      if (i === 0 || j === 0) t[i][j] = 0;
      else if (a[i - 1] === b[j - 1]) {
        t[i][j] = t[i - 1][j - 1] + 1;
        deps = [[i - 1, j - 1]];
      } else {
        t[i][j] = Math.max(t[i - 1][j], t[i][j - 1]);
        deps = [[i - 1, j], [i, j - 1]];
      }
      if (i > 0 && j > 0) frames.push({ a, b, t: t.map((r) => [...r]), at: [i, j], deps, match: a[i - 1] === b[j - 1] });
    }
  }

  return frames;
}

export const MiniDP = () => {
  const [ref, f] = useFrameLoop(buildDP, 170, 10);
  const isDep = (i, j) => f.deps.some(([di, dj]) => di === i && dj === j);

  return (
    <div ref={ref} className="mv mv-dp">
      <p className="mv-caption">
        LCS(<b>{f.a}</b>, <b>{f.b}</b>)
      </p>
      <div className="mv-table" style={{ gridTemplateColumns: `repeat(${f.b.length + 2}, 1fr)` }}>
        <span />
        <span />
        {f.b.split("").map((c, j) => (
          <span key={`h${j}`} className="mv-head">{c}</span>
        ))}
        {f.t.map((row, i) => [
          <span key={`r${i}`} className="mv-head">{i > 0 ? f.a[i - 1] : ""}</span>,
          ...row.map((v, j) => {
            const here = f.at[0] === i && f.at[1] === j;
            const tone = here ? (f.match ? "mv-td-match" : "mv-td-hot") : isDep(i, j) ? "mv-td-dep" : "";
            return (
              <span key={`${i}-${j}`} className={`mv-td ${tone}`} style={{ "--fill": v === null ? 0 : v / 4 }}>
                {v ?? ""}
              </span>
            );
          }),
        ])}
      </div>
    </div>
  );
};

/* ---------- linked list: insert at head ---------- */

function buildList() {
  const frames = [];
  let nodes = [];
  let id = 0;

  for (let k = 0; k < 5; k++) {
    const fresh = { id: id++, v: 10 + Math.floor(Math.random() * 89) };
    nodes = [fresh, ...nodes];
    frames.push({ nodes, fresh: fresh.id, step: "new node" }, { nodes, fresh: fresh.id, step: "head = node" }, { nodes, fresh: null, step: "" });
  }

  return frames;
}

export const MiniList = () => {
  const [ref, f] = useFrameLoop(buildList, 900, 4);
  const cells = f.nodes.map((n, k) => ({ id: n.id, value: n.v, pos: k, tone: n.id === f.fresh ? "coral" : "idle", lift: n.id === f.fresh && f.step === "new node" ? 1 : 0 }));
  const arrows = f.nodes.map((n, k) => ({ from: n.id, to: f.nodes[k + 1]?.id ?? null }));

  return (
    <div ref={ref} className="mv mv-iso">
      <p className="mv-caption">
        insertAtHead · <b>{f.step || "done"}</b>
      </p>
      <IsoArray cells={cells.map((c, k) => ({ ...c, nextNull: k === cells.length - 1 }))} slots={5} slab={false} shape="node" step={2.6} arrows={arrows.filter((a) => a.to !== null)} pointers={f.nodes.length ? [{ index: 0, text: "head", tone: "coral" }] : []} extraTop={1.8} label="Linked list" />
    </div>
  );
};

/* ---------- queue: enqueue / dequeue ---------- */

function buildQueue() {
  const frames = [];
  let items = [];
  let id = 0;
  const ops = ["in", "in", "in", "out", "in", "in", "out", "in", "out", "out", "in", "in"];

  for (const op of ops) {
    if (op === "in") {
      const item = { id: id++, v: 10 + Math.floor(Math.random() * 89) };
      items = [...items, item];
      frames.push({ items, hot: item.id, op: `enqueue(${item.v})` });
    } else {
      frames.push({ items, out: items[0].id, op: `dequeue() → ${items[0].v}` });
      items = items.slice(1);
      frames.push({ items, op: "" });
    }
  }

  return frames;
}

export const MiniQueue = () => {
  const [ref, f] = useFrameLoop(buildQueue, 900, 3);
  const cells = f.items.map((item, k) => ({ id: item.id, value: item.v, pos: k, tone: item.id === f.hot ? "coral" : item.id === f.out ? "ghost" : "idle", lift: item.id === f.out ? 0.8 : 0 }));
  const tiles = {};
  for (let k = f.items.length; k < 6; k++) tiles[k] = "slot";

  return (
    <div ref={ref} className="mv mv-iso">
      <p className="mv-caption">
        <b>{f.op || "\u00a0"}</b>
      </p>
      <IsoArray cells={cells} slots={6} tiles={tiles} pointers={f.items.length ? [{ index: 0, text: "front", tone: "coral" }, { index: f.items.length - 1, text: "rear" }] : []} label="Queue" />
    </div>
  );
};
