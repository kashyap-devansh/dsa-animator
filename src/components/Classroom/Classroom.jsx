import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import "./Classroom.css";

// Classroom toolkit: present mode (fullscreen, chrome hidden, stage scaled to
// fit the projector), an annotation pen, a laser pointer and keyboard control
// of whichever visualizer is on screen.

const INKS = ["#ff6a3d", "#b4ff39", "#7c8cff", "#f3f2ed"];
const PRESENT_WIDTH = 1100;
const HINT_KEY = "classroomHintSeen";

const SHORTCUTS = [
  ["Space", "Play / pause"],
  ["→", "Step forward"],
  ["←", "Step back"],
  ["R", "Reset"],
  ["F", "Present mode"],
  ["P", "Pen"],
  ["L", "Laser pointer"],
  ["1 – 4", "Pen colour"],
  ["C", "Clear drawings"],
  ["Esc", "Exit tool / present"],
  ["?", "This panel"],
];

// Every visualizer renders its playback row as [reset, back, play, forward, …].
// Find it by the play button so the older hand-built pages work too.
function findControls() {
  const play = document.querySelector('.page-main [class*="-play-btn"]');
  if (!play) return null;
  const row = [...play.parentElement.children].filter((el) => el.tagName === "BUTTON");
  const i = row.indexOf(play);
  return { play, back: row[i - 1], forward: row[i + 1], reset: i >= 2 ? row[0] : null };
}

function presentRoot() {
  return document.querySelector(".page-main [data-present-root]") ?? findControls()?.play.parentElement.parentElement ?? null;
}

const press = (btn) => {
  if (!btn || btn.disabled) return false;
  btn.click();
  return true;
};

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

  return { canvasRef, handlers, clear, undo };
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

const Classroom = () => {
  const { pathname } = useLocation();
  // Survive moving between visualizers while the projector is in fullscreen.
  const [presenting, setPresenting] = useState(() => !!document.fullscreenElement);
  const [tool, setTool] = useState(null);
  const [color, setColor] = useState(INKS[0]);
  const [help, setHelp] = useState(false);
  const [idle, setIdle] = useState(false);
  const [hint, setHint] = useState(false);
  const { canvasRef, handlers, clear, undo } = useInk(tool, color);

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
      const controls = findControls();
      let handled = true;

      if (k === " " && controls) press(controls.play);
      else if (k === "ArrowRight" && controls) press(controls.forward);
      else if (k === "ArrowLeft" && controls) press(controls.back);
      else if ((k === "r" || k === "R") && controls) press(controls.reset);
      else if (k === "f" || k === "F") togglePresent();
      else if (k === "p" || k === "P") setTool((t) => (t === "pen" ? null : "pen"));
      else if (k === "l" || k === "L") setTool((t) => (t === "laser" ? null : "laser"));
      else if (k === "c" || k === "C") clear();
      else if (k === "z" || k === "Z") undo();
      else if (k >= "1" && k <= "4") {
        setColor(INKS[Number(k) - 1]);
        setTool("pen");
      } else if (k === "?") setHelp((h) => !h);
      else if (k === "Escape") {
        if (help) setHelp(false);
        else if (tool) setTool(null);
        else if (presenting) togglePresent();
        else handled = false;
      } else handled = false;

      if (handled) {
        e.preventDefault();
        if (k === " ") document.activeElement?.blur?.();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePresent, clear, undo, help, tool, presenting]);

  useEffect(() => {
    document.body.classList.toggle("is-lasering", tool === "laser");
    return () => document.body.classList.remove("is-lasering");
  }, [tool]);

  return (
    <>
      <canvas ref={canvasRef} className={`cr-canvas ${tool === "pen" ? "cr-canvas-pen" : ""}`} {...handlers} />

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
                  style={{ "--ink": ink }}
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

        <DockButton label="Clear ink" keyHint="C" onClick={clear}>
          <ClearIcon />
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
              <p>Put the visualizer on the projector, then drive it without touching the mouse.</p>

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
