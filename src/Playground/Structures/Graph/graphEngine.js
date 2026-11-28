// Graphs for the lessons: a small random graph on fixed, non-crossing slots,
// and the step lists for building its matrix and list, BFS, DFS and Dijkstra.
//
// A step: { description: "headline — detail", codeLine, nodes: { id: role },
// edges: { key: role }, notes: { id: text }, callout: { at, text }, aux }
// Node roles: idle | queued | current | done | stack | target
// Edge roles: idle | ghost | hot | tree | skip

export const LABELS = "ABCDEFG".split("");

// Screen layout (in world units of the stage) and the edges allowed between
// slots: none of them cross, so every graph draws cleanly.
const SLOTS = [
  [0, 2.2],
  [2.2, 0],
  [2.2, 4.4],
  [4.4, 2.2],
  [6.6, 0],
  [6.6, 4.4],
  [8.8, 2.2],
];

const CANDIDATES = [
  [0, 1], [0, 2], [1, 2], [1, 3], [2, 3], [1, 4],
  [2, 5], [3, 4], [3, 5], [4, 5], [4, 6], [5, 6],
];

const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const shuffled = (list) => {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

export const edgeKey = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);

let serial = 0;

// A connected graph: a random spanning tree over the slots plus some extra
// edges. Directed graphs point each edge one way at random.
export function randomGraph({ weighted = false, directed = false } = {}) {
  const parent = SLOTS.map((_, i) => i);
  const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  const picked = [];

  for (const [a, b] of shuffled(CANDIDATES)) {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) {
      parent[ra] = rb;
      picked.push([a, b]);
    } else if (Math.random() < 0.4) picked.push([a, b]);
  }

  const edges = picked
    .map(([a, b]) => {
      const flip = directed && Math.random() < 0.4;
      const [u, v] = flip ? [b, a] : [a, b];
      return { key: edgeKey(u, v), u, v, w: weighted ? rnd(1, 9) : 1 };
    })
    .sort((x, y) => Math.min(x.u, x.v) - Math.min(y.u, y.v) || Math.max(x.u, x.v) - Math.max(y.u, y.v));

  const nodes = SLOTS.map(([x, y], i) => ({
    id: i,
    label: LABELS[i],
    x: x + (Math.random() - 0.5) * 0.5,
    y: y + (Math.random() - 0.5) * 0.5,
  }));

  return { id: ++serial, nodes, edges, weighted, directed };
}

// Neighbours of u in label order: [{ v, w, key }].
export function adjacency(g) {
  const adj = g.nodes.map(() => []);
  for (const e of g.edges) {
    adj[e.u].push({ v: e.v, w: e.w, key: e.key });
    if (!g.directed) adj[e.v].push({ v: e.u, w: e.w, key: e.key });
  }
  for (const list of adj) list.sort((a, b) => a.v - b.v);
  return adj;
}

const L = (i) => LABELS[i];
const join = (ids) => ids.map(L).join(", ");
const allEdges = (g, role) => Object.fromEntries(g.edges.map((e) => [e.key, role]));

function recorder(g) {
  const steps = [];
  const save = (s) =>
    steps.push({
      seq: steps.length,
      nodes: {},
      notes: {},
      ...s,
      edges: { ...allEdges(g, "idle"), ...(s.edges ?? {}) },
    });
  return { steps, save };
}

/* ---------- code ---------- */

export function matrixCode({ weighted, directed }) {
  return [
    "int n = 7;               // A..G = 0..6",
    "vector<vector<int>> adj(n, vector<int>(n, 0));",
    "for (auto [u, v, w] : edges) {",
    weighted ? "  adj[u][v] = w;" : "  adj[u][v] = 1;",
    directed ? "  // directed: u → v only" : weighted ? "  adj[v][u] = w;   // mirror" : "  adj[v][u] = 1;   // mirror",
    "}",
    "// is there an edge u → v?   O(1)",
    "bool has = adj[u][v] != 0;",
    "// neighbours of u: scan row u   O(n)",
    "for (int v = 0; v < n; v++)",
    "  if (adj[u][v]) visit(v);",
  ];
}

export function listCode({ weighted, directed }) {
  const item = weighted ? "{v, w}" : "v";
  const back = weighted ? "{u, w}" : "u";
  return [
    "int n = 7;               // A..G = 0..6",
    weighted ? "vector<vector<pair<int,int>>> adj(n);" : "vector<vector<int>> adj(n);",
    "for (auto [u, v, w] : edges) {",
    `  adj[u].push_back(${item});`,
    directed ? "  // directed: u's list only" : `  adj[v].push_back(${back});  // both ends`,
    "}",
    "// neighbours of u: walk its list   O(deg u)",
    weighted ? "for (auto [v, w] : adj[u]) visit(v);" : "for (int v : adj[u]) visit(v);",
    "// is there an edge u → v?   O(deg u)",
    "bool has = count(adj[u], v) > 0;",
  ];
}

export const BFS_CODE = [
  "void bfs(int s) {",
  "  vector<int> dist(n, -1);",
  "  queue<int> q;",
  "  dist[s] = 0; q.push(s);",
  "  while (!q.empty()) {",
  "    int u = q.front(); q.pop();",
  "    for (int v : adj[u]) {",
  "      if (dist[v] != -1) continue;",
  "      dist[v] = dist[u] + 1;",
  "      q.push(v);",
  "    }",
  "  }",
  "}",
];

export const DFS_CODE = [
  "void dfs(int u) {",
  "  visited[u] = true;",
  "  order.push_back(u);",
  "  for (int v : adj[u]) {",
  "    if (visited[v]) continue;",
  "    dfs(v);",
  "  }",
  "}                        // u is finished",
];

export const DIJKSTRA_CODE = [
  "vector<int> dist(n, INF), prev(n, -1);",
  "priority_queue<pii, vector<pii>, greater<>> pq;",
  "dist[s] = 0; pq.push({0, s});",
  "while (!pq.empty()) {",
  "  auto [d, u] = pq.top(); pq.pop();",
  "  if (d > dist[u]) continue;  // stale",
  "  for (auto [v, w] : adj[u]) {",
  "    if (dist[u] + w >= dist[v]) continue;",
  "    dist[v] = dist[u] + w;    // relax",
  "    prev[v] = u;",
  "    pq.push({dist[v], v});",
  "  }",
  "}",
];

/* ---------- representations ---------- */

const arrow = (g) => (g.directed ? "→" : "–");
const busiest = (adj) => adj.reduce((best, list, i) => (list.length > adj[best].length ? i : best), 0);

// A pair with an edge and a pair without one, for the lookup steps.
function queryPairs(g) {
  const has = new Set(g.edges.map((e) => `${e.u}-${e.v}`));
  const yes = g.edges[rnd(0, g.edges.length - 1)];
  const missing = [];
  for (let a = 0; a < g.nodes.length; a++)
    for (let b = 0; b < g.nodes.length; b++)
      if (a !== b && !has.has(`${a}-${b}`) && (g.directed || !has.has(`${b}-${a}`))) missing.push([a, b]);
  const no = missing[rnd(0, missing.length - 1)];
  return { yes: [yes.u, yes.v], no };
}

export function matrixSteps(g) {
  const n = g.nodes.length;
  const cells = Array.from({ length: n }, () => new Array(n).fill(0));
  const { steps, save } = recorder(g);
  const done = {};
  const snap = (extra = {}) => ({ type: "matrix", cells: cells.map((r) => [...r]), ...extra });
  const val = (e) => (g.weighted ? e.w : 1);

  save({
    description: `Start with a ${n} × ${n} grid of zeros — one row and one column for every vertex. Row u, column v answers "is there an edge from u to v?" Nothing is recorded yet, so all ${n * n} cells are 0.`,
    codeLine: 2,
    edges: allEdges(g, "ghost"),
    aux: snap(),
  });

  for (const e of g.edges) {
    cells[e.u][e.v] = val(e);
    if (!g.directed) cells[e.v][e.u] = val(e);
    const hot = g.directed ? [[e.u, e.v]] : [[e.u, e.v], [e.v, e.u]];
    save({
      description: g.directed
        ? `Edge ${L(e.u)} → ${L(e.v)} — set adj[${L(e.u)}][${L(e.v)}] = ${val(e)}. The edge only goes one way, so adj[${L(e.v)}][${L(e.u)}] stays 0.`
        : `Edge ${L(e.u)} – ${L(e.v)} — set adj[${L(e.u)}][${L(e.v)}] = ${val(e)}, and the mirror cell adj[${L(e.v)}][${L(e.u)}] too: an undirected edge can be walked both ways.`,
      codeLine: g.directed ? 4 : 5,
      nodes: { [e.u]: "current", [e.v]: "target" },
      edges: { ...allEdges(g, "ghost"), ...done, [e.key]: "hot" },
      aux: snap({ hot }),
    });
    done[e.key] = "idle";
  }

  const filled = cells.flat().filter(Boolean).length;
  save({
    description: `Matrix complete — ${filled} of ${n * n} cells are non-zero. It takes n² = ${n * n} cells however few edges there are${g.directed ? "" : ", and it is symmetric across the diagonal because every edge was written twice"}. The diagonal is all zeros: no vertex links to itself.`,
    codeLine: 6,
    aux: snap({ diagonal: true }),
  });

  const { yes, no } = queryPairs(g);
  for (const [a, b] of [yes, no]) {
    const on = cells[a][b] !== 0;
    save({
      description: on
        ? `Is there an edge ${L(a)} ${arrow(g)} ${L(b)}? — read one cell: adj[${L(a)}][${L(b)}] = ${cells[a][b]}, so yes. No searching at all, which is the matrix's big strength: O(1).`
        : `Is there an edge ${L(a)} ${arrow(g)} ${L(b)}? — adj[${L(a)}][${L(b)}] = 0, so no. Still a single read: O(1).`,
      codeLine: 8,
      nodes: { [a]: "current", [b]: on ? "done" : "target" },
      edges: on ? { [g.edges.find((e) => e.u === a && e.v === b)?.key ?? edgeKey(a, b)]: "hot" } : {},
      aux: snap({ hot: [[a, b]], miss: !on }),
    });
  }

  const adj = adjacency(g);
  const u = busiest(adj);
  const nbrs = adj[u].map((x) => x.v);
  save({
    description: `Neighbours of ${L(u)}: ${join(nbrs)} — scan all ${n} cells of row ${L(u)} and keep the non-zero ones. That is O(n) even though ${L(u)} has only ${nbrs.length} neighbours, so traversals on a matrix cost O(n²) in total.`,
    codeLine: 11,
    nodes: { [u]: "current", ...Object.fromEntries(nbrs.map((v) => [v, "done"])) },
    edges: Object.fromEntries(adj[u].map((x) => [x.key, "hot"])),
    aux: snap({ row: u }),
  });

  return steps;
}

export function listSteps(g) {
  const n = g.nodes.length;
  const lists = g.nodes.map(() => []);
  const { steps, save } = recorder(g);
  const done = {};
  const snap = (extra = {}) => ({ type: "list", lists: lists.map((l) => [...l]), ...extra });

  save({
    description: `Start with ${n} empty lists — one per vertex. Each list will hold that vertex's neighbours, and nothing else: no room is spent on edges that don't exist.`,
    codeLine: 2,
    edges: allEdges(g, "ghost"),
    aux: snap(),
  });

  for (const e of g.edges) {
    lists[e.u].push({ v: e.v, w: e.w });
    const hot = [[e.u, lists[e.u].length - 1]];
    if (!g.directed) {
      lists[e.v].push({ v: e.u, w: e.w });
      hot.push([e.v, lists[e.v].length - 1]);
    }
    const wTxt = g.weighted ? ` with weight ${e.w}` : "";
    save({
      description: g.directed
        ? `Edge ${L(e.u)} → ${L(e.v)} — append ${L(e.v)}${wTxt} to ${L(e.u)}'s list. ${L(e.v)}'s list is untouched: you can't walk this edge backwards.`
        : `Edge ${L(e.u)} – ${L(e.v)} — append ${L(e.v)} to ${L(e.u)}'s list and ${L(e.u)} to ${L(e.v)}'s${wTxt}. An undirected edge appears in both lists.`,
      codeLine: g.directed ? 4 : 5,
      nodes: { [e.u]: "current", [e.v]: "target" },
      edges: { ...allEdges(g, "ghost"), ...done, [e.key]: "hot" },
      aux: snap({ hot }),
    });
    done[e.key] = "idle";
  }

  const entries = lists.flat().length;
  save({
    description: `Lists complete — ${entries} entries in all, ${g.directed ? "one per edge" : `two per edge (${g.edges.length} edges)`}, against ${n * n} cells for a matrix. Space is O(V + E), which is why sparse graphs are stored this way.`,
    codeLine: 6,
    aux: snap(),
  });

  const adj = adjacency(g);
  const u = busiest(adj);
  save({
    description: `Neighbours of ${L(u)}: ${join(lists[u].map((x) => x.v))} — just walk ${L(u)}'s list. It costs O(deg ${L(u)}) = ${lists[u].length} reads, not ${n}, so a full traversal is O(V + E).`,
    codeLine: 8,
    nodes: { [u]: "current", ...Object.fromEntries(lists[u].map((x) => [x.v, "done"])) },
    edges: Object.fromEntries(adj[u].map((x) => [x.key, "hot"])),
    aux: snap({ row: u }),
  });

  const { yes, no } = queryPairs(g);
  for (const [a, b] of [no, yes]) {
    const idx = lists[a].findIndex((x) => x.v === b);
    save({
      description:
        idx >= 0
          ? `Is there an edge ${L(a)} ${arrow(g)} ${L(b)}? — scan ${L(a)}'s list: ${L(b)} is entry ${idx + 1}, so yes. The lookup had to search, which is the price of the list: O(deg u) instead of the matrix's O(1).`
          : `Is there an edge ${L(a)} ${arrow(g)} ${L(b)}? — scan all of ${L(a)}'s list (${lists[a].length} entries): no ${L(b)}, so no. A miss always reads the whole list.`,
      codeLine: 10,
      nodes: { [a]: "current", [b]: idx >= 0 ? "done" : "target" },
      edges: idx >= 0 ? { [adj[a].find((x) => x.v === b).key]: "hot" } : {},
      aux: snap({ row: a, hot: idx >= 0 ? [[a, idx]] : [], miss: idx < 0 }),
    });
  }

  return steps;
}

/* ---------- BFS ---------- */

export function bfsSteps(g, s) {
  const adj = adjacency(g);
  const { steps, save } = recorder(g);
  const dist = g.nodes.map(() => -1);
  const tree = {};
  const queue = [];
  const order = [];
  let current = null;

  const roles = (extra = {}) => {
    const out = {};
    dist.forEach((d, i) => {
      if (d === -1) return;
      out[i] = order.includes(i) ? "done" : "queued";
    });
    if (current !== null) out[current] = "current";
    return { ...out, ...extra };
  };
  const notes = () => Object.fromEntries(dist.map((d, i) => [i, d === -1 ? "" : `d=${d}`]).filter(([, t]) => t));
  const snap = (extra = {}) => ({ type: "queue", label: "Queue", items: [...queue], order: [...order], dist: [...dist], ...extra });

  dist[s] = 0;
  queue.push(s);
  save({
    description: `Start at ${L(s)} — its distance is 0 and it joins the queue. BFS explores in rings: everything 1 edge away, then everything 2 away, and so on. The queue keeps that order: first discovered, first explored.`,
    codeLine: 4,
    nodes: roles(),
    notes: notes(),
    callout: { at: s, text: "start" },
    aux: snap({ hot: s }),
  });

  while (queue.length) {
    const u = queue.shift();
    current = u;
    order.push(u);
    const names = adj[u].map((x) => x.v);
    save({
      description: `Dequeue ${L(u)} — it was at the front, distance ${dist[u]}. Now look at its neighbours: ${join(names)}.`,
      codeLine: 6,
      nodes: roles(),
      notes: notes(),
      edges: { ...tree },
      callout: { at: u, text: `dequeue ${L(u)}` },
      aux: snap(),
    });

    const skipped = [];
    for (const { v, key } of adj[u]) {
      if (dist[v] !== -1) {
        skipped.push({ v, key });
        continue;
      }
      dist[v] = dist[u] + 1;
      queue.push(v);
      save({
        description: `${L(v)} is new — distance ${dist[u]} + 1 = ${dist[v]}, and it joins the back of the queue. The edge ${L(u)} – ${L(v)} becomes part of the BFS tree.`,
        codeLine: 10,
        nodes: roles({ [v]: "target" }),
        notes: notes(),
        edges: { ...tree, [key]: "hot" },
        travel: { from: u, to: v },
        callout: { at: v, text: `d = ${dist[v]}` },
        aux: snap({ hot: v }),
      });
      tree[key] = "tree";
    }

    if (skipped.length) {
      save({
        description: `${join(skipped.map((x) => x.v))} ${skipped.length > 1 ? "are" : "is"} already seen — skip. ${skipped.length > 1 ? "They" : "It"} already got a distance from an earlier, closer vertex, and BFS never improves on the first distance it gives.`,
        codeLine: 8,
        nodes: roles(),
        notes: notes(),
        edges: { ...tree, ...Object.fromEntries(skipped.map((x) => [x.key, "skip"])) },
        aux: snap(),
      });
    }
  }

  current = null;
  const far = Math.max(...dist);
  save({
    description: `Queue empty — done. Every vertex has its fewest-edges distance from ${L(s)}, the farthest being ${far} hops away. The highlighted edges form the BFS tree: follow it back from any vertex for a shortest path.`,
    codeLine: 13,
    nodes: roles(),
    notes: notes(),
    edges: { ...tree },
    aux: snap(),
  });

  return steps;
}

/* ---------- DFS ---------- */

export function dfsSteps(g, s) {
  const adj = adjacency(g);
  const { steps, save } = recorder(g);
  const visited = g.nodes.map(() => false);
  const finished = new Set();
  const stack = [];
  const order = [];
  const tree = {};

  const roles = (extra = {}) => {
    const out = {};
    order.forEach((i) => (out[i] = finished.has(i) ? "done" : "stack"));
    if (stack.length) out[stack[stack.length - 1]] = "current";
    return { ...out, ...extra };
  };
  const notes = () => Object.fromEntries(order.map((v, k) => [v, `#${k + 1}`]));
  const snap = (extra = {}) => ({ type: "stack", label: "Call stack", items: [...stack], order: [...order], ...extra });

  const visit = (u, via) => {
    visited[u] = true;
    order.push(u);
    stack.push(u);
    save({
      description:
        via === null
          ? `Call dfs(${L(u)}) — mark ${L(u)} visited: it is #1 in the visit order. DFS goes as deep as it can along one path before it backs up, and the call stack remembers the way back.`
          : `Call dfs(${L(u)}) — ${L(u)} is visited #${order.length}. The call stack is now ${stack.map(L).join(" → ")}: that is exactly the path from ${L(s)} to here.`,
      codeLine: 3,
      nodes: roles(),
      notes: notes(),
      edges: { ...tree },
      callout: { at: u, text: `visit #${order.length}` },
      aux: snap({ hot: u }),
    });

    let skipped = [];
    const flushSkips = () => {
      if (!skipped.length) return;
      save({
        description: `${join(skipped.map((x) => x.v))} ${skipped.length > 1 ? "are" : "is"} already visited — skip. Without this check DFS would loop round cycles forever.`,
        codeLine: 5,
        nodes: roles(),
        notes: notes(),
        edges: { ...tree, ...Object.fromEntries(skipped.map((x) => [x.key, "skip"])) },
        aux: snap(),
      });
      skipped = [];
    };

    for (const { v, key } of adj[u]) {
      if (visited[v]) {
        skipped.push({ v, key });
        continue;
      }
      flushSkips();
      save({
        description: `${L(v)} is unvisited — go deeper. ${L(u)} pauses its loop right here, and the call dfs(${L(v)}) goes on top of the stack.`,
        codeLine: 6,
        nodes: roles({ [v]: "target" }),
        notes: notes(),
        edges: { ...tree, [key]: "hot" },
        travel: { from: u, to: v },
        aux: snap(),
      });
      tree[key] = "tree";
      visit(v, u);
    }
    flushSkips();

    finished.add(u);
    const back = stack.length > 1 ? stack[stack.length - 2] : null;
    save({
      description:
        back === null
          ? `${L(u)} is finished — every neighbour has been handled, so the very first call returns and the call stack empties.`
          : `${L(u)} is finished — no unvisited neighbours left. dfs(${L(u)}) returns and we back up to ${L(back)}, which carries on with its loop where it paused.`,
      codeLine: 8,
      nodes: roles({ [u]: "done", ...(back !== null ? { [back]: "current" } : {}) }),
      notes: notes(),
      edges: { ...tree },
      callout: { at: u, text: "return" },
      aux: snap({ leaving: u }),
    });
    stack.pop();
  };

  visit(s, null);

  save({
    description: `Every vertex reached — the highlighted edges form the DFS tree. Visit order: ${join(order)}. Each vertex and each edge was handled once (twice for an undirected edge), so DFS runs in O(V + E).`,
    codeLine: 8,
    nodes: roles(),
    notes: notes(),
    edges: { ...tree },
    aux: snap(),
  });

  return steps;
}

/* ---------- Dijkstra ---------- */

// Each round: pop the closest unsettled vertex, settle it, then try every
// edge out of it. A relax step carries the sum on the edge itself
// (edgeNote) and a pulse travelling along it (travel). After the queue
// empties, the result is read back one vertex at a time from prev[].
export function dijkstraSteps(g, s) {
  const adj = adjacency(g);
  const { steps, save } = recorder(g);
  const INF = Infinity;
  const n = g.nodes.length;
  const dist = g.nodes.map(() => INF);
  const prev = g.nodes.map(() => null);
  const prevKey = g.nodes.map(() => null);
  const done = new Set();
  const pq = [];
  let current = null;
  let round = 0;

  const fmt = (d) => (d === INF ? "∞" : String(d));
  const treeEdges = () => Object.fromEntries(prevKey.filter(Boolean).map((k) => [k, "tree"]));
  const roles = (extra = {}) => {
    const out = {};
    dist.forEach((d, i) => {
      if (d !== INF) out[i] = done.has(i) ? "done" : "queued";
    });
    if (current !== null) out[current] = "current";
    return { ...out, ...extra };
  };
  const notes = () => Object.fromEntries(dist.map((d, i) => [i, fmt(d)]));
  const sortPq = () => pq.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const snap = (extra = {}) => ({
    type: "dijkstra",
    round,
    dist: [...dist],
    prev: [...prev],
    done: [...done],
    pq: sortPq().map((e) => [...e]),
    ...extra,
  });
  const pathTo = (v) => {
    const out = [];
    for (let k = v; k !== null; k = prev[k]) out.unshift(k);
    return out;
  };
  const weightOf = (key) => g.edges.find((e) => e.key === key).w;

  dist[s] = 0;
  pq.push([0, s]);
  save({
    description: `Start at ${L(s)} — dist[${L(s)}] = 0 and every other vertex is ∞: no route to it is known yet. The numbers under the vertices are these distances; watch them only ever go down.`,
    codeLine: 3,
    nodes: roles(),
    notes: notes(),
    callout: { at: s, text: "source" },
    aux: snap({ hot: s }),
  });

  while (pq.length) {
    sortPq();
    const [d, u] = pq.shift();

    if (d > dist[u]) {
      save({
        description: `Pop (${d}, ${L(u)}) — a stale entry. ${L(u)} was already settled at ${dist[u]}; this copy was pushed earlier, before a cheaper route was found. Skip it.`,
        codeLine: 6,
        nodes: roles({ [u]: "done" }),
        notes: notes(),
        edges: treeEdges(),
        callout: { at: u, text: "stale, skip" },
        aux: snap({ popped: [d, u], stale: true }),
      });
      continue;
    }

    round++;
    current = u;
    done.add(u);
    const via = prev[u];
    save({
      description:
        via === null
          ? `Round ${round}: settle ${L(u)} at 0 — it is the closest vertex in the queue, so its distance is final. Now try every edge out of ${L(u)}.`
          : `Round ${round}: settle ${L(u)} at ${d} — it is the closest unsettled vertex, so no other route can beat ${d}: any other route would pass through a vertex that is already at least ${d} away. Its best route arrives from ${L(via)}.`,
      codeLine: 5,
      nodes: roles(),
      notes: notes(),
      edges: { ...treeEdges(), ...(prevKey[u] ? { [prevKey[u]]: "hot" } : {}) },
      callout: { at: u, text: `settled: ${d}` },
      aux: snap({ popped: [d, u], settle: u }),
    });

    for (const { v, w, key } of adj[u]) {
      if (done.has(v)) continue;
      const cand = dist[u] + w;
      const old = dist[v];

      if (cand < old) {
        const before = prev[v];
        dist[v] = cand;
        prev[v] = u;
        const dropped = prevKey[v];
        prevKey[v] = key;
        pq.push([cand, v]);
        save({
          description:
            old === INF
              ? `Relax ${L(u)} → ${L(v)} — ${dist[u]} + ${w} = ${cand}, and anything beats ∞. ${L(v)} gets distance ${cand} and remembers it came from ${L(u)} (prev[${L(v)}] = ${L(u)}). (${cand}, ${L(v)}) joins the queue.`
              : `Relax ${L(u)} → ${L(v)} — ${dist[u]} + ${w} = ${cand} beats the old ${old}. ${L(v)} drops to ${cand} and now arrives via ${L(u)} instead of ${L(before)}. The old (${old}, ${L(v)}) entry stays in the queue, now stale.`,
          codeLine: 9,
          nodes: roles({ [v]: "target" }),
          notes: notes(),
          edges: { ...treeEdges(), ...(dropped ? { [dropped]: "skip" } : {}), [key]: "hot" },
          edgeNote: { key, text: `${dist[u]} + ${w} = ${cand} < ${fmt(old)}`, tone: "hot" },
          travel: { from: u, to: v },
          changed: v,
          aux: snap({ hot: v, was: { v, d: old } }),
        });
      } else {
        save({
          description: `Try ${L(u)} → ${L(v)} — ${dist[u]} + ${w} = ${cand}, not better than the ${old} ${L(v)} already has. Keep the old route.`,
          codeLine: 8,
          nodes: roles({ [v]: "target" }),
          notes: notes(),
          edges: { ...treeEdges(), [key]: "skip" },
          edgeNote: { key, text: `${dist[u]} + ${w} = ${cand} ≥ ${old}`, tone: "skip" },
          travel: { from: u, to: v, fail: true },
          aux: snap({ check: v }),
        });
      }
    }
  }

  /* ---- reading the answer ---- */

  current = null;
  const order = [...Array(n).keys()].filter((v) => v !== s && dist[v] !== INF).sort((a, b) => dist[a] - dist[b] || a - b);
  const results = [...Array(n).keys()]
    .sort((a, b) => dist[a] - dist[b] || a - b)
    .map((v) => ({ v, d: dist[v], path: pathTo(v) }));
  const ghostRest = Object.fromEntries(g.edges.filter((e) => !prevKey.includes(e.key)).map((e) => [e.key, "ghost"]));
  const finalEdges = { ...ghostRest, ...treeEdges() };

  save({
    description: `Queue empty — every distance is final, and the green edges form the shortest-path tree. Each vertex kept exactly one edge: the one its prev[] points along. The faded edges were never on any shortest route. Next, read off each answer.`,
    codeLine: 13,
    nodes: roles(),
    notes: notes(),
    edges: finalEdges,
    aux: snap({ results, phase: "tree" }),
  });

  for (const v of order) {
    const path = pathTo(v);
    const legs = path.slice(1).map((x) => weightOf(prevKey[x]));
    const sum = legs.length > 1 ? `${legs.join(" + ")} = ${dist[v]}` : `${dist[v]}`;
    const onPath = Object.fromEntries(path.map((x) => [x, "target"]));
    save({
      description: `Shortest route to ${L(v)}: ${path.map(L).join(" → ")} — cost ${sum}. Read it backwards from prev[]: ${path
        .slice(1)
        .reverse()
        .map((x) => `prev[${L(x)}] = ${L(prev[x])}`)
        .join(", ")}.`,
      codeLine: 13,
      nodes: { ...roles(), ...onPath, [s]: "current", [v]: "current" },
      notes: notes(),
      edges: { ...finalEdges, ...Object.fromEntries(path.slice(1).map((x) => [prevKey[x], "hot"])) },
      callout: { at: v, text: `${L(s)} → ${L(v)} = ${dist[v]}` },
      trail: path,
      aux: snap({ results, phase: "paths", focus: v }),
    });
  }

  save({
    description: `Done — shortest distances from ${L(s)}: ${order.map((v) => `${L(v)} ${dist[v]}`).join(", ")}. ${round} rounds, one per vertex; each edge was tried at most once from each end.`,
    codeLine: 13,
    nodes: roles(),
    notes: notes(),
    edges: finalEdges,
    aux: snap({ results, phase: "done" }),
  });

  return steps;
}
