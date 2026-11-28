import { useMemo, useState } from "react";
import Lesson from "../../../lesson/Lesson";
import { usePlayback } from "../../shared/usePlayback";
import GraphStage from "./GraphStage";
import {
  LABELS,
  randomGraph,
  matrixSteps,
  listSteps,
  bfsSteps,
  dfsSteps,
  dijkstraSteps,
  matrixCode,
  listCode,
  BFS_CODE,
  DFS_CODE,
  DIJKSTRA_CODE,
} from "./graphEngine";

// The five graph lessons share one page: a random graph on fixed slots, a
// step list from graphEngine, and the stage. Representations can switch
// between undirected, directed and weighted; traversals pick a start vertex.

const MODES = [
  { id: "undirected", label: "Undirected", opts: {} },
  { id: "directed", label: "Directed", opts: { directed: true } },
  { id: "weighted", label: "Weighted", opts: { weighted: true } },
];

const KINDS = {
  matrix: {
    modes: true,
    file: "adjacency_matrix.cpp",
    steps: (g) => matrixSteps(g),
    code: (g) => matrixCode(g),
    complexity: [
      { label: "edge lookup", value: "O(1)" },
      { label: "space", value: "O(V²)" },
    ],
    intro: "An adjacency matrix trades space for speed: any 'is u joined to v?' question is one array read, but it always costs V² cells, even for a graph with hardly any edges.",
  },
  list: {
    modes: true,
    file: "adjacency_list.cpp",
    steps: (g) => listSteps(g),
    code: (g) => listCode(g),
    complexity: [
      { label: "neighbours", value: "O(deg u)" },
      { label: "space", value: "O(V + E)" },
    ],
    intro: "An adjacency list stores only the edges that exist. Most real graphs (roads, friendships, the web) are sparse, so this is the default representation for BFS, DFS and Dijkstra.",
  },
  bfs: {
    start: true,
    opts: {},
    file: "bfs.cpp",
    steps: (g, s) => bfsSteps(g, s),
    code: () => BFS_CODE,
    complexity: [
      { label: "time", value: "O(V + E)" },
      { label: "space", value: "O(V)" },
    ],
    intro: "Breadth-first search finds the fewest-edges path from the start to every vertex. It only works for that when every edge costs the same; with weights you need Dijkstra.",
  },
  dfs: {
    start: true,
    opts: {},
    file: "dfs.cpp",
    steps: (g, s) => dfsSteps(g, s),
    code: () => DFS_CODE,
    complexity: [
      { label: "time", value: "O(V + E)" },
      { label: "space", value: "O(V)" },
    ],
    intro: "Depth-first search is the backbone of cycle detection, topological sort, connected components and maze solving. Recursion gives you the stack for free.",
  },
  dijkstra: {
    start: true,
    opts: { weighted: true },
    file: "dijkstra.cpp",
    steps: (g, s) => dijkstraSteps(g, s),
    code: () => DIJKSTRA_CODE,
    complexity: [
      { label: "time", value: "O((V + E) log V)" },
      { label: "space", value: "O(V + E)" },
    ],
    intro: "Dijkstra's algorithm is BFS with a priority queue: instead of 'nearest by hops' it always expands 'nearest by total weight'. It needs every weight to be non-negative.",
  },
};

function tagFor(description, last) {
  const d = description.split(" — ")[0];
  if (last) return "Done";
  if (/^Start/.test(d)) return "Setup";
  if (/^Edge/.test(d)) return "Record";
  if (/^Is there/.test(d)) return "Lookup";
  if (/^Neighbours/.test(d)) return "Scan";
  if (/complete$/.test(d)) return "Built";
  if (/^Dequeue/.test(d)) return "Dequeue";
  if (/^Call/.test(d)) return "Visit";
  if (/stale/.test(description.slice(0, 40))) return "Stale";
  if (/settle/.test(d)) return "Settle";
  if (/^Shortest route/.test(d)) return "Result";
  if (/^Queue empty/.test(d)) return "Finished";
  if (/^Try/.test(d)) return "Compare";
  if (/^Relax/.test(d)) return "Relax";
  if (/^Check/.test(d)) return "Compare";
  if (/already/.test(d)) return "Skip";
  if (/is new/.test(d)) return "Discover";
  if (/unvisited/.test(d)) return "Go deeper";
  if (/finished/.test(d)) return "Backtrack";
  return "Step";
}

const split = (text) => {
  const [head, ...rest] = String(text).split(" — ");
  const body = rest.join(" — ");
  return { title: head, body: body.charAt(0).toUpperCase() + body.slice(1) };
};

function statsFor(kind, g, step) {
  const aux = step.aux;
  const base = [
    { label: "Vertices", value: g.nodes.length },
    { label: "Edges", value: g.edges.length },
  ];
  if (kind === "matrix") {
    return [...base, { label: "Non-zero cells", value: aux.cells.flat().filter(Boolean).length }, { label: "Cells stored", value: g.nodes.length ** 2 }];
  }
  if (kind === "list") {
    return [...base, { label: "List entries", value: aux.lists.flat().length }, { label: "Matrix would use", value: g.nodes.length ** 2 }];
  }
  if (kind === "dijkstra") {
    return [...base, { label: "Settled", value: aux.done.length }, { label: "In queue", value: aux.pq.length, tone: "coral" }];
  }
  return [...base, { label: "Visited", value: aux.order.length }, { label: kind === "bfs" ? "In queue" : "Stack depth", value: aux.items.length, tone: "coral" }];
}

const GraphLesson = ({ kind }) => {
  const spec = KINDS[kind];
  const [mode, setMode] = useState("undirected");
  const optsFor = (m) => (spec.modes ? MODES.find((x) => x.id === m).opts : spec.opts);
  const [graph, setGraph] = useState(() => randomGraph(optsFor("undirected")));
  const [start, setStart] = useState(0);

  const steps = useMemo(() => spec.steps(graph, start), [spec, graph, start]);
  // Steps that move something along an edge, or read back a route, linger.
  const playback = usePlayback(steps.length, (i) => (steps[i]?.trail ? 1.8 : steps[i]?.travel ? 1.35 : 1));
  const index = Math.min(playback.index, steps.length - 1);
  const step = steps[index];
  const last = index === steps.length - 1;
  const { title, body } = split(step.description);

  const fresh = (m = mode) => {
    setGraph(randomGraph(optsFor(m)));
    playback.reset();
  };

  const controls = (
    <>
      {spec.modes && (
        <div className="lx-segment" role="group" aria-label="Graph type">
          {MODES.map((m) => (
            <button
              key={m.id}
              className={mode === m.id ? "lx-segment-on" : ""}
              onClick={() => {
                setMode(m.id);
                fresh(m.id);
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      )}

      {spec.start && (
        <div className="lx-field">
          <label htmlFor="graph-start">start</label>
          <select
            id="graph-start"
            value={start}
            onChange={(e) => {
              setStart(Number(e.target.value));
              playback.reset();
            }}
          >
            {graph.nodes.map((n) => (
              <option key={n.id} value={n.id}>
                {LABELS[n.id]}
              </option>
            ))}
          </select>
        </div>
      )}
    </>
  );

  return (
    <Lesson
      steps={steps}
      playback={{ ...playback, index }}
      timeline={(s) => split(s.description).title}
      onShuffle={() => fresh()}
      shuffleLabel="New graph"
      controls={controls}
      complexity={spec.complexity}
      stage={<GraphStage graph={graph} step={step} />}
      narration={{
        tag: tagFor(step.description, last),
        title,
        body: (
          <>
            {body && <p>{body}</p>}
            {index === 0 && <p>{spec.intro}</p>}
          </>
        ),
        notice: index === 0 ? "Press play, or step with the arrow keys. Shuffle draws a new random graph." : null,
        noticeLabel: "Try it",
      }}
      code={{ lines: spec.code(graph), active: step.codeLine, file: spec.file }}
      panels={[{ title: "Graph", rows: statsFor(kind, graph, step) }]}
    />
  );
};

export const AdjacencyMatrix = () => <GraphLesson kind="matrix" />;
export const AdjacencyList = () => <GraphLesson kind="list" />;
export const BFS = () => <GraphLesson kind="bfs" />;
export const DFS = () => <GraphLesson kind="dfs" />;
export const Dijkstra = () => <GraphLesson kind="dijkstra" />;
