import { useLayoutEffect, useRef } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { IsoScene, NodeBox, Note } from "../../../iso/IsoParts";
import { U, bounds, boxCorners, project } from "../../../iso/projection";
import { paceOf, springFor, useSpeed } from "../../../iso/pace";
import { useNodeMotion } from "../../../iso/useNodeMotion";
import "./LinkedStage.css";

// A singly linked list on the isometric floor. Each node is a value cube
// joined to its "next" box; each next pointer is a curved arrow.
//
// Nodes and arrows read the same motion values, so an arrow stays attached
// to both of its nodes however they move. When a pointer is reassigned, its
// head swings from the old node to the new one (it never jumps), with a chip
// naming the assignment (cur->next…). A pointer set to null pulls back into
// its box. head / cur markers glide from node to node the same way.

export const STEP = 2.4; // world units per slot
const EASE = [0.45, 0, 0.25, 1];

// Screen offsets from a node's origin: the dot on its next box (where its
// arrow leaves), and the front of its value box (where arrows arrive).
const OUT = project(1.21, 1, 0.5);
const IN = project(0.1, 1, 0.62);
const UNDER = project(0.5, 1.25, 0);

const at = (rec) => [rec.x.get(), rec.y.get() - rec.lift.get() * U];

// Follows a node's motion values; when the node it follows changes, blends
// from the old one to the new one while both keep moving. `rec` may be null.
function useFollow(rec, offset, fallback, duration) {
  const reduced = useReducedMotion();
  const mix = useMotionValue(1);
  const track = useRef({ prev: rec, cur: rec, pending: false });

  // Switch during render so the computed values below read the right nodes.
  if (track.current.cur !== rec) {
    track.current = { prev: track.current.cur, cur: rec, pending: true };
    if (!reduced) mix.set(0);
  }

  useLayoutEffect(() => {
    if (!track.current.pending) return;
    track.current.pending = false;
    if (reduced) return mix.set(1);
    const ctl = animate(mix, 1, { duration, ease: EASE });
    return () => ctl.stop();
  });

  const point = (r) => {
    if (!r) return fallback();
    const [x, y] = at(r);
    return [x + offset[0], y + offset[1]];
  };
  const x = useTransform(() => {
    const m = mix.get();
    const a = point(track.current.prev);
    const b = point(track.current.cur);
    return a[0] + (b[0] - a[0]) * m;
  });
  const y = useTransform(() => {
    const m = mix.get();
    const a = point(track.current.prev);
    const b = point(track.current.cur);
    return a[1] + (b[1] - a[1]) * m;
  });
  return [x, y];
}

// A next pointer: a curved arrow from `from`'s box to `to` (null: retracted).
const Pointer = ({ from, to, tone = "ink", dashed = false, label, duration }) => {
  const reduced = useReducedMotion();
  const sx = useTransform(() => at(from)[0] + OUT[0]);
  const sy = useTransform(() => at(from)[1] + OUT[1]);
  // A brand-new arrow grows out of its box; null sits just inside it.
  const stub = () => [sx.get() + 6, sy.get() + 3];
  const [ex, ey] = useFollow(to, IN, stub, duration);
  const grow = useMotionValue(reduced ? 1 : 0);

  useLayoutEffect(() => {
    if (reduced) return;
    const ctl = animate(grow, 1, { duration, ease: EASE });
    return () => ctl.stop();
  }, [grow, reduced, duration]);

  // The curve bows to the upper side of its own direction, more for longer
  // arrows, so a pointer sweeping between nodes reads as a swing, and an
  // arrow climbing to a lifted node doesn't loop over it.
  const geo = () => {
    const x1 = sx.get();
    const y1 = sy.get();
    const g = grow.get();
    const x2 = x1 + (ex.get() - x1) * g;
    const y2 = y1 + (ey.get() - y1) * g;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    let nx = dy / len;
    let ny = -dx / len;
    if (ny > 0) {
      nx = -nx;
      ny = -ny;
    }
    const bow = Math.min(34, 6 + len * 0.16);
    return { x1, y1, x2, y2, cx: (x1 + x2) / 2 + nx * bow, cy: (y1 + y2) / 2 + ny * bow, len };
  };
  const d = useTransform(() => {
    const { x1, y1, x2, y2, cx, cy } = geo();
    return `M${x1.toFixed(1)} ${y1.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  });
  const head = useTransform(() => {
    const { x2, y2, cx, cy } = geo();
    const a = Math.atan2(y2 - cy, x2 - cx);
    const k = 11;
    return [
      [x2, y2],
      [x2 - k * Math.cos(a - 0.42), y2 - k * Math.sin(a - 0.42)],
      [x2 - k * Math.cos(a + 0.42), y2 - k * Math.sin(a + 0.42)],
    ]
      .map((p) => p.map((n) => n.toFixed(1)).join(","))
      .join(" ");
  });
  const opacity = useTransform(() => Math.min(1, Math.max(0, (geo().len - 8) / 14)));
  // The chip rides the top of the curve.
  const lx = useTransform(() => {
    const { x1, x2, cx } = geo();
    return 0.25 * x1 + 0.5 * cx + 0.25 * x2;
  });
  const ly = useTransform(() => {
    const { y1, y2, cy } = geo();
    return 0.25 * y1 + 0.5 * cy + 0.25 * y2 - 6;
  });

  return (
    <g className={`ll-ptr ll-ptr-${tone} ${dashed ? "ll-ptr-dashed" : ""}`}>
      <motion.g style={{ opacity }}>
        <motion.path d={d} className="ll-ptr-line" />
        <motion.polygon points={head} className="ll-ptr-head" />
      </motion.g>
      <AnimatePresence>
        {label && (
          <motion.g key={label} style={{ x: lx, y: ly }}>
            <motion.g initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <rect x={-(label.length * 3.6 + 8)} y={-19} width={label.length * 7.2 + 16} height={18} rx={5} className="ll-chip" />
              <text x={0} y={-10} className="ll-chip-text">
                {label}
              </text>
            </motion.g>
          </motion.g>
        )}
      </AnimatePresence>
    </g>
  );
};

// head / cur: a marker under a node that glides to the next node it names.
const Marker = ({ rec, text, tone, drop, duration }) => {
  const [x, y] = useFollow(rec, [UNDER[0], UNDER[1] + drop], () => [0, 0], duration);
  const w = text.length * 7.4 + 14;
  return (
    <motion.g className={`ll-marker ll-marker-${tone}`} style={{ x, y }}>
      <rect x={-w / 2} y={0} width={w} height={20} rx={5} />
      <text x={0} y={10.5}>
        {text}
      </text>
    </motion.g>
  );
};

// A node, glued to its motion values. It drops in when created and floats
// off when it is gone. Its variable name (node, old, gone) rides above it.
const ListNode = ({ rec, node, nextNull, reduced }) => {
  const y = useTransform(() => rec.y.get() - rec.lift.get() * U);
  const shadowY = useTransform(() => rec.lift.get() * U);
  const shadowOpacity = useTransform(rec.lift, [0, 0.3], [0, 1]);
  const [cx, cy] = project(0.7, 0.5, 0);
  const [lx, ly] = project(0.5, 0.5, 1);

  return (
    <motion.g style={{ x: rec.x, y }}>
      <motion.g style={{ y: shadowY, opacity: shadowOpacity }}>
        <ellipse className="ll-shadow" cx={cx} cy={cy + 6} rx={U * 0.95} ry={U * 0.45} />
      </motion.g>
      <motion.g
        initial={reduced ? false : { opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -18, transition: { duration: 0.35, ease: EASE } }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        <NodeBox tone={node.tone} label={node.value} nextNull={nextNull} />
        <AnimatePresence>
          {node.label && (
            <motion.g key={node.label} className={`ll-var ${node.label === "deleted" ? "ll-var-ink" : ""}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <line x1={lx} y1={ly - 2} x2={lx} y2={ly - 16} />
              <rect x={lx - (node.label.length * 3.8 + 10)} y={ly - 36} width={node.label.length * 7.6 + 20} height={21} rx={6} />
              <text x={lx} y={ly - 25.5}>
                {node.label}
              </text>
            </motion.g>
          )}
        </AnimatePresence>
      </motion.g>
    </motion.g>
  );
};

// frame: { min, max, lift } slots and height the whole operation uses.
const LinkedStage = ({ step, frame }) => {
  const reduced = useReducedMotion();
  const speed = useSpeed();
  const transition = reduced ? { duration: 0 } : springFor(speed, 0.6);
  const swing = 0.75 * paceOf(speed);

  const targets = step.nodes.map((n) => {
    const [x, y] = project(n.slot * STEP, 0, 0);
    return [n.id, [x, y, n.lift]];
  });
  const motionOf = useNodeMotion(targets, transition);

  const view = bounds(
    [
      ...boxCorners(frame.min * STEP - 0.4, -0.2, 0, (frame.max - frame.min) * STEP + 2.3, 1.6, 1 + frame.lift + 1.4),
      [frame.min * STEP, 1.9, 0],
    ],
    20
  );

  const outgoing = new Map(step.ptrs.map((p) => [p.from, p.to]));
  const ordered = [...step.nodes].sort((a, b) => a.slot - b.slot || a.lift - b.lift);
  const headPin = step.pins.find((p) => p.text === "head");

  return (
    <IsoScene view={view} label="Linked list" smooth>
      {step.nodes.length === 0 && <Note at={[0.6, 0.5, 0.5]} text="empty list · head = null" size={15} />}

      <g>
        <AnimatePresence>
          {ordered.map((n) => (
            <ListNode key={n.id} rec={motionOf.get(n.id)} node={n} nextNull={outgoing.get(n.id) == null} reduced={reduced} />
          ))}
        </AnimatePresence>
      </g>

      {/* Pointers over the cubes, so a swinging arrow is never hidden. */}
      <g>
        <AnimatePresence>
          {step.ptrs.map((p) => (
            <motion.g key={p.from} exit={{ opacity: 0, transition: { duration: 0.25 } }}>
              <Pointer from={motionOf.get(p.from)} to={p.to != null ? motionOf.get(p.to) ?? null : null} tone={p.tone} dashed={p.dashed} label={p.label} duration={swing} />
            </motion.g>
          ))}
        </AnimatePresence>
      </g>

      <AnimatePresence>
        {step.pins.map((p) => {
          const rec = motionOf.get(p.at);
          if (!rec) return null;
          const shared = p.text === "cur" && headPin && headPin.at === p.at;
          return (
            <motion.g key={p.text} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Marker rec={rec} text={p.text} tone={p.tone} drop={shared ? 26 : 2} duration={swing} />
            </motion.g>
          );
        })}
      </AnimatePresence>
    </IsoScene>
  );
};

export default LinkedStage;
