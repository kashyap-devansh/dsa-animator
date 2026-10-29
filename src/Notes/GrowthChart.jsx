import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

// Interactive Big-O explorer: drag n and watch the growth classes pull apart.

const log2 = (n) => Math.log2(Math.max(n, 1));

const CLASSES = [
  { id: "1", label: "O(1)", color: "#b4ff39", f: () => 1, log10: () => 0 },
  { id: "log", label: "O(log n)", color: "#56b6c2", f: (n) => log2(n), log10: (n) => Math.log10(Math.max(log2(n), 1)) },
  { id: "n", label: "O(n)", color: "#7c8cff", f: (n) => n, log10: (n) => Math.log10(n) },
  { id: "nlog", label: "O(n log n)", color: "#c792ea", f: (n) => n * log2(n), log10: (n) => Math.log10(n * Math.max(log2(n), 1)) },
  { id: "n2", label: "O(n²)", color: "#ffb454", f: (n) => n * n, log10: (n) => 2 * Math.log10(n) },
  { id: "2n", label: "O(2ⁿ)", color: "#ff6a3d", f: (n) => 2 ** n, log10: (n) => n * Math.log10(2) },
];

const W = 560;
const H = 300;
const PAD = { l: 36, r: 16, t: 14, b: 28 };
const X_MAX = 40;
const Y_MAX = 420;

const sx = (n) => PAD.l + ((n - 1) / (X_MAX - 1)) * (W - PAD.l - PAD.r);
const sy = (v) => H - PAD.b - (Math.min(v, Y_MAX * 1.05) / Y_MAX) * (H - PAD.t - PAD.b);

function pathFor(f) {
  let d = "";
  for (let n = 1; n <= X_MAX; n += 0.25) {
    const v = f(n);
    d += `${d ? "L" : "M"}${sx(n).toFixed(1)},${sy(v).toFixed(1)}`;
    if (v > Y_MAX * 1.05) break;
  }
  return d;
}

const fmtOps = (v) => {
  if (v >= 1e15) return v.toExponential(1).replace("e+", "e");
  if (v >= 1e6) return `${(v / 1e6).toFixed(v >= 1e8 ? 0 : 1)}M`;
  if (v >= 1e4) return `${(v / 1e3).toFixed(0)}k`;
  return v < 10 && v % 1 ? v.toFixed(1) : Math.round(v).toLocaleString();
};

// Time at 10⁸ simple operations per second, from log10(ops).
function fmtTime(log10ops) {
  const s = log10ops - 8;
  if (s > 17.6) return "longer than the universe has existed";
  const sec = 10 ** s;
  if (sec < 1e-6) return `${(sec * 1e9).toFixed(0)} ns`;
  if (sec < 1e-3) return `${(sec * 1e6).toFixed(0)} µs`;
  if (sec < 1) return `${(sec * 1e3).toFixed(0)} ms`;
  if (sec < 60) return `${sec.toFixed(1)} s`;
  if (sec < 3600) return `${(sec / 60).toFixed(0)} min`;
  if (sec < 86400) return `${(sec / 3600).toFixed(1)} hours`;
  if (sec < 3.15e7) return `${(sec / 86400).toFixed(0)} days`;
  const years = sec / 3.15e7;
  if (years < 1e6) return `${Math.round(years).toLocaleString()} years`;
  return `${years.toExponential(0).replace("e+", "e")} years`;
}

const SCALES = [
  { n: 1_000, label: "1 thousand" },
  { n: 1_000_000, label: "1 million" },
  { n: 1_000_000_000, label: "1 billion" },
];

const GrowthChart = () => {
  const [n, setN] = useState(12);
  const [scale, setScale] = useState(1);
  const reduced = useReducedMotion();
  const paths = useMemo(() => CLASSES.map((c) => pathFor(c.f)), []);
  const big = SCALES[scale].n;

  return (
    <div className="gc">
      <div className="gc-chart">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Growth of common complexity classes">
          {[0, 100, 200, 300, 400].map((v) => (
            <g key={v}>
              <line x1={PAD.l} x2={W - PAD.r} y1={sy(v)} y2={sy(v)} className="gc-grid" />
              <text x={PAD.l - 8} y={sy(v) + 4} className="gc-axis" textAnchor="end">
                {v}
              </text>
            </g>
          ))}
          {[1, 10, 20, 30, 40].map((v) => (
            <text key={v} x={sx(v)} y={H - 8} className="gc-axis" textAnchor="middle">
              {v}
            </text>
          ))}

          {CLASSES.map((c, i) => (
            <motion.path
              key={c.id}
              d={paths[i]}
              fill="none"
              stroke={c.color}
              strokeWidth="2.4"
              strokeLinecap="round"
              initial={reduced ? false : { pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              style={{ filter: `drop-shadow(0 0 6px ${c.color}55)` }}
            />
          ))}

          <line x1={sx(n)} x2={sx(n)} y1={PAD.t} y2={H - PAD.b} className="gc-scrub" />
          {CLASSES.map((c) => {
            const v = c.f(n);
            if (v > Y_MAX) return null;
            return <circle key={c.id} cx={sx(n)} cy={sy(v)} r="4.5" fill="#0a0a0b" stroke={c.color} strokeWidth="2.4" />;
          })}
        </svg>

        <label className="gc-slider">
          <span>
            n = <b>{n}</b>
          </span>
          <input type="range" min="1" max={X_MAX} value={n} onChange={(e) => setN(Number(e.target.value))} />
        </label>
      </div>

      <div className="gc-side">
        <span className="gc-side-label">operations at n = {n}</span>
        <ul className="gc-legend">
          {CLASSES.map((c) => {
            const v = c.f(n);
            const width = Math.min(100, (Math.log10(v + 1) / Math.log10(2 ** X_MAX + 1)) * 100);
            return (
              <li key={c.id}>
                <span className="gc-name" style={{ color: c.color }}>
                  {c.label}
                </span>
                <span className="gc-bar">
                  <motion.i style={{ background: c.color }} animate={{ width: `${Math.max(width, 1.5)}%` }} transition={{ type: "spring", stiffness: 260, damping: 30 }} />
                </span>
                <span className="gc-val">{fmtOps(v)}</span>
              </li>
            );
          })}
        </ul>

        <div className="gc-scale">
          <span className="gc-side-label">at 10⁸ steps / second, n =</span>
          <div className="gc-scale-tabs">
            {SCALES.map((s, i) => (
              <button key={s.n} type="button" className={i === scale ? "is-active" : ""} onClick={() => setScale(i)}>
                {s.label}
              </button>
            ))}
          </div>
          <ul>
            {CLASSES.slice(1).map((c) => (
              <li key={c.id}>
                <span style={{ color: c.color }}>{c.label}</span>
                <b className={c.id === "2n" || (c.id === "n2" && big >= 1e6) ? "gc-ouch" : ""}>{fmtTime(c.log10(big))}</b>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GrowthChart;
