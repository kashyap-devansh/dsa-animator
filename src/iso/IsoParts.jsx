import { createContext, useContext, useEffect, useId, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { U, project, pts, faceMatrix } from "./projection";
import "./iso.css";

// Building blocks for the isometric diagrams: a scene (svg + shared patterns),
// boxes that glide to new positions, floor tiles, links and callouts.

const SceneCtx = createContext("iso");
const useIds = () => useContext(SceneCtx);


// maxScale caps how far a small scene may be blown up to fill the stage.
export const IsoScene = ({ view, children, className = "", label, maxScale = 1.75 }) => {
  const id = useId().replace(/:/g, "");

  return (
    <svg
      className={`iso-scene ${className}`}
      viewBox={`${view.x.toFixed(1)} ${view.y.toFixed(1)} ${view.w.toFixed(1)} ${view.h.toFixed(1)}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ maxWidth: view.w * maxScale, maxHeight: view.h * maxScale }}
      role="img"
      aria-label={label}
    >
      <defs>
        {["coral", "sage", "ink", "amber", "ghost"].map((tone) => (
          <pattern
            key={tone}
            id={`${id}-hatch-${tone}`}
            width="7"
            height="7"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-50)"
          >
            <rect width="7" height="7" className={`iso-hatch-bg iso-hatch-bg-${tone}`} />
            <rect width="3.2" height="7" className={`iso-hatch-fg iso-hatch-fg-${tone}`} />
          </pattern>
        ))}
        <filter id={`${id}-soft`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <SceneCtx.Provider value={id}>{children}</SceneCtx.Provider>
    </svg>
  );
};

// Moves its children to a world position, smoothly:
// - sideways travel (a swap, a shift, a hop between buckets) follows a low,
//   gentle arc, a little higher when moving right than left, so two values
//   swapping pass over and under each other instead of through;
// - everything else eases into place with a soft spring and no overshoot;
// - a newly mounted thing fades in from just above.
// `glide` moves in a straight line: true for 1.1s (tree rotations), or a
// number of seconds (a queen sliding along its row); `instant` skips motion.
const SPRING = { type: "spring", stiffness: 170, damping: 26, mass: 1 };
const EASE = [0.45, 0, 0.25, 1];

export const At = ({ x = 0, y = 0, z = 0, children, className = "", style, instant = false, glide = false }) => {
  const [sx, sy] = project(x, y, z);
  const reduced = useReducedMotion();
  const prev = useRef(null);
  const p = prev.current;

  useEffect(() => {
    prev.current = [sx, sy];
  });

  if (instant || reduced) {
    return (
      <g className={className} style={style} transform={`translate(${sx.toFixed(2)} ${sy.toFixed(2)})`}>
        {children}
      </g>
    );
  }

  let initial = false;
  let animate = { x: sx, y: sy, opacity: 1 };
  let transition = SPRING;

  if (!p) {
    initial = { x: sx, y: sy - 10, opacity: 0 };
    transition = { x: SPRING, y: SPRING, opacity: { duration: 0.3 } };
  } else if (glide) {
    transition = { duration: typeof glide === "number" ? glide : 1.1, ease: EASE };
  } else {
    const dx = sx - p[0];
    if (Math.abs(dx) > 6) {
      const hop = dx > 0 ? 16 + Math.min(Math.abs(dx) * 0.12, 18) : 4;
      const top = Math.min(p[1], sy) - hop;
      const timing = { duration: 0.6, times: [0, 0.5, 1], ease: [EASE, EASE] };
      animate = { x: [p[0], (p[0] + sx) / 2, sx], y: [p[1], top, sy], opacity: 1 };
      transition = { x: timing, y: timing, opacity: { duration: 0 } };
    }
  }

  return (
    <motion.g className={className} style={style} initial={initial} animate={animate} transition={transition}>
      {children}
    </motion.g>
  );
};

/* ---------- round shapes ---------- */

// Points of a floor-plane circle at height z, projected; θ from a to b degrees.
const arc = (cx, cy, r, z, a, b, n = 24) => {
  const out = [];
  for (let k = 0; k <= n; k++) {
    const t = ((a + ((b - a) * k) / n) * Math.PI) / 180;
    out.push(project(cx + r * Math.cos(t), cy + r * Math.sin(t), z));
  }
  return out;
};
const path = (points, close = true) => "M" + points.map((q) => `${q[0].toFixed(2)},${q[1].toFixed(2)}`).join(" L") + (close ? " Z" : "");

// A cylinder standing on the floor, centred on (r, r) so it fills a cell of
// size 2r like a box would. hole draws a dark centre (a disk on a pole).
export const Cylinder = ({ r = 0.5, h = 0.5, tone = "idle", label, labelSize, hole = 0, shadow = false }) => {
  const id = useIds();
  const c = r;
  // The front of the side band runs from θ = -45° round to 135°.
  const side = [...arc(c, c, r, 0, -45, 135), ...arc(c, c, r, h, 135, -45)];
  const top = arc(c, c, r, h, 0, 360, 36);
  const [lx, ly] = project(c, c, h);
  const [fx, fy] = project(c + r * Math.SQRT1_2, c + r * Math.SQRT1_2, h / 2);

  return (
    <g className={`iso-cyl iso-tone-${tone}`}>
      {shadow && <path className="iso-shadow" filter={`url(#${id}-soft)`} d={path(arc(c + 0.1, c + 0.15, r, -shadow, 0, 360, 24))} />}
      <path className="iso-face iso-front" d={path(side)} />
      <path className="iso-face iso-top" d={path(top)} />
      {hole > 0 && <path className="iso-hole" d={path(arc(c, c, hole, h, 0, 360, 24))} />}
      {label !== undefined && label !== null && label !== "" && (
        <text className="iso-label" x={hole ? fx : lx} y={hole ? fy : ly} fontSize={labelSize ?? Math.min(0.5, r) * U * 0.95}>
          {label}
        </text>
      )}
    </g>
  );
};

// A chess queen standing on its square: a round base, a tapered body and a
// crown. Drawn upright in screen space, sized to a cell of w world units.
export const Queen = ({ w = 1, tone = "dark" }) => {
  const [bx, by] = project(w / 2, w / 2, 0);
  const s = w * U * 0.9;
  const X = (k) => (bx + k * s).toFixed(2);
  const Y = (k) => (by - k * s).toFixed(2);
  const body = [
    `M${X(-0.26)} ${Y(0.12)}`,
    `C${X(-0.26)} ${Y(0.2)} ${X(-0.14)} ${Y(0.24)} ${X(-0.12)} ${Y(0.3)}`,
    `L${X(-0.18)} ${Y(0.78)}`,
    `L${X(-0.28)} ${Y(1.02)}`,
    `L${X(-0.14)} ${Y(0.9)}`,
    `L${X(-0.07)} ${Y(1.08)}`,
    `L${X(0)} ${Y(0.92)}`,
    `L${X(0.07)} ${Y(1.08)}`,
    `L${X(0.14)} ${Y(0.9)}`,
    `L${X(0.28)} ${Y(1.02)}`,
    `L${X(0.18)} ${Y(0.78)}`,
    `L${X(0.12)} ${Y(0.3)}`,
    `C${X(0.14)} ${Y(0.24)} ${X(0.26)} ${Y(0.2)} ${X(0.26)} ${Y(0.12)}`,
    "Z",
  ].join(" ");
  const band = `M${X(-0.17)} ${Y(0.72)} L${X(0.17)} ${Y(0.72)}`;

  return (
    <g className={`iso-queen iso-tone-${tone}`}>
      <Cylinder r={w * 0.34} h={w * 0.12} tone={tone} />
      <g transform={`translate(${(-w * 0.16 * 0).toFixed(2)} 0)`}>
        <path className="iso-face iso-top iso-queen-body" d={body} transform={`translate(${project(w * 0.34 - w / 2, w * 0.34 - w / 2, w * 0.12).map((n) => n.toFixed(2)).join(" ")})`} />
        <path className="iso-queen-band" d={band} transform={`translate(${project(w * 0.34 - w / 2, w * 0.34 - w / 2, w * 0.12).map((n) => n.toFixed(2)).join(" ")})`} />
        {[-0.28, -0.07, 0.07, 0.28].map((k) => (
          <circle
            key={k}
            className="iso-queen-jewel"
            cx={X(k)}
            cy={Y(k === -0.28 || k === 0.28 ? 1.02 : 1.08)}
            r={s * 0.035}
            transform={`translate(${project(w * 0.34 - w / 2, w * 0.34 - w / 2, w * 0.12).map((n) => n.toFixed(2)).join(" ")})`}
          />
        ))}
      </g>
    </g>
  );
};

// A linked-list node: a value cell joined to a narrow "next" cell.
export const NodeBox = ({ tone = "idle", label, nextNull = false }) => (
  <g className="iso-node">
    <Box w={1} tone={tone} label={label} />
    <g transform={`translate(${project(1, 0, 0).map((n) => n.toFixed(2)).join(" ")})`}>
      <Box w={0.42} tone={nextNull ? "ghost" : "dark"} />
      <circle className="iso-node-dot" cx={project(0.21, 1, 0.5)[0]} cy={project(0.21, 1, 0.5)[1]} r={3.2} />
    </g>
  </g>
);

const HATCH = { idle: "coral", coral: "coral", soft: "coral", sage: "sage", dark: "ink", amber: "amber", ghost: "coral" };

// A box with its back-top-left corner at the local origin.
// tone: idle | coral | soft | sage | dark | amber | ghost
export const Box = ({
  w = 1,
  d = 1,
  h = 1,
  tone = "idle",
  label,
  topLabel,
  labelSize,
  sideLabel,
  dashed = false,
  shadow = false,
}) => {
  const id = useIds();
  const hatch = HATCH[tone] ?? "coral";
  const size = labelSize ?? Math.min(0.56, h * 0.62, w * 0.5) * U;

  return (
    <g className={`iso-box iso-tone-${tone} ${dashed ? "iso-dashed" : ""}`}>
      {shadow && (
        <polygon
          className="iso-shadow"
          filter={`url(#${id}-soft)`}
          points={pts([
            [0.1, 0.25, -shadow],
            [w + 0.25, 0.25, -shadow],
            [w + 0.25, d + 0.35, -shadow],
            [0.1, d + 0.35, -shadow],
          ])}
        />
      )}

      <polygon className="iso-face iso-top" points={pts([[0, 0, h], [w, 0, h], [w, d, h], [0, d, h]])} />
      <polygon className="iso-face iso-front" points={pts([[0, d, 0], [w, d, 0], [w, d, h], [0, d, h]])} />
      <polygon
        className="iso-face iso-side"
        style={{ fill: `url(#${id}-hatch-${hatch})` }}
        points={pts([[w, 0, 0], [w, d, 0], [w, d, h], [w, 0, h]])}
      />

      {label !== undefined && label !== null && label !== "" && (
        <text
          className="iso-label"
          transform={faceMatrix("front", [0, d, h])}
          x={(w * U) / 2}
          y={(h * U) / 2}
          fontSize={size}
        >
          {label}
        </text>
      )}

      {topLabel !== undefined && topLabel !== null && (
        <text className="iso-top-label" transform={faceMatrix("top", [0, 0, h])} x={(w * U) / 2} y={(d * U) / 2} fontSize={0.38 * U}>
          {topLabel}
        </text>
      )}

      {sideLabel && (
        <text className="iso-side-label" transform={faceMatrix("side", [w, d, h])} x={(d * U) / 2} y={(h * U) / 2} fontSize={0.3 * U}>
          {sideLabel}
        </text>
      )}
    </g>
  );
};

export const SLAB_H = 0.72;

// The coral outline a cube sits in, slightly bigger than the cube.
export const Seat = ({ w = 1, d = 1, z = 0, m = 0.07 }) => (
  <polygon className="iso-seat" points={pts([[-m, -m, z], [w + m, -m, z], [w + m, d + m, z], [-m, d + m, z]])} />
);

// A flat square on the floor, e.g. an empty array cell or a board square.
export const Tile = ({ w = 1, d = 1, z = 0, tone = "slot", label }) => (
  <g className={`iso-tile iso-tile-${tone}`}>
    <polygon points={pts([[0, 0, z], [w, 0, z], [w, d, z], [0, d, z]])} />
    {label !== undefined && (
      <text className="iso-tile-label" transform={faceMatrix("top", [0, 0, z])} x={(w * U) / 2} y={(d * U) / 2} fontSize={0.34 * U}>
        {label}
      </text>
    )}
  </g>
);

// A long base the cells sit on, with index numbers along its front edge.
export const Slab = ({ x = 0, y = 0, w, d = 1.6, h = SLAB_H, indexAt = [], indexLabels, highlight = [] }) => {
  const id = useIds();

  return (
    <g className="iso-slab">
      <polygon className="iso-slab-top" points={pts([[x, y, 0], [x + w, y, 0], [x + w, y + d, 0], [x, y + d, 0]])} />
      <polygon className="iso-slab-front" points={pts([[x, y + d, -h], [x + w, y + d, -h], [x + w, y + d, 0], [x, y + d, 0]])} />
      <polygon
        className="iso-slab-side"
        style={{ fill: `url(#${id}-hatch-coral)` }}
        points={pts([[x + w, y, -h], [x + w, y + d, -h], [x + w, y + d, 0], [x + w, y, 0]])}
      />
      {indexAt.map((cx, i) => (
        <text
          key={i}
          className={`iso-slab-index ${highlight.includes(i) ? "iso-slab-index-on" : ""}`}
          transform={faceMatrix("front", [cx, y + d, 0])}
          x={0}
          y={(h * U) / 2}
          fontSize={(indexLabels ? 0.3 : 0.4) * U}
        >
          {indexLabels ? indexLabels[i] : i}
        </text>
      ))}
    </g>
  );
};

// A straight line on (or above) the floor between two world points, with an
// optional arrowhead at the end.
export const Link = ({ from, to, tone = "ink", arrow = false, dashed = false, width = 1.6 }) => {
  const [x1, y1] = project(...from);
  const [x2, y2] = project(...to);
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const head = 9;

  return (
    <g className={`iso-link iso-link-${tone} ${dashed ? "iso-dashed" : ""}`}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={width} />
      {arrow && (
        <polygon
          points={[
            [x2, y2],
            [x2 - head * Math.cos(ang - 0.42), y2 - head * Math.sin(ang - 0.42)],
            [x2 - head * Math.cos(ang + 0.42), y2 - head * Math.sin(ang + 0.42)],
          ]
            .map((p) => p.join(","))
            .join(" ")}
        />
      )}
    </g>
  );
};

// A tag that floats above a world point with a leader line down to it.
export const Callout = ({ at, text, tone = "coral", rise = 1.2, small = false }) => {
  const reduced = useReducedMotion();
  if (!text) return null;

  const [ax, ay] = project(...at);
  const fs = small ? 12 : 14;
  const wpx = Math.max(44, String(text).length * fs * 0.58 + 26);
  const hpx = small ? 24 : 30;
  const top = -rise * U - hpx;

  // Drawn around its anchor so it can glide with the cube; a new message pops.
  return (
    <motion.g
      className={`iso-callout iso-callout-${tone}`}
      initial={false}
      animate={{ x: ax, y: ay }}
      transition={reduced ? { duration: 0 } : SPRING}
    >
      <motion.g
        key={String(text)}
        initial={reduced ? false : { scale: 0.94, opacity: 0, y: 4 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: EASE }}
        style={{ transformOrigin: "0px 0px" }}
      >
        <line x1={0} y1={0} x2={0} y2={top + hpx} />
        <circle cx={0} cy={0} r={3.4} />
        <rect x={-wpx / 2} y={top} width={wpx} height={hpx} rx={6} />
        <text x={0} y={top + hpx / 2} fontSize={fs}>
          {text}
        </text>
      </motion.g>
    </motion.g>
  );
};

// A small dark pill pinned to a world point, used for pointers like i, j, lo, hi.
export const Pin = ({ at, text, tone = "ink", drop = 0 }) => {
  const reduced = useReducedMotion();
  const [ax, ay] = project(...at);
  const w = Math.max(22, String(text).length * 7.4 + 12);

  return (
    <motion.g className={`iso-pin iso-pin-${tone}`} initial={false} animate={{ x: ax, y: ay + drop }} transition={reduced ? { duration: 0 } : SPRING}>
      <rect x={-w / 2} y={0} width={w} height={20} rx={5} />
      <text x={0} y={10.5} fontSize={12}>
        {text}
      </text>
    </motion.g>
  );
};

// A label floating flat in screen space (not projected onto a face).
export const Note = ({ at, text, anchor = "middle", tone = "ink-3", size = 13, weight = 500 }) => {
  const [x, y] = project(...at);
  return (
    <text className={`iso-note iso-note-${tone}`} x={x} y={y} textAnchor={anchor} fontSize={size} fontWeight={weight}>
      {text}
    </text>
  );
};
