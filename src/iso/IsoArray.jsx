import { motion, useReducedMotion } from "framer-motion";
import { IsoScene, At, Box, Tile, Slab, Callout, Pin, Link, Note, Seat, SLAB_H, Cylinder, NodeBox } from "./IsoParts";
import { U, bounds, boxCorners, project } from "./projection";

// Rows of cells sitting on slabs. Cells are keyed by id, so when a value
// moves to a new position it slides there instead of being redrawn.
//
// cells:    [{ id, value, pos?, dy?, tone?, lift?, label?, h? }]
// slots:    how many positions the slab holds (keeps the frame steady)
// heights:  "flat" for equal cubes, "value" for towers scaled by value
// pointers: [{ index, text, tone? }]  pills under the slab
// callouts: [{ index | id, text, tone?, small? }]  tags above a cell
// tiles:    { [pos]: tone }  floor tiles drawn in empty positions
// links:    true to draw next-pointer arrows between consecutive cells
// swaps:    [[i, j]]  positions being exchanged this step: a double-headed
//           arrow arcs over them and the two cubes visibly trade places

export const CELL = 1;
export const GAP = 0.18;
export const STEP = CELL + GAP;
export const SLAB_D = 1.6;
export const PAD_Y = (SLAB_D - CELL) / 2;
export const ROW_GAP = 1.5;

export function heightFor(value, max, mode) {
  if (mode !== "value" || typeof value !== "number" || !max) return 1;
  return 0.35 + (Math.max(0, value) / max) * 2.4;
}

const maxOf = (cells) => Math.max(1, ...cells.map((c) => (typeof c.value === "number" ? c.value : 0)));

// World points a row occupies, for framing the scene.
export function rowPoints({ y = 0, slots, cells = [], heights = "flat", maxValue, extraTop = 1.6, front = 0, step = STEP, x = 0 }) {
  const n = Math.max(slots ?? cells.length, 1);
  const max = maxValue ?? maxOf(cells);
  const tallest = heights === "value" ? heightFor(max, max, "value") : 1;
  const maxLift = Math.max(0, ...cells.map((c) => c.lift ?? 0));
  const width = (n - 1) * step + CELL;
  return [
    ...boxCorners(x - 0.4, y, -SLAB_H - 0.1, width + 0.8, SLAB_D, SLAB_H + 0.1),
    ...boxCorners(x, y + PAD_Y, 0, width, CELL, tallest + extraTop + maxLift),
    [x, y + SLAB_D + 0.9 + front, -SLAB_H],
    ...(front ? boxCorners(x, y + PAD_Y + front, 0, width, CELL, tallest + 1) : []),
  ];
}

// A curved, double-headed arrow over two slots that are trading values.
const SwapArrow = ({ from, to, z, label = "swap" }) => {
  const reduced = useReducedMotion();
  const [x1, y1] = project(...from, z);
  const [x2, y2] = project(...to, z);
  const lift = 26 + Math.min(Math.abs(x2 - x1) * 0.22, 40);
  const mx = (x1 + x2) / 2;
  const my = Math.min(y1, y2) - lift;
  // Heads point back along the curve at each end.
  const head = (x, y, cx, cy) => {
    const a = Math.atan2(y - cy, x - cx);
    const k = 9;
    return `${x},${y} ${x - k * Math.cos(a - 0.45)},${y - k * Math.sin(a - 0.45)} ${x - k * Math.cos(a + 0.45)},${y - k * Math.sin(a + 0.45)}`;
  };
  const d = `M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`;

  return (
    <motion.g
      className="iso-swap"
      initial={reduced ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.path d={d} initial={reduced ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, ease: [0.45, 0, 0.25, 1] }} />
      <polygon points={head(x1, y1, mx, my)} />
      <polygon points={head(x2, y2, mx, my)} />
      <text x={mx} y={(y1 + y2) / 4 + my / 2 - 8}>
        {label}
      </text>
    </motion.g>
  );
};

export const Row = ({
  cells,
  slots,
  y = 0,
  x = 0,
  heights = "flat",
  maxValue,
  pointers = [],
  callouts = [],
  tiles = {},
  links = false,
  slab = true,
  indexLabels,
  indexHighlight = [],
  step = STEP,
  name,
  arrows = [],
  shape = "box",
  swaps = [],
}) => {
  const n = Math.max(slots ?? cells.length, 1);
  const max = maxValue ?? maxOf(cells);
  const width = (n - 1) * step + CELL;
  const cx = (pos) => x + pos * step + CELL / 2;
  const ordered = cells
    .map((c, i) => ({ ...c, pos: c.pos ?? i, dy: c.dy ?? 0 }))
    .sort((a, b) => a.pos * step + a.dy - (b.pos * step + b.dy) || (a.lift ?? 0) - (b.lift ?? 0));
  const inRow = ordered.filter((c) => !c.dy);
  const pinRows = {};
  const heightOf = (c) => (c.h ?? heightFor(c.value, max, heights)) + (c.lift ?? 0);

  // Cubes in a swap: how high the right-moving one must arc to clear the other.
  const pairs = swaps.filter(([a, b]) => a !== b && a >= 0 && b >= 0 && a < n && b < n);
  const clearFor = {};
  for (const [a, b] of pairs) {
    const ca = inRow.find((c) => c.pos === a);
    const cb = inRow.find((c) => c.pos === b);
    if (!ca || !cb) continue;
    const px = Math.max(heightOf(ca), heightOf(cb)) * U * 0.9 + 22;
    clearFor[ca.id] = px;
    clearFor[cb.id] = px;
  }

  // A next-pointer arrow. Within a row it runs near the front edge so its head
  // stays visible and stops just short of the next cube. Between lanes (a new
  // node waiting in front of the list) it runs from face to face and is drawn
  // over the cubes, so a pointer swinging between them is never hidden.
  const cellOf = (id) => ordered.find((o) => o.id === id);
  const arrowFor = (a) => {
    const from = cellOf(a.from);
    const to = a.to !== null && a.to !== undefined ? cellOf(a.to) : null;
    if (!from) return null;
    const nextX = (c) => x + c.pos * step + CELL + ((c.shape ?? shape) === "node" ? 0.21 : 0);
    let start;
    let end;
    if (to && from.dy !== to.dy) {
      const forward = to.dy > from.dy;
      start = [nextX(from), y + PAD_Y + from.dy + (forward ? CELL : 0), (from.lift ?? 0) + 0.5];
      end = [x + to.pos * step + CELL / 2, y + PAD_Y + to.dy + (forward ? 0 : CELL), (to.lift ?? 0) + (forward ? 1.02 : 0.5)];
    } else {
      const fy = y + PAD_Y + 0.8 + from.dy;
      const fz = (from.lift ?? 0) + 0.5;
      start = [x + from.pos * step + CELL + ((from.shape ?? shape) === "node" ? 0.42 : 0), fy, fz];
      end = to ? [x + to.pos * step - 0.22, y + PAD_Y + 0.8 + to.dy, (to.lift ?? 0) + 0.5] : [x + from.pos * step + CELL + 0.5, fy, fz];
    }
    // Keyed by the node it leaves from, so a pointer that is reassigned
    // swings to its new target instead of being redrawn; a new one grows.
    return <Link key={`a-${a.from}`} from={start} to={end} arrow={!!to} dashed={a.dashed} tone={a.tone ?? "ink"} width={2} grow />;
  };

  return (
    <g>
      {slab && (
        <Slab
          x={x - 0.4}
          y={y}
          w={width + 0.8}
          d={SLAB_D}
          indexAt={Array.from({ length: n }, (_, i) => cx(i))}
          indexLabels={indexLabels}
          highlight={indexHighlight}
        />
      )}

      {name && <Note at={[x - 0.7, y + SLAB_D / 2, 0]} text={name} anchor="end" size={13} weight={600} tone="ink-3" />}

      {Object.entries(tiles).map(([pos, tone]) => (
        <At key={`t${pos}`} x={x + Number(pos) * step} y={y + PAD_Y} instant>
          <Tile tone={tone} />
        </At>
      ))}

      {links &&
        inRow.slice(0, -1).map((c, i) => {
          const next = inRow[i + 1];
          return (
            <Link
              key={`l${c.id}`}
              from={[x + c.pos * step + CELL, y + PAD_Y + CELL / 2, 0.5]}
              to={[x + next.pos * step - 0.02, y + PAD_Y + CELL / 2, 0.5]}
              arrow
              tone={c.linkTone ?? "ink"}
            />
          );
        })}

      {ordered.map((c) => {
        const h = c.h ?? heightFor(c.value, max, heights);
        const lift = c.lift ?? 0;
        return (
          <At key={c.id} x={x + c.pos * step} y={y + PAD_Y + c.dy} z={lift} clear={clearFor[c.id] ?? 0}>
            {c.seat !== false && (c.shape ?? shape) !== "cylinder" && <Seat z={-lift} />}
            {(c.shape ?? shape) === "cylinder" ? (
              <Cylinder r={0.5} h={c.h ?? 0.5} tone={c.tone ?? "idle"} label={c.label ?? c.value} shadow={c.shadow === false ? false : lift > 0 ? lift : false} />
            ) : (c.shape ?? shape) === "node" ? (
              <NodeBox tone={c.tone ?? "idle"} label={c.label ?? c.value} nextNull={c.nextNull} />
            ) : (
              <Box
                h={h}
                tone={c.tone ?? "idle"}
                label={c.label ?? c.value}
                topLabel={c.topLabel}
                shadow={c.shadow === false ? false : lift > 0 ? lift : false}
                labelSize={heights === "value" ? 0.44 * 40 : c.labelSize}
              />
            )}
          </At>
        );
      })}

      {/* One layer for every pointer, over the cubes, so a reassigned pointer
          always swings in place (switching layers would redraw it). */}
      <g>{arrows.map(arrowFor)}</g>

      {pairs.map(([a, b]) => {
        const top = Math.max(...inRow.filter((c) => c.pos === a || c.pos === b).map(heightOf), 1);
        return <SwapArrow key={`sw${Math.min(a, b)}-${Math.max(a, b)}`} from={[cx(a), y + PAD_Y + CELL / 2]} to={[cx(b), y + PAD_Y + CELL / 2]} z={top + 0.35} />;
      })}

      {pointers.map((p, i) => {
        const row = (pinRows[p.index] = (pinRows[p.index] ?? -1) + 1);
        return <Pin key={`p${i}-${p.text}`} at={slab ? [cx(p.index), y + SLAB_D, -SLAB_H] : [cx(p.index), y + PAD_Y + CELL + 0.15 + (p.dy ?? 0), 0]} text={p.text} tone={p.tone} drop={10 + row * 24} />;
      })}

      {callouts.map((c, i) => {
        const cell = c.id !== undefined ? ordered.find((o) => o.id === c.id) : ordered.find((o) => o.pos === c.index && !o.dy);
        const h = cell ? (cell.h ?? heightFor(cell.value, max, heights)) + (cell.lift ?? 0) : 0;
        return (
          <Callout
            key={`c${i}`}
            at={[cx(cell ? cell.pos : c.index), y + PAD_Y + CELL / 2 + (cell?.dy ?? 0), h]}
            text={c.text}
            tone={c.tone}
            small={c.small}
            rise={c.rise ?? 0.9}
          />
        );
      })}
    </g>
  );
};

// One row in its own scene: the common case.
const IsoArray = ({ label, before, after, extraTop = 1.2, front = 0, ...row }) => {
  const view = bounds(rowPoints({ ...row, extraTop, front }), 14);
  return (
    <IsoScene view={view} label={label}>
      {before}
      <Row {...row} />
      {after}
    </IsoScene>
  );
};

// Several rows stacked front to back in one scene.
// rows: [{ key, y, ...Row props }]
export const IsoRows = ({ rows, label, extraTop = 1.2, before, after, pad = 14 }) => {
  const width = Math.max(...rows.map((r) => r.slots ?? r.cells.length));
  const view = bounds(
    rows.flatMap((r) => rowPoints({ ...r, extraTop: r.extraTop ?? extraTop, slots: r.slots ?? width })),
    pad
  );
  return (
    <IsoScene view={view} label={label}>
      {before}
      {rows.map(({ key, ...r }) => (
        <Row key={key} {...r} />
      ))}
      {after}
    </IsoScene>
  );
};

export default IsoArray;
