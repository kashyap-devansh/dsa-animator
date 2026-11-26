import { motion, useReducedMotion } from "framer-motion";
import { IsoScene, At, Cylinder, Note, Callout, Pin } from "../../../iso/IsoParts";
import { project, bounds as frame, boxCorners, U } from "../../../iso/projection";
import { formatBf } from "./treeEngine";

// Trees on the isometric floor. In-order rank runs across the screen and
// depth runs down it, so the tree keeps its familiar shape. Faint bands mark
// each depth, the root is labelled, the node being looked at says what it is
// deciding, and AVL rotations draw a curved arrow around their pivot.
// Nodes keep their ids, so rotations and relinks glide into place.

const A = 0.95; // per rank
const B = 1.75; // per depth level
const R = 0.55; // node radius
const H = 0.5; // node height

const floor = (rank, depth) => [A * rank + B * depth, -A * rank + B * depth];

export const TONE = {
  default: "idle",
  path: "soft",
  active: "coral",
  found: "sage",
  new: "sage",
  pivot: "amber",
  remove: "dark",
  rotate: "coral",
  settled: "idle",
  successor: "sage",
};

const LIT = new Set(["path", "active", "found", "new", "rotate", "pivot"]);
const EASE = [0.45, 0, 0.25, 1];

// Screen centre of a node's top face.
const topOf = ([x, y]) => project(x + R, y + R, H);

// A curved arrow around a node: clockwise for a right rotation.
const RotationArrow = ({ at, dir, done }) => {
  const [cx, cy] = topOf(at);
  const r = U * 1.05;
  const sweep = dir === "right" ? 1 : 0;
  const a0 = dir === "right" ? -150 : -30;
  const a1 = dir === "right" ? -30 : -150;
  const pt = (deg) => [cx + r * Math.cos((deg * Math.PI) / 180), cy - 6 + r * 0.55 * Math.sin((deg * Math.PI) / 180)];
  const [x0, y0] = pt(a0);
  const [x1, y1] = pt(a1);
  const back = dir === "right" ? -1 : 1;

  return (
    <g className={`tree-rot ${done ? "tree-rot-done" : ""}`}>
      <path d={`M${x0} ${y0} A ${r} ${r * 0.55} 0 0 ${sweep} ${x1} ${y1}`} />
      <polygon points={`${x1},${y1} ${x1 + back * 9},${y1 - 5} ${x1 + back * 3},${y1 + 8}`} />
      <text x={cx} y={cy - r * 0.55 - 18}>
        {done ? `rotated ${dir}` : `rotate ${dir}`}
      </text>
    </g>
  );
};

// First half of "headline — detail", short enough for a callout.
const short = (text) => {
  const head = String(text).split(" — ")[0];
  return head.length > 26 ? `${head.slice(0, 25)}…` : head;
};

const TreeStage = ({ step, bounds, showBalance, emptyLabel = "empty tree" }) => {
  const reduced = useReducedMotion();
  const span = step.span ?? step.nodes.length;
  const width = Math.max(bounds.count, 5);
  const depth = Math.max(bounds.depth, 2);
  const mid = (span - 1) / 2;
  const at = (node) => floor(node.rank - mid, node.depth);

  // Frame for the largest tree this operation reaches, so nothing jumps.
  const corners = [
    ...boxCorners(...floor(-width / 2 - 1, 0), 0, 1, 1, 2.6),
    ...boxCorners(...floor(width / 2, 0), 0, 1, 1, 2.6),
    ...boxCorners(...floor(-width / 2 - 1, depth), 0, 1, 1, 1),
    ...boxCorners(...floor(width / 2, depth), 0, 1, 1, 1),
  ];
  const view = frame(corners, 22);
  const pos = Object.fromEntries(step.nodes.map((n) => [n.id, at(n)]));
  const ordered = [...step.nodes].sort((a, b) => a.depth - b.depth || a.rank - b.rank);
  const root = step.nodes.find((n) => !n.float && (n.parentId === null || n.parentId === undefined));
  const activeId = Object.entries(step.marks).find(([, role]) => role === "active" || role === "found" || role === "remove")?.[0];
  const active = step.nodes.find((n) => String(n.id) === activeId);
  const maxDepth = step.nodes.length ? Math.max(...step.nodes.map((n) => n.depth)) : 0;
  const rotAt = step.rot && pos[step.rot.at];

  return (
    <IsoScene view={view} label="Tree">
      {/* Depth guides: a faint line and label for each level in use. */}
      {Array.from({ length: maxDepth + 1 }, (_, d) => {
        const [x1, y1] = project(...floor(-width / 2 - 0.6, d), 0);
        const [x2, y2] = project(...floor(width / 2 + 0.6, d), 0);
        const yy = (y1 + y2) / 2 + R * U * 0.6;
        return (
          <g key={`d${d}`} className="tree-level">
            <line x1={x1} y1={yy} x2={x2} y2={yy} />
            <text x={x1 - 8} y={yy}>
              depth {d}
            </text>
          </g>
        );
      })}

      {step.nodes.length === 0 && <Note at={[0.5, 0.5, 0.5]} text={emptyLabel} size={15} />}

      {/* Edges, from parent to child, on the floor under the nodes. */}
      {step.nodes.map((node) => {
        const parent = pos[node.parentId];
        if (!parent) return null;
        const [px, py] = project(parent[0] + R, parent[1] + R, 0);
        const [cx, cy] = project(pos[node.id][0] + R, pos[node.id][1] + R, 0);
        const lit = LIT.has(step.marks[node.id]) && LIT.has(step.marks[node.parentId]);
        return (
          <motion.line
            key={`e${node.id}`}
            className={`tree-edge ${lit ? "tree-edge-lit" : ""}`}
            initial={false}
            animate={{ x1: px, y1: py, x2: cx, y2: cy }}
            transition={reduced ? { duration: 0 } : { duration: 1.1, ease: EASE }}
          />
        );
      })}

      {ordered.map((node) => {
        const [x, y] = pos[node.id];
        const role = step.marks[node.id] || "default";
        // Detached pieces (a subtree being handed over, a value being carried,
        // a removed node) hover above the floor until they are reattached.
        const lift = node.float ? 0.75 : role === "active" ? 0.25 : role === "remove" ? 0.5 : 0;
        const bad = Math.abs(node.bf) > 1;
        return (
          <At key={node.id} x={x} y={y} z={lift} glide>
            <Cylinder r={R} h={H} tone={TONE[role] ?? "idle"} label={node.value} labelSize={17} shadow={lift ? lift : false} />
            {showBalance && (
              <g className={`tree-bf ${bad ? "tree-bf-bad" : ""}`}>
                <rect x={project(2 * R, R, H)[0] - 2} y={project(2 * R, R, H)[1] - 22} width={30} height={18} rx={5} />
                <text x={project(2 * R, R, H)[0] + 13} y={project(2 * R, R, H)[1] - 13}>
                  {formatBf(node.bf)}
                </text>
              </g>
            )}
            {node.note && <Note at={[R, 2 * R + 0.5, 0]} text={node.note} size={12} weight={600} />}
          </At>
        );
      })}

      {/* "root" sits under the root node, clear of callouts and arrows above. */}
      {root && <Pin at={[pos[root.id][0] + R + R * 0.7, pos[root.id][1] + R + R * 0.7, 0]} text="root" drop={6} />}
      {active && step.description && !step.rot && !step.labels && (
        <Callout
          at={[pos[active.id][0] + R - R * 0.7, pos[active.id][1] + R - R * 0.7, H + 0.25]}
          text={short(step.description)}
          tone={step.marks[active.id] === "found" ? "sage" : "coral"}
          small
          rise={0.6}
        />
      )}
      {rotAt && <RotationArrow at={rotAt} dir={step.rot.dir} done={step.rot.done} />}

      {/* Role labels for staged steps: pivot, moves up, the handed-over subtree. */}
      {step.labels &&
        Object.entries(step.labels).map(([id, text]) => {
          const n = step.nodes.find((k) => String(k.id) === id);
          if (!n) return null;
          const lift = n.float ? 0.75 : 0;
          return <Callout key={`lab${id}`} at={[pos[n.id][0] + R - R * 0.7, pos[n.id][1] + R - R * 0.7, H + lift]} text={text} tone="ink" small rise={0.45} />;
        })}
    </IsoScene>
  );
};

export default TreeStage;
