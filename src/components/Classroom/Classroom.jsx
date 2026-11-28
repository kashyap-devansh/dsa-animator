import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "../../course/store";
import "./Classroom.css";

// Classroom toolkit: present mode (fullscreen, chrome hidden, stage scaled to
// fit the projector), an annotation pen, a laser pointer, a blank whiteboard
// and a random student picker. The lesson page itself owns Space / arrows.

const INKS = ["#e2694f", "#4f9a7e", "#5b6ee1", "#27282c"];
const PRESENT_WIDTH = 1100;
const HINT_KEY = "classroomHintSeen";

const SHORTCUTS = [
  ["Space", "Play / pause"],
  ["→  ←", "Step forward / back"],
  ["R", "Reset"],
  ["F", "Present mode"],
  ["T", "Light / dark theme"],
  ["PgDn / N", "Next lecture item"],
  ["PgUp / B", "Previous lecture item"],
  ["S", "Speaker notes & clock"],
  ["P", "Pen"],
  ["1 – 4", "Pen colour"],
  ["Z", "Undo last stroke"],
  ["C", "Clear drawings"],
  ["L", "Laser pointer"],
  ["W", "Blank whiteboard"],
  ["K", "Pick a student"],
  ["Esc", "Exit tool / present"],
  ["?", "This panel"],
];

// Pages opt in to being scaled to the projector with data-present-root.
const presentRoot = () => document.querySelector(".page-main [data-present-root]");

/* ---------- icons ---------- */

const Icon = ({ children }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const PresentIcon = () => <Icon><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M12 16v4M8 20h8" /></Icon>;
const ExitIcon = () => <Icon><path d="M9 4H5a1 1 0 0 0-1 1v4M15 4h4a1 1 0 0 1 1 1v4M9 20H5a1 1 0 0 1-1-1v-4M15 20h4a1 1 0 0 0 1-1v-4" /></Icon>;
const PenIcon = () => <Icon><path d="M4 20l4-1L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4z" /><path d="M14 7l3 3" /></Icon>;
const LaserIcon = () => <Icon><circle cx="12" cy="12" r="3" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3" /></Icon>;
const ClearIcon = () => <Icon><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></Icon>;
const SunIcon = () => <Icon><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></Icon>;
const BoardIcon = () => <Icon><rect x="3" y="4" width="18" height="13" rx="1.5" /><path d="M8 21l4-4 4 4M7 9.5c1.5-2 3-2 4 0s2.5 2 4 0" /></Icon>;
const PickIcon = () => <Icon><circle cx="12" cy="8" r="3.2" /><path d="M5.5 20c.8-3.6 3.3-5.5 6.5-5.5s5.7 1.9 6.5 5.5" /><path d="M18.5 3.5l1 1.5 1.7.4-1.2 1.3.2 1.8-1.7-.8-1.6.8.2-1.8-1.2-1.3 1.7-.4z" /></Icon>;
const KeysIcon = () => <Icon><rect x="2.5" y="6" width="19" height="12" rx="2" /><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10" /></Icon>;

/* ---------- drawing layer ---------- */

function useInk(tool, color) {
  const canvasRef = useRef(null);
  const strokes = useRef([]);
  const trail = useRef([]);
  const drawing = useRef(null);
  const frame = useRef(0);

  const paint = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const sx = window.scrollX;
    const sy = window.scrollY;

    for (const s of strokes.current) {
      const pts = s.points;
      if (!pts.length) continue;
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 4;
      ctx.shadowColor = s.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(pts[0].x - sx, pts[0].y - sy);
      for (let i = 1; i < pts.length - 1; i++) {
        const mx = (pts[i].x + pts[i + 1].x) / 2;
        const my = (pts[i].y + pts[i + 1].y) / 2;
        ctx.quadraticCurveTo(pts[i].x - sx, pts[i].y - sy, mx - sx, my - sy);
      }
      const last = pts[pts.length - 1];
      ctx.lineTo(last.x - sx + 0.01, last.y - sy);
      ctx.stroke();
    }

    // Laser: a hot dot with a short tail that fades out.
    const now = performance.now();
    trail.current = trail.current.filter((p) => now - p.t < 380);
    const t = trail.current;
    if (t.length) {
      ctx.shadowColor = "#ff3d2e";
      for (let i = 1; i < t.length; i++) {
        const life = 1 - (now - t[i].t) / 380;
        ctx.strokeStyle = `rgba(255, 70, 40, ${life * 0.75})`;
        ctx.lineWidth = 2 + life * 7;
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.moveTo(t[i - 1].x, t[i - 1].y);
        ctx.lineTo(t[i].x, t[i].y);
        ctx.stroke();
      }
      const head = t[t.length - 1];
      ctx.shadowBlur = 28;
      ctx.fillStyle = "#ff4a2e";
      ctx.beginPath();
      ctx.arc(head.x, head.y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#fff4ee";
      ctx.beginPath();
      ctx.arc(head.x, head.y, 2.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }, []);

  const schedule = useCallback(() => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      paint();
      if (trail.current.length) schedule();
    });
  }, [paint]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const fit = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      paint();
    };
    fit();
    window.addEventListener("resize", fit);
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      window.removeEventListener("resize", fit);
      window.removeEventListener("scroll", schedule);
      cancelAnimationFrame(frame.current);
    };
  }, [paint, schedule]);

  // Laser follows the pointer without blocking clicks.
  useEffect(() => {
    if (tool !== "laser") return;
    const move = (e) => {
      trail.current.push({ x: e.clientX, y: e.clientY, t: performance.now() });
      schedule();
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, [tool, schedule]);

  const handlers = {
    onPointerDown: (e) => {
      if (tool !== "pen") return;
      e.currentTarget.setPointerCapture(e.pointerId);
      drawing.current = { color, points: [{ x: e.clientX + window.scrollX, y: e.clientY + window.scrollY }] };
      strokes.current.push(drawing.current);
      schedule();
    },
    onPointerMove: (e) => {
      if (!drawing.current) return;
      drawing.current.points.push({ x: e.clientX + window.scrollX, y: e.clientY + window.scrollY });
      schedule();
    },
    onPointerUp: () => {
      drawing.current = null;
    },
  };

  const clear = useCallback(() => {
    strokes.current = [];
    schedule();
  }, [schedule]);

  const undo = useCallback(() => {
    strokes.current.pop();
    schedule();
  }, [schedule]);

  // The whiteboard keeps its own drawing; switching swaps the two sets.
  const swap = useCallback(
    (saved) => {
      const current = strokes.current;
      strokes.current = saved;
      schedule();
      return current;
    },
    [schedule]
  );

  return { canvasRef, handlers, clear, undo, swap };
}

/* ---------- present mode ---------- */

function usePresent(active) {
  useEffect(() => {
    if (!active) return;
    document.body.classList.add("is-presenting");

    let root = null;
    let raf = 0;

    const fit = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const next = presentRoot();
        if (root && root !== next) root.removeAttribute("data-present-fit");
        root = next;
        if (!root) return;
        root.setAttribute("data-present-fit", "");
        // Long reading pages scroll, so only their width has to fit.
        const scrolls = root.dataset.presentRoot === "scroll";
        root.style.zoom = "1";
        const h = scrolls ? 0 : root.getBoundingClientRect().height;
        const zoom = Math.max(0.6, Math.min((window.innerWidth - 80) / PRESENT_WIDTH, scrolls ? 1.5 : (window.innerHeight - 24) / h, 1.9));
        root.style.zoom = String(zoom);
      });
    };

    fit();
    const resize = new ResizeObserver(fit);
    const main = document.querySelector(".page-main");
    if (main) resize.observe(main);
    window.addEventListener("resize", fit);
    const settle = setInterval(fit, 1200);

    return () => {
      document.body.classList.remove("is-presenting");
      cancelAnimationFrame(raf);
      resize.disconnect();
      clearInterval(settle);
      window.removeEventListener("resize", fit);
      if (root) {
        root.style.zoom = "";
        root.removeAttribute("data-present-fit");
      }
    };
  }, [active]);
}

/* ---------- dock ---------- */

const DockButton = ({ label, keyHint, active, onClick, children }) => (
  <button type="button" className={`cr-btn ${active ? "cr-btn-active" : ""}`} onClick={onClick} aria-label={label} aria-pressed={active}>
    {children}
    <span className="cr-tip">
      {label} <kbd>{keyHint}</kbd>
    </span>
  </button>
);

/* ---------- student picker ---------- */

const ROSTER_KEY = "classRoster";

function readRoster() {
  try {
    return { mode: "roll", from: 1, to: 60, names: "", noRepeat: true, ...JSON.parse(localStorage.getItem(ROSTER_KEY)) };
  } catch {
    return { mode: "roll", from: 1, to: 60, names: "", noRepeat: true };
  }
}

const poolOf = (r) =>
  r.mode === "names"
    ? r.names.split(/\n|,/).map((n) => n.trim()).filter(Boolean)
    : Array.from({ length: Math.max(0, Math.min(500, r.to - r.from + 1)) }, (_, i) => `Roll no. ${r.from + i}`);

// Picks someone at random, cycling through faces first so the room sees it
// is fair. With "no repeats", everyone is called once before anyone twice.
const Picker = ({ onClose, pickNow }) => {
  const [roster, setRoster] = useState(readRoster);
  const [setup, setSetup] = useState(() => {
    try {
      return !localStorage.getItem(ROSTER_KEY);
    } catch {
      return true;
    }
  });
  const [shown, setShown] = useState(null);
  const [rolling, setRolling] = useState(false);
  const called = useRef(new Set());
  const timer = useRef(0);
  const pool = poolOf(roster);

  const save = (next) => {
    setRoster(next);
    called.current.clear();
    try {
      localStorage.setItem(ROSTER_KEY, JSON.stringify(next));
    } catch {
      /* roster lasts for this visit */
    }
  };

  const pick = useCallback(() => {
    if (!pool.length) return setSetup(true);
    let left = roster.noRepeat ? pool.filter((p) => !called.current.has(p)) : pool;
    if (!left.length) {
      called.current.clear();
      left = pool;
    }
    const winner = left[Math.floor(Math.random() * left.length)];
    called.current.add(winner);
    setSetup(false);
    setRolling(true);
    clearTimeout(timer.current);
    // Slow down like a wheel: short ticks, then longer ones.
    let n = 0;
    const tick = () => {
      n++;
      if (n >= 14) {
        setShown(winner);
        setRolling(false);
        return;
      }
      setShown(pool[Math.floor(Math.random() * pool.length)]);
      timer.current = setTimeout(tick, 40 + n * n * 2.4);
    };
    tick();
  }, [pool, roster.noRepeat]);

  useEffect(() => () => clearTimeout(timer.current), []);

  // K while open picks again.
  useEffect(() => {
    if (pickNow) pick();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickNow]);

  const left = roster.noRepeat ? pool.filter((p) => !called.current.has(p)).length : pool.length;

  return (
    <motion.div className="cr-help-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div
        className="cr-help cr-pick"
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="cr-help-eyebrow">pick a student</span>

        {setup ? (
          <div className="cr-pick-setup">
            <div className="cr-seg">
              {[["roll", "Roll numbers"], ["names", "Names"]].map(([id, label]) => (
                <button key={id} type="button" className={roster.mode === id ? "is-on" : ""} onClick={() => save({ ...roster, mode: id })}>
                  {label}
                </button>
              ))}
            </div>
            {roster.mode === "roll" ? (
              <div className="cr-pick-range">
                <label>
                  from <input type="number" min={0} value={roster.from} onChange={(e) => save({ ...roster, from: Number(e.target.value) || 0 })} />
                </label>
                <label>
                  to <input type="number" min={0} value={roster.to} onChange={(e) => save({ ...roster, to: Number(e.target.value) || 0 })} />
                </label>
              </div>
            ) : (
              <textarea rows={6} value={roster.names} onChange={(e) => save({ ...roster, names: e.target.value })} placeholder={"Paste the class list, one name per line\nAarav Sharma\nDiya Patel\n…"} />
            )}
            <label className="cr-pick-check">
              <input type="checkbox" checked={roster.noRepeat} onChange={(e) => save({ ...roster, noRepeat: e.target.checked })} /> Don't pick anyone twice until everyone has been picked
            </label>
            <p className="cr-pick-note">{pool.length} students · saved in this browser only</p>
          </div>
        ) : (
          <div className={`cr-pick-name ${rolling ? "is-rolling" : "is-done"}`} aria-live="polite">
            {shown ?? "Ready"}
          </div>
        )}

        <div className="cr-pick-actions">
          <button type="button" className="cq-btn" onClick={pick} disabled={rolling || !pool.length}>
            {shown ? "Pick again" : "Pick"} <kbd>K</kbd>
          </button>
          <button type="button" className="tp-ghost tp-small" onClick={() => setSetup((v) => !v)}>
            {setup ? "Done" : "Class list"}
          </button>
          {!setup && roster.noRepeat && <span className="cr-pick-note">{left} not yet picked</span>}
        </div>
      </motion.div>
    </motion.div>
  );
};

const Classroom = () => {
  const { pathname } = useLocation();
  // Survive moving between visualizers while the projector is in fullscreen.
  const [presenting, setPresenting] = useState(() => !!document.fullscreenElement);
  const [tool, setTool] = useState(null);
  const [color, setColor] = useState(INKS[0]);
  const [help, setHelp] = useState(false);
  const [board, setBoard] = useState(false);
  const [picker, setPicker] = useState(0); // 0 closed; otherwise a counter that asks for a pick
  const { theme, toggle: toggleTheme } = useTheme();
  const [idle, setIdle] = useState(false);
  const [hint, setHint] = useState(false);
  const { canvasRef, handlers, clear, undo, swap } = useInk(tool, color);
  const otherInk = useRef([]);

  usePresent(presenting);

  const togglePresent = useCallback(() => {
    setPresenting((on) => {
      const next = !on;
      try {
        if (next && !document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
        if (!next && document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
      } catch {
        /* fullscreen is optional */
      }
      return next;
    });
  }, []);

  // The whiteboard covers the page and keeps its own ink; the pen comes up with it.
  const toggleBoard = useCallback(() => {
    otherInk.current = swap(otherInk.current);
    setBoard((b) => {
      if (!b) setTool("pen");
      else setTool(null);
      return !b;
    });
  }, [swap]);

  // Leaving fullscreen with the browser's own Esc also leaves present mode.
  useEffect(() => {
    const onChange = () => {
      if (!document.fullscreenElement) setPresenting(false);
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // A new page starts clean.
  useEffect(() => {
    clear();
    otherInk.current = [];
    setBoard(false);
    setTool(null);
  }, [pathname, clear]);

  useEffect(() => {
    let seen = true;
    try {
      seen = !!localStorage.getItem(HINT_KEY);
    } catch {
      /* storage blocked */
    }
    if (seen) return;
    const show = setTimeout(() => setHint(true), 1800);
    const hide = setTimeout(() => setHint(false), 9000);
    try {
      localStorage.setItem(HINT_KEY, "1");
    } catch {
      /* storage blocked */
    }
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []);

  // In present mode the dock fades out when the mouse rests.
  useEffect(() => {
    if (!presenting) {
      setIdle(false);
      return;
    }
    let timer = setTimeout(() => setIdle(true), 2500);
    const wake = () => {
      setIdle(false);
      clearTimeout(timer);
      timer = setTimeout(() => setIdle(true), 2500);
    };
    window.addEventListener("pointermove", wake);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("pointermove", wake);
    };
  }, [presenting]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.("input, textarea, select, [contenteditable]") || e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key;
      let handled = true;

      if (k === "f" || k === "F") togglePresent();
      else if (k === "t" || k === "T") toggleTheme();
      else if (k === "p" || k === "P") setTool((t) => (t === "pen" ? null : "pen"));
      else if (k === "l" || k === "L") setTool((t) => (t === "laser" ? null : "laser"));
      else if (k === "w" || k === "W") toggleBoard();
      else if (k === "k" || k === "K") setPicker((n) => (n > 0 ? n + 1 : 1));
      else if (k === "c" || k === "C") clear();
      else if (k === "z" || k === "Z") undo();
      else if (k >= "1" && k <= "4") {
        setColor(INKS[Number(k) - 1]);
        setTool("pen");
      } else if (k === "?") setHelp((h) => !h);
      else if (k === "Escape") {
        if (picker) setPicker(0);
        else if (help) setHelp(false);
        else if (board) toggleBoard();
        else if (tool) setTool(null);
        else if (presenting) togglePresent();
        else handled = false;
      } else handled = false;

      if (handled) e.preventDefault();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePresent, toggleBoard, clear, undo, help, tool, board, picker, presenting, toggleTheme]);

  useEffect(() => {
    document.body.classList.toggle("is-lasering", tool === "laser");
    return () => document.body.classList.remove("is-lasering");
  }, [tool]);

  return (
    <>
      <AnimatePresence>
        {board && (
          <motion.div className="cr-board" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <span className="cr-board-label">whiteboard · W to return to the lesson</span>
          </motion.div>
        )}
      </AnimatePresence>

      <canvas ref={canvasRef} className={`cr-canvas ${tool === "pen" ? "cr-canvas-pen" : ""} ${board ? "cr-canvas-board" : ""}`} {...handlers} />

      <div className={`cr-dock ${idle ? "cr-dock-idle" : ""}`} role="toolbar" aria-label="Classroom tools">
        <span className="cr-dock-label">classroom</span>

        <DockButton label={presenting ? "Exit present" : "Present"} keyHint="F" active={presenting} onClick={togglePresent}>
          {presenting ? <ExitIcon /> : <PresentIcon />}
        </DockButton>

        <DockButton label="Pen" keyHint="P" active={tool === "pen"} onClick={() => setTool((t) => (t === "pen" ? null : "pen"))}>
          <PenIcon />
        </DockButton>

        <AnimatePresence initial={false}>
          {tool === "pen" && (
            <motion.div
              className="cr-inks"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
            >
              {INKS.map((ink, i) => (
                <button
                  key={ink}
                  type="button"
                  className={`cr-ink ${color === ink ? "cr-ink-active" : ""}`}
                  style={{ "--swatch": ink }}
                  onClick={() => setColor(ink)}
                  aria-label={`Ink ${i + 1}`}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <DockButton label="Laser" keyHint="L" active={tool === "laser"} onClick={() => setTool((t) => (t === "laser" ? null : "laser"))}>
          <LaserIcon />
        </DockButton>

        <DockButton label="Whiteboard" keyHint="W" active={board} onClick={toggleBoard}>
          <BoardIcon />
        </DockButton>

        <DockButton label="Clear ink" keyHint="C" onClick={clear}>
          <ClearIcon />
        </DockButton>

        <DockButton label="Pick a student" keyHint="K" active={!!picker} onClick={() => setPicker((n) => (n ? 0 : -1))}>
          <PickIcon />
        </DockButton>

        <DockButton label={theme === "dark" ? "Light theme" : "Dark theme"} keyHint="T" onClick={toggleTheme}>
          <SunIcon />
        </DockButton>

        <span className="cr-sep" />

        <DockButton label="Shortcuts" keyHint="?" active={help} onClick={() => setHelp((h) => !h)}>
          <KeysIcon />
        </DockButton>

        <AnimatePresence>
          {hint && (
            <motion.div
              className="cr-hint"
              style={{ x: "-50%" }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              onClick={() => setHint(false)}
            >
              Teaching with this? Press <kbd>F</kbd> to present and <kbd>Space</kbd> to play.
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>{picker !== 0 && <Picker key="picker" pickNow={picker > 0 ? picker : 0} onClose={() => setPicker(0)} />}</AnimatePresence>

      <AnimatePresence>
        {help && (
          <motion.div className="cr-help-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setHelp(false)}>
            <motion.div
              className="cr-help"
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <span className="cr-help-eyebrow">classroom mode</span>
              <h2>Teach from the keyboard</h2>
              <p>Put the lesson on the projector, then drive it without touching the mouse. A presentation clicker works too.</p>

              <ul>
                {SHORTCUTS.map(([key, what]) => (
                  <li key={key}>
                    <kbd>{key}</kbd>
                    <span>{what}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Classroom;
