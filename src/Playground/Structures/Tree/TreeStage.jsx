import { useEffect, useLayoutEffect, useRef } from "react";
import { AnimatePresence, animate, motion, motionValue, useMotionValue, usePresence, useReducedMotion, useTransform } from "framer-motion";
import { IsoScene, Cylinder, Note, Callout, Pin, useIds } from "../../../iso/IsoParts";
import { project, bounds as frame, boxCorners, U } from "../../../iso/projection";
import { springFor, useSpeed } from "../../../iso/pace";
import { anchorRank, reachOf, formatBf } from "./treeEngine";

// Trees on the isometric floor. In-order rank runs across the screen and
// depth runs down it, so the tree keeps its familiar shape. Faint bands mark
// each depth, the root is labelled, the node being looked at says what it is
// deciding, and AVL rotations draw a curved arrow around their pivot.
//
// Motion: every node owns a set of motion values, and edges read the same
// values, so an edge stays glued to its two nodes for the whole move. Moves
// are springs, which carry their speed into the next step instead of
// stopping and restarting, so fast playback stays fluid. New edges grow out
// of the parent; cut edges pull back into it. BST/AVL trees are drawn
// relative to the root, so the root holds one spot while the tree changes.

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

// Screen offset from a node's origin to the centre of its footprint and of its top.
const [, FOOT_Y] = project(R, R, 0);
const [TOP_X, TOP_Y] = project(R, R, H);

// One spring for the whole scene, tuned to playback speed (see pace.js).
const glideFor = (speed, reduced) => (reduced ? { duration: 0 } : springFor(speed, 0.65));

/* ---------- shared motion values ---------- */

// id → { x, y, lift } motion values plus the target they last headed for.
// Created during render so children can bind to them on their first frame;
// animated after commit so React and the springs never fight.
function useNodeMotion(targets, transition) {
  const store = useRef(new Map());
  const map = store.current;

  for (const [id, [x, y, lift]] of targets) {
    if (!map.has(id)) map.set(id, { x: motionValue(x), y: motionValue(y), lift: motionValue(lift), target: [x, y, lift] });
  }

  useLayoutEffect(() => {
    for (const [id, t] of targets) {
      const rec = map.get(id);
      if (rec.target[0] === t[0] && rec.target[1] === t[1] && rec.target[2] === t[2]) continue;
      rec.target = t;
      animate(rec.x, t[0], transition);
      animate(rec.y, t[1], transition);
      animate(rec.lift, t[2], transition);
    }

    // Forget nodes that are long gone (a new tree was loaded).
    if (map.size > 400) {
      const live = new Set(targets.map(([id]) => id));
      for (const id of map.keys()) if (!live.has(id)) map.delete(id);
    }
  });

  return map;
}

/* ---------- pieces ---------- */

// An edge between two nodes' footprints. It grows out of the parent when it
// appears and pulls back into it when it is cut.
const Edge = ({ from, to, lit, reduced }) => {
  const [isPresent, safeToRemove] = usePresence();
  const grow = useMotionValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) {
      grow.set(isPresent ? 1 : 0);
      if (!isPresent) safeToRemove();
      return;
    }
    const ctl = isPresent
      ? animate(grow, 1, { duration: 0.45, ease: EASE })
      : animate(grow, 0, { duration: 0.28, ease: EASE, onComplete: safeToRemove });
    return () => ctl.stop();
  }, [isPresent, reduced, grow, safeToRemove]);

  const y1 = useTransform(() => from.y.get() + FOOT_Y);
  const x2 = useTransform(() => from.x.get() + (to.x.get() - from.x.get()) * grow.get());
  const y2 = useTransform(() => from.y.get() + FOOT_Y + (to.y.get() - from.y.get()) * grow.get());

  return <motion.line className={`tree-edge ${lit ? "tree-edge-lit" : ""}`} x1={from.x} y1={y1} x2={x2} y2={y2} />;
};

// A node: follows its motion values, fades in from just above when it
// appears, and lifts away when it leaves. Its shadow stays on the floor.
const TreeNode = ({ rec, reduced, children }) => {
  const sy = useTransform(() => rec.y.get() - rec.lift.get() * U);
  const shadowY = useTransform(() => rec.lift.get() * U);
  const shadowOpacity = useTransform(rec.lift, [0, 0.2], [0, 1]);
  const id = useIds();
  const rx = Math.SQRT2 * R * 0.94 * U;
  const ry = Math.SQRT2 * R * 0.47 * U;

  return (
    <motion.g style={{ x: rec.x, y: sy }}>
      <motion.g style={{ y: shadowY, opacity: shadowOpacity }}>
        <ellipse className="iso-shadow" filter={`url(#${id}-soft)`} cx={TOP_X} cy={FOOT_Y + 4} rx={rx} ry={ry} />
      </motion.g>
      <motion.g
        initial={reduced ? false : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -14, transition: { duration: 0.3, ease: EASE } }}
        transition={{ duration: 0.35, ease: EASE }}
      >
        {children}
      </motion.g>
    </motion.g>
  );
};

// A curved arrow around a node: clockwise for a right rotation.
const RotationArrow = ({ at, dir, done }) => {
  const cx = at[0] + TOP_X;
  const cy = at[1] + TOP_Y;
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

const fade = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.3, ease: EASE } };

/* ---------- stage ---------- */

const TreeStage = ({ step, bounds, showBalance, speed: speedProp, emptyLabel = "empty tree" }) => {
  const reduced = useReducedMotion();
  const ctxSpeed = useSpeed();
  const transition = glideFor(speedProp ?? ctxSpeed, reduced);

  // Call trees (with a fixed `span`) are laid out against their final shape,
  // so centring on the span keeps them still. Search trees change shape, so
  // they are drawn relative to the root instead.
  const fixedSpan = step.span !== undefined;
  const mid = fixedSpan ? (step.span - 1) / 2 : anchorRank(step.nodes);
  const half = fixedSpan ? Math.max(bounds.count, 5) / 2 : Math.max(bounds.half ?? 0, reachOf(step.nodes), 2);
  const depth = Math.max(bounds.depth, 2);
  const at = (node) => floor(node.rank - mid, node.depth);

  // Frame for the largest tree this session reaches, so nothing jumps.
  const corners = [
    ...boxCorners(...floor(-half - 1, 0), 0, 1, 1, 2.6),
    ...boxCorners(...floor(half, 0), 0, 1, 1, 2.6),
    ...boxCorners(...floor(-half - 1, depth), 0, 1, 1, 1),
    ...boxCorners(...floor(half, depth), 0, 1, 1, 1),
  ];
  const view = frame(corners, 22);

  const pos = Object.fromEntries(step.nodes.map((n) => [n.id, at(n)]));
  const screen = (id) => project(pos[id][0], pos[id][1], 0);
  const ordered = [...step.nodes].sort((a, b) => a.depth - b.depth || a.rank - b.rank);
  const root = step.nodes.find((n) => !n.float && (n.parentId === null || n.parentId === undefined));
  const activeId = Object.entries(step.marks).find(([, role]) => role === "active" || role === "found" || role === "remove")?.[0];
  const active = step.nodes.find((n) => String(n.id) === activeId);
  const maxDepth = step.nodes.length ? Math.max(...step.nodes.map((n) => n.depth)) : 0;
  const rotAt = step.rot && pos[step.rot.at] && screen(step.rot.at);

  // Detached pieces (a subtree being handed over, a value being carried, a
  // removed node) hover above the floor until they are reattached.
  const liftOf = (node) => {
    const role = step.marks[node.id];
    return node.float ? 0.75 : role === "active" ? 0.25 : role === "remove" ? 0.5 : 0;
  };

  const targets = step.nodes.map((n) => {
    const [sx, sy] = screen(n.id);
    return [n.id, [sx, sy, liftOf(n)]];
  });
  const motionOf = useNodeMotion(targets, transition);

  // Edges are keyed by the pair of nodes, so a parent and child swapping
  // places in a rotation keep their edge rather than redrawing it.
  const edges = step.nodes
    .filter((n) => pos[n.parentId])
    .map((n) => ({
      key: n.id < n.parentId ? `${n.id}-${n.parentId}` : `${n.parentId}-${n.id}`,
      from: n.parentId,
      to: n.id,
      lit: LIT.has(step.marks[n.id]) && LIT.has(step.marks[n.parentId]),
    }));

  const anchorOf = (node, dx, dy, z) => [pos[node.id][0] + dx, pos[node.id][1] + dy, z];

  return (
    <IsoScene view={view} label="Tree" smooth>
      {/* Depth guides: a faint line and label for each level in use. */}
      <AnimatePresence initial={false}>
        {Array.from({ length: maxDepth + 1 }, (_, d) => {
          const [x1, y1] = project(...floor(-half - 0.6, d), 0);
          const [x2, y2] = project(...floor(half + 0.6, d), 0);
          const yy = (y1 + y2) / 2 + R * U * 0.6;
          return (
            <motion.g key={`d${d}`} className="tree-level" {...fade}>
              <line x1={x1} y1={yy} x2={x2} y2={yy} />
              <text x={x1 - 8} y={yy}>
                depth {d}
              </text>
            </motion.g>
          );
        })}
      </AnimatePresence>

      <AnimatePresence>
        {step.nodes.length === 0 && (
          <motion.g key="empty" {...fade}>
            <Note at={[0.5, 0.5, 0.5]} text={emptyLabel} size={15} />
          </motion.g>
        )}
      </AnimatePresence>

      {/* Edges, from parent to child, on the floor under the nodes. */}
      <g>
        <AnimatePresence>
          {edges.map((e) => (
            <Edge key={e.key} from={motionOf.get(e.from)} to={motionOf.get(e.to)} lit={e.lit} reduced={reduced} />
          ))}
        </AnimatePresence>
      </g>

      <g>
        <AnimatePresence>
          {ordered.map((node) => {
            const role = step.marks[node.id] || "default";
            const bad = Math.abs(node.bf) > 1;
            return (
              <TreeNode key={node.id} rec={motionOf.get(node.id)} reduced={reduced}>
                <Cylinder r={R} h={H} tone={TONE[role] ?? "idle"} label={node.value} labelSize={17} />
                {showBalance && (
                  <g className={`tree-bf ${bad ? "tree-bf-bad" : ""}`}>
                    <rect x={project(2 * R, R, H)[0] - 2} y={project(2 * R, R, H)[1] - 22} width={30} height={18} rx={5} />
                    <text x={project(2 * R, R, H)[0] + 13} y={project(2 * R, R, H)[1] - 13}>
                      {formatBf(node.bf)}
                    </text>
                  </g>
                )}
                {node.note && <Note at={[R, 2 * R + 0.5, 0]} text={node.note} size={12} weight={600} />}
              </TreeNode>
            );
          })}
        </AnimatePresence>
      </g>

      {/* "root" sits under the root node, clear of callouts and arrows above. */}
      {root && <Pin at={anchorOf(root, R + R * 0.7, R + R * 0.7, 0)} text="root" drop={6} transition={transition} />}
      {active && step.description && !step.rot && !step.labels && (
        <Callout
          at={anchorOf(active, R - R * 0.7, R - R * 0.7, H + 0.25)}
          text={short(step.description)}
          tone={step.marks[active.id] === "found" ? "sage" : "coral"}
          small
          rise={0.6}
          transition={transition}
        />
      )}

      <AnimatePresence>
        {rotAt && (
          <motion.g key={`rot-${step.rot.at}-${step.rot.dir}-${step.rot.done ? 1 : 0}`} {...fade}>
            <RotationArrow at={rotAt} dir={step.rot.dir} done={step.rot.done} />
          </motion.g>
        )}
      </AnimatePresence>

      {/* Role labels for staged steps: pivot, moves up, the handed-over subtree. */}
      {step.labels &&
        Object.entries(step.labels).map(([id, text]) => {
          const n = step.nodes.find((k) => String(k.id) === id);
          if (!n) return null;
          return <Callout key={`lab${id}`} at={anchorOf(n, R - R * 0.7, R - R * 0.7, H + (n.float ? 0.75 : 0))} text={text} tone="ink" small rise={0.45} transition={transition} />;
        })}
    </IsoScene>
  );
};

export default TreeStage;
