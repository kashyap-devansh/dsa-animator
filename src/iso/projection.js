// 2:1 "pixel" isometric projection (dimetric): rows run at about 26.6°,
// flatter than true isometric, so long rows use the stage's width.
// World axes: x runs toward the lower right of the screen, y toward the
// lower left, z straight up. One world unit is U px.

export const U = 40;
const C = 0.94;
const S = 0.47;

export function project(x, y, z = 0) {
  return [(x - y) * C * U, (x + y) * S * U - z * U];
}

export const pts = (list) => list.map((p) => project(...p).map((n) => n.toFixed(2)).join(",")).join(" ");

// SVG matrix that maps a flat local (u, v) drawing onto a world face.
// "front" is the face at the box's +y side (runs along x, faces lower left),
// "side" the +x face (runs along y, faces lower right), "top" the lid.
export function faceMatrix(face, origin) {
  const [ox, oy] = project(...origin);
  if (face === "front") return `matrix(${C},${S},0,1,${ox.toFixed(2)},${oy.toFixed(2)})`;
  if (face === "side") return `matrix(${-C},${S},0,1,${ox.toFixed(2)},${oy.toFixed(2)})`;
  return `matrix(${C},${S},${-C},${S},${ox.toFixed(2)},${oy.toFixed(2)})`;
}

// Screen-space bounding box of a set of world points, padded.
export function bounds(points, pad = 24) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const p of points) {
    const [sx, sy] = project(...p);
    minX = Math.min(minX, sx);
    minY = Math.min(minY, sy);
    maxX = Math.max(maxX, sx);
    maxY = Math.max(maxY, sy);
  }

  return { x: minX - pad, y: minY - pad, w: maxX - minX + pad * 2, h: maxY - minY + pad * 2 };
}

export function boxCorners(x, y, z, w, d, h) {
  const out = [];
  for (const dx of [0, w]) for (const dy of [0, d]) for (const dz of [0, h]) out.push([x + dx, y + dy, z + dz]);
  return out;
}
