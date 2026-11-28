import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { IsoScene, Cylinder, Callout, Pin } from "../../../iso/IsoParts";
import { project, U } from "../../../iso/projection";
import { paceOf, springFor, useSpeed } from "../../../iso/pace";
import { LABELS } from "./graphEngine";
import "./GraphStage.css";

// A graph on the isometric floor, with the structure the algorithm keeps
// (matrix, lists, queue, call stack, distance table) in a panel beside it.
// Vertices stand still: only their colour, their notes and the edge colours
// change from step to step, so the eye can follow the algorithm, not the layout.
//
// Motion: when an algorithm follows an edge, a pulse runs along it from the
// vertex doing the work (step.travel); a relaxation writes its sum on the
// edge (step.edgeNote); a changed distance pops; the vertex being worked on
// stands in a pulsing ring; and a finished route is drawn along its edges
// from the source (step.trail).

const C = 0.94;
const S = 0.47;
const R = 0.55; // vertex radius
const H = 0.5; // vertex height
const SQUASH = 0.8; // vertical spread of the layout
const RING_X = Math.SQRT2 * R * C * U * 1.32;
const RING_Y = Math.SQRT2 * R * S * U * 1.32;

const TONE = { idle: "idle", queued: "amber", stack: "amber", current: "coral", target: "soft", done: "sage" };
const EASE = [0.45, 0, 0.25, 1];

const L = (i) => LABELS[i];

// Screen point of a slot, and the world point under it on the floor.
const screenOf = (n) => [n.x * U, n.y * U * SQUASH];
const worldOf = (px, py) => {
  const a = px / (C * U);
  const b = py / (S * U);
  return [(a + b) / 2, (b - a) / 2];
};

const short = (text) => (text.length > 20 ? `${text.slice(0, 19)}…` : text);

const GraphStage = ({ graph, step }) => {
  const reduced = useReducedMotion();
  const speed = useSpeed();
  const pace = paceOf(speed);
  const transition = reduced ? { duration: 0 } : springFor(speed, 0.5);

  const pts = graph.nodes.map(screenOf);
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const view = {
    x: Math.min(...xs) - 48,
    y: Math.min(...ys) - 92,
    w: Math.max(...xs) - Math.min(...xs) + 96,
    h: Math.max(...ys) - Math.min(...ys) + 92 + 58,
  };

  const centre = (id) => worldOf(...pts[id]);
  const callout = step.callout;
  const note = step.edgeNote;

  return (
    <div className="gx lx-stage-wrap">
      <div className="gx-graph">
        <IsoScene view={view} label="Graph" maxScale={1.6}>
          {/* Edges on the floor, under the vertices. */}
          <g>
            {graph.edges.map((e) => {
              const [x1, y1] = pts[e.u];
              const [x2, y2] = pts[e.v];
              const role = step.edges[e.key] ?? "idle";
              return (
                <g key={`${graph.id}-${e.key}`} className={`gx-edge gx-edge-${role}`}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} />
                  {graph.directed && <Arrow x1={x1} y1={y1} x2={x2} y2={y2} />}
                </g>
              );
            })}
          </g>

          {/* A route being read back: drawn from the source outwards. */}
          {step.trail && step.trail.length > 1 && (
            <motion.polyline
              key={`trail-${step.seq}`}
              className="gx-trail"
              points={step.trail.map((v) => pts[v].join(",")).join(" ")}
              initial={reduced ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.45 * (step.trail.length - 1) * pace, ease: EASE }}
            />
          )}

          {/* Following an edge: the edge fills from u to v and a pulse rides it. */}
          {step.travel && !reduced && <Travel key={`t-${step.seq}`} from={pts[step.travel.from]} to={pts[step.travel.to]} fail={step.travel.fail} pace={pace} />}

          {/* Weights sit on the middle of each edge. */}
          {graph.weighted &&
            graph.edges.map((e) => {
              if (note?.key === e.key) return null;
              const [x1, y1] = pts[e.u];
              const [x2, y2] = pts[e.v];
              const role = step.edges[e.key] ?? "idle";
              const mx = (x1 + x2) / 2;
              const my = (y1 + y2) / 2;
              return (
                <g key={`w${graph.id}-${e.key}`} className={`gx-weight gx-weight-${role}`}>
                  <rect x={mx - 11} y={my - 10} width={22} height={20} rx={6} />
                  <text x={mx} y={my + 0.5}>
                    {e.w}
                  </text>
                </g>
              );
            })}

          {/* Floor rings: a pulse under the vertex at work, a ring under settled ones. */}
          <g>
            {graph.nodes.map((n) => {
              const role = step.nodes[n.id];
              if (role !== "current" && role !== "done") return null;
              const [cx, cy] = pts[n.id];
              return (
                <g key={`r${graph.id}-${n.id}`} className={`gx-ring gx-ring-${role}`} transform={`translate(${cx} ${cy})`}>
                  <ellipse rx={RING_X} ry={RING_Y} />
                  {role === "current" && !reduced && <ellipse className="gx-ring-pulse" rx={RING_X} ry={RING_Y} />}
                </g>
              );
            })}
          </g>

          {/* Vertices, back to front so nearer ones overlap farther ones. */}
          <g>
            {[...graph.nodes]
              .sort((a, b) => pts[a.id][1] - pts[b.id][1])
              .map((n) => {
                const [wx, wy] = centre(n.id);
                const [ox, oy] = project(wx - R, wy - R, 0);
                const role = step.nodes[n.id] ?? "idle";
                return (
                  <motion.g
                    key={`${graph.id}-${n.id}`}
                    initial={reduced ? false : { opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: role === "current" ? -4 : 0 }}
                    transition={{ duration: 0.35, ease: EASE }}
                  >
                    <g transform={`translate(${ox.toFixed(2)} ${oy.toFixed(2)})`}>
                      <Cylinder r={R} h={H} tone={TONE[role] ?? "idle"} label={n.label} labelSize={17} shadow={0.01} />
                    </g>
                  </motion.g>
                );
              })}
          </g>

          {/* The sum being tested, written on the edge itself. */}
          <AnimatePresence>
            {note && (
              <EdgeNote key={`en-${step.seq}`} at={midOf(pts, graph.edges.find((e) => e.key === note.key))} text={note.text} tone={note.tone} reduced={reduced} />
            )}
          </AnimatePresence>

          {/* Per-vertex notes: distance, visit number. A changed one pops. */}
          <AnimatePresence initial={false}>
            {Object.entries(step.notes ?? {}).map(([id, text]) => {
              const [wx, wy] = centre(Number(id));
              const role = step.nodes[id];
              const changed = step.changed === Number(id);
              return (
                <motion.g
                  key={`n${graph.id}-${id}-${text}`}
                  initial={reduced ? false : { opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.12 } }}
                  transition={{ type: "spring", bounce: 0.45, visualDuration: 0.35 }}
                  style={{ transformOrigin: `${project(wx + R * 0.75, wy + R * 0.75, 0).map((v) => `${v.toFixed(1)}px`).join(" ")}` }}
                >
                  <Pin at={[wx + R * 0.75, wy + R * 0.75, 0]} text={text} drop={7} tone={changed || role === "current" ? "coral" : role === "done" ? "sage" : "ink"} transition={transition} />
                </motion.g>
              );
            })}
          </AnimatePresence>

          {callout && (
            <Callout
              at={[centre(callout.at)[0] - R * 0.7, centre(callout.at)[1] - R * 0.7, H]}
              text={short(callout.text)}
              tone={step.nodes[callout.at] === "done" ? "sage" : "coral"}
              small
              rise={0.5}
              transition={transition}
            />
          )}
        </IsoScene>
      </div>

      <aside className="gx-panel ui-card">
        <Aux aux={step.aux} graph={graph} />
      </aside>
    </div>
  );
};

const midOf = (pts, e) => [(pts[e.u][0] + pts[e.v][0]) / 2, (pts[e.u][1] + pts[e.v][1]) / 2];

// The edge fills in coral from `from` to `to`, a bright pulse riding its tip.
// A failed try (no improvement) runs grey and stops short.
const Travel = ({ from, to, fail, pace }) => {
  const reach = fail ? 0.82 : 1;
  const ex = from[0] + (to[0] - from[0]) * reach;
  const ey = from[1] + (to[1] - from[1]) * reach;
  const duration = 0.6 * pace;
  return (
    <g className={`gx-travel ${fail ? "gx-travel-fail" : ""}`}>
      <motion.line x1={from[0]} y1={from[1]} initial={{ x2: from[0], y2: from[1] }} animate={{ x2: ex, y2: ey }} transition={{ duration, ease: EASE }} />
      <motion.circle
        r={6}
        initial={{ cx: from[0], cy: from[1], opacity: 1 }}
        animate={{ cx: ex, cy: ey, opacity: fail ? [1, 1, 0] : [1, 1, 0.9] }}
        transition={{ duration, ease: EASE }}
      />
    </g>
  );
};

const EdgeNote = ({ at, text, tone, reduced }) => {
  const w = text.length * 7.3 + 18;
  return (
    <motion.g
      className={`gx-enote gx-enote-${tone}`}
      initial={reduced ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: EASE }}
    >
      <rect x={at[0] - w / 2} y={at[1] - 12} width={w} height={24} rx={7} />
      <text x={at[0]} y={at[1] + 0.5}>
        {text}
      </text>
    </motion.g>
  );
};

// An arrowhead a little past the middle of a directed edge.
const Arrow = ({ x1, y1, x2, y2 }) => {
  const t = 0.6;
  const ex = x1 + (x2 - x1) * t;
  const ey = y1 + (y2 - y1) * t;
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const p = [
    [ex + 7 * Math.cos(ang), ey + 7 * Math.sin(ang)],
    [ex - 7 * Math.cos(ang - 0.5), ey - 7 * Math.sin(ang - 0.5)],
    [ex - 7 * Math.cos(ang + 0.5), ey - 7 * Math.sin(ang + 0.5)],
  ];
  return <polygon points={p.map((q) => q.map((v) => v.toFixed(1)).join(",")).join(" ")} />;
};

/* ---------- the panel ---------- */

const Aux = ({ aux, graph }) => {
  if (!aux) return null;
  if (aux.type === "matrix") return <Matrix aux={aux} n={graph.nodes.length} />;
  if (aux.type === "list") return <Lists aux={aux} weighted={graph.weighted} />;
  if (aux.type === "dijkstra") return <Distances aux={aux} />;
  return <Frontier aux={aux} />;
};

const has = (pairs = [], r, c) => pairs.some(([a, b]) => a === r && b === c);

const Matrix = ({ aux, n }) => (
  <>
    <p className="gx-title">
      adj[u][v] <span>{n} × {n}</span>
    </p>
    <table className="gx-mat">
      <thead>
        <tr>
          <th />
          {Array.from({ length: n }, (_, c) => (
            <th key={c} className={aux.hot?.some(([, b]) => b === c) ? "gx-th-on" : ""}>
              {L(c)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {aux.cells.map((row, r) => (
          <tr key={r} className={aux.row === r ? "gx-row" : ""}>
            <th className={aux.row === r || aux.hot?.some(([a]) => a === r) ? "gx-th-on" : ""}>{L(r)}</th>
            {row.map((v, c) => {
              const hot = has(aux.hot, r, c);
              const cls = [v ? "gx-on" : "", hot ? (aux.miss ? "gx-miss" : "gx-hot") : "", aux.diagonal && r === c ? "gx-diag" : ""].join(" ");
              return (
                <td key={c} className={cls}>
                  {v}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  </>
);

const Lists = ({ aux, weighted }) => (
  <>
    <p className="gx-title">
      adj[u] <span>{aux.lists.flat().length} entries</span>
    </p>
    <div className="gx-lists">
      {aux.lists.map((list, u) => (
        <div key={u} className={`gx-lrow ${aux.row === u ? "gx-lrow-on" : ""}`}>
          <span className="gx-lhead">{L(u)}</span>
          <span className="gx-lbar" />
          <AnimatePresence initial={false}>
            {list.map((x, k) => (
              <motion.span
                key={`${x.v}`}
                className={`gx-chip ${has(aux.hot, u, k) ? "gx-chip-hot" : ""}`}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, ease: EASE }}
              >
                {L(x.v)}
                {weighted && <small>{x.w}</small>}
              </motion.span>
            ))}
          </AnimatePresence>
          {!list.length && <span className="gx-empty">∅</span>}
          {aux.row === u && aux.miss && <span className="gx-missnote">not found</span>}
        </div>
      ))}
    </div>
  </>
);

// The BFS queue or the DFS call stack, plus the visit order so far.
const Frontier = ({ aux }) => {
  const isStack = aux.type === "stack";
  const items = isStack ? [...aux.items].reverse() : aux.items;

  return (
    <>
      <p className="gx-title">
        {aux.label} <span>{isStack ? "top first" : "front → back"}</span>
      </p>
      <div className={`gx-line ${isStack ? "gx-line-stack" : ""}`}>
        <AnimatePresence initial={false} mode="popLayout">
          {items.map((v, k) => (
            <motion.span
              layout
              key={v}
              className={`gx-chip gx-chip-lg ${v === aux.hot ? "gx-chip-new" : ""} ${v === aux.leaving ? "gx-chip-hot" : ""} ${isStack && k === 0 ? "gx-chip-top" : ""}`}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.25, ease: EASE }}
            >
              {isStack ? `dfs(${L(v)})` : L(v)}
            </motion.span>
          ))}
        </AnimatePresence>
        {!items.length && <span className="gx-empty">empty</span>}
      </div>

      <p className="gx-title gx-title-gap">
        Visit order <span>{aux.order.length} / 7</span>
      </p>
      <div className="gx-line">
        {aux.order.map((v, k) => (
          <span key={v} className="gx-chip gx-chip-done">
            <small>{k + 1}</small>
            {L(v)}
          </span>
        ))}
        {!aux.order.length && <span className="gx-empty">none yet</span>}
      </div>
    </>
  );
};

const fmtD = (d) => (d === Infinity ? "∞" : d);

const Distances = ({ aux }) => (aux.results ? <Results aux={aux} /> : <Working aux={aux} />);

// While running: the dist / prev table and the priority queue.
const Working = ({ aux }) => {
  const done = new Set(aux.done);
  return (
    <>
      <p className="gx-title">
        dist · prev <span>{aux.round ? `round ${aux.round} · ` : ""}{done.size} / 7 settled</span>
      </p>
      <table className="gx-dist">
        <thead>
          <tr>
            <th>v</th>
            <th>dist</th>
            <th>prev</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {aux.dist.map((d, v) => {
            const cls = [
              done.has(v) ? "gx-dist-done" : "",
              v === aux.hot ? "gx-dist-hot" : "",
              v === aux.check ? "gx-dist-check" : "",
              v === aux.settle ? "gx-dist-settle" : "",
            ].join(" ");
            return (
              <tr key={v} className={cls}>
                <th>{L(v)}</th>
                <td>
                  {aux.was?.v === v && <s className="gx-was">{fmtD(aux.was.d)}</s>}
                  <motion.span key={d} className="gx-val" initial={{ scale: 1.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", bounce: 0.4, visualDuration: 0.35 }}>
                    {fmtD(d)}
                  </motion.span>
                </td>
                <td>{aux.prev[v] === null ? "–" : L(aux.prev[v])}</td>
                <td className="gx-dist-flag">{done.has(v) ? "✓" : ""}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <p className="gx-title gx-title-gap">
        Priority queue <span>smallest first</span>
      </p>
      <div className="gx-pq">
        {aux.popped && (
          <span className={`gx-pq-out ${aux.stale ? "gx-pq-stale" : ""}`}>
            <small>{aux.stale ? "popped · stale" : "popped"}</small>
            <span className="gx-chip gx-chip-hot">
              ({aux.popped[0]}, {L(aux.popped[1])})
            </span>
          </span>
        )}
        <div className="gx-line">
          <AnimatePresence initial={false} mode="popLayout">
            {aux.pq.map(([d, v]) => (
              <motion.span
                layout
                key={`${d}-${v}`}
                className={`gx-chip ${v === aux.hot && d === aux.dist[v] ? "gx-chip-new" : ""} ${aux.dist[v] < d ? "gx-chip-stale" : ""}`}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                ({d}, {L(v)})
              </motion.span>
            ))}
          </AnimatePresence>
          {!aux.pq.length && <span className="gx-empty">empty</span>}
        </div>
      </div>
    </>
  );
};

// After the run: every shortest route, cheapest first.
const Results = ({ aux }) => {
  const source = aux.results[0].v;
  return (
    <>
      <p className="gx-title">
        Shortest paths from {L(source)} <span>{aux.phase === "paths" ? "reading prev[]" : "final"}</span>
      </p>
      <div className="gx-res">
        {aux.results.map((r, k) => {
          const on = r.v === aux.focus;
          return (
            <motion.div
              key={r.v}
              className={`gx-res-row ${on ? "gx-res-on" : ""} ${r.v === source ? "gx-res-src" : ""}`}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, ease: EASE, delay: aux.phase === "tree" ? k * 0.05 : 0 }}
            >
              <span className="gx-res-to">{L(r.v)}</span>
              <span className="gx-res-route">
                {r.v === source
                  ? "source"
                  : r.path.map((x, i) => (
                      <span key={i}>
                        {i > 0 && <i>→</i>}
                        {L(x)}
                      </span>
                    ))}
              </span>
              <span className="gx-res-cost">{fmtD(r.d)}</span>
            </motion.div>
          );
        })}
      </div>
      <p className="gx-res-foot">Each route follows prev[] back from its end to {L(source)}, then reads it forwards.</p>
    </>
  );
};

export default GraphStage;
