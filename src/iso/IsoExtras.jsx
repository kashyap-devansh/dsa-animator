import { IsoScene, At, Box, Tile, Slab, Note, Queen } from "./IsoParts";
import { bounds, boxCorners } from "./projection";

// A square board on a slab. cells: { "r-c": { tone, label, lift } }
// Rows run along y (toward the viewer), columns along x.
export const IsoBoard = ({ n, pieces = {}, rowHighlight = null, label = "Board" }) => {
  const view = bounds([...boxCorners(-0.4, -0.4, -0.75, n + 0.8, n + 0.8, 0.75), ...boxCorners(0, 0, 0, n, n, 2.2)], 14);
  const order = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) order.push([r, c]);
  order.sort((a, b) => a[0] + a[1] - (b[0] + b[1]) || a[1] - b[1]);

  return (
    <IsoScene view={view} label={label}>
      <Slab x={-0.4} y={-0.4} w={n + 0.8} d={n + 0.8} />
      {order.map(([r, c]) => (
        <At key={`t${r}-${c}`} x={c} y={r} instant>
          <Tile tone={r === rowHighlight ? "coral" : (r + c) % 2 ? "dark" : "light"} />
        </At>
      ))}
      {Array.from({ length: n }, (_, r) => (
        <Note key={`r${r}`} at={[-0.75, r + 0.5, 0]} text={`row ${r}`} anchor="end" size={12} tone={r === rowHighlight ? "coral" : "ink-3"} weight={600} />
      ))}
      {order.map(([r, c]) => {
        const p = pieces[`${r}-${c}`];
        if (!p) return null;
        return (
          // A queen piece, centred on its square (its base radius is 0.34 × 0.9).
          <At key={p.id ?? `p${r}-${c}`} x={c + 0.5 - 0.306} y={r + 0.5 - 0.306} z={p.lift ?? 0} glide={0.32}>
            <Queen w={0.9} tone={p.tone} />
          </At>
        );
      })}
    </IsoScene>
  );
};

// A call stack: frames are wide flat boxes piled from the bottom up.
// frames: [{ id, label, note, tone }] bottom first
export const IsoCallStack = ({ frames, max = 8, label = "Call stack", footer }) => {
  const W = 4.6;
  const D = 1.5;
  const H = 0.78;
  const view = bounds([...boxCorners(-0.4, -0.4, -0.75, W + 0.8, D + 0.8, 0.75), ...boxCorners(0, 0, 0, W, D, max * (H + 0.08) + 0.8), [-4.5, D, 0]], 16);

  return (
    <IsoScene view={view} label={label}>
      <Slab x={-0.4} y={-0.4} w={W + 0.8} d={D + 0.8} />
      {frames.map((f, k) => (
        <At key={f.id} z={k * (H + 0.08)}>
          <Box w={W} d={D} h={H} tone={f.tone ?? "idle"} label={f.label} labelSize={15} />
          {f.note && <Note at={[-0.35, D, H / 2]} text={f.note} anchor="end" size={12.5} weight={600} tone={f.tone === "coral" ? "coral" : "ink-3"} />}
        </At>
      ))}
      {footer && <Note at={[W / 2, D + 1.3, -0.8]} text={footer} size={13} weight={600} tone="ink-3" />}
    </IsoScene>
  );
};
