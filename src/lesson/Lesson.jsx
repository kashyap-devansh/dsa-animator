import { useEffect, useLayoutEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Lightbulb, ListOrdered, Play, Pause, RotateCcw, Shuffle, CircleCheck } from "lucide-react";
import { findLesson } from "../course/course";
import { useProgress } from "../course/store";
import { highlight } from "../Playground/shared/highlight";
import StageGrid from "./StageGrid";
import "./Lesson.css";

// The lesson page. Centre: title, the diagram, and a timeline of every step.
// Right: what the current step means, the code with its line lit, and live
// counters. Visualizers supply the pieces; this owns layout and keyboard.
//
// steps      the full step list (only its length and labels are read here)
// playback   the object returned by usePlayback(steps.length)
// stage      the diagram for the current step
// narration  { tag, title, body, notice, noticeLabel }
// code       { lines, active, file, lang }   lines are strings or nodes
// panels     [{ title, rows: [{ label, value, tone, hint }] }]
// controls   extra inputs shown in the stage toolbar
// complexity [{ label, value }]
// legend     accepted for older callers; not drawn (the narration explains colours)

const SPEEDS = [
  { v: 3, label: "0.5×" },
  { v: 5, label: "1×" },
  { v: 7, label: "2×" },
  { v: 9, label: "4×" },
];

const Lesson = ({
  steps,
  playback,
  stage,
  narration = {},
  code,
  panels = [],
  controls,
  onShuffle,
  shuffleLabel = "New input",
  timeline = (s) => s.description,
  complexity = [],

  title: titleOverride,
}) => {
  const { pathname } = useLocation();
  const info = findLesson(pathname);
  const { mark } = useProgress();
  const { index, setIndex, playing, togglePlay, reset, speed, setSpeed } = playback;
  const total = steps.length;
  const last = playback.canForward !== undefined ? !playback.canForward : index >= total - 1;
  const title = titleOverride ?? info?.lesson.title ?? "";

  const go = (i) => playback.setIndex?.(Math.max(0, Math.min(total - 1, i)));
  const back = () => (playback.canBack ?? index > 0) && playback.stepBack();
  const forward = () => (playback.canForward ?? !last) && playback.stepForward();

  // Finishing the last step completes the lesson.
  useEffect(() => {
    if (last && total > 1 && info) mark(info.lesson.path);
  }, [last, total, info, mark]);

  // Arrow keys step, space plays; ignored while typing.
  const keys = useRef();
  keys.current = { back, forward, togglePlay, reset };
  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || e.target.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        keys.current.forward();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        keys.current.back();
      } else if (e.key === " ") {
        e.preventDefault();
        e.target.blur?.();
        keys.current.togglePlay();
      } else if (e.key === "r" || e.key === "R") {
        keys.current.reset();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Every panel's rows, flattened into one compact block of live values.
  const stats = panels.filter(Boolean).flatMap((p) => p.rows).slice(0, 6);

  const nextLabel = !last && steps[index + 1] ? timeline(steps[index + 1], index + 1) : !last ? "next operation" : null;

  return (
    <div className="lx">
      <section className="lx-center">
        <header className="lx-head">
          <h1 className="lx-title">{title}</h1>

          {info && (
            <div className="lx-badge">
              <div className="lx-badge-text">
                <div className="lx-badge-row">
                  <span className="lx-badge-num">{info.module.number}</span>
                  <span className="lx-badge-mod">{info.module.title}</span>
                </div>
                <span className="lx-badge-of">
                  Lesson {info.lesson.index + 1} of {info.module.lessons.length}
                </span>
              </div>
              <Thumb />
            </div>
          )}
        </header>

        <div className="lx-stage">
          <StageGrid />

          <div className="lx-scene">{stage}</div>

          {/* Controls and live values share one bar along the bottom. */}
          <div className="lx-stage-bar">
            <div className="lx-toolbar">
              <button className="lx-tool lx-tool-play" onClick={togglePlay} aria-label={playing ? "Pause" : "Play"}>
                {playing ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
                <span>{playing ? "Pause" : last ? "Replay" : "Play"}</span>
              </button>

              <button
                className="lx-tool lx-tool-speed"
                onClick={() => setSpeed(SPEEDS[(SPEEDS.findIndex((sp) => sp.v === speed) + 1) % SPEEDS.length].v)}
                title="Playback speed"
              >
                {(SPEEDS.find((sp) => sp.v === speed) ?? SPEEDS[1]).label}
              </button>

              <button className="lx-tool lx-tool-icon" onClick={reset} aria-label="Back to the first step" title="Back to the first step (R)">
                <RotateCcw size={14} />
              </button>

              {onShuffle && (
                <button className="lx-tool lx-tool-icon" onClick={onShuffle} title={shuffleLabel} aria-label={shuffleLabel}>
                  <Shuffle size={14} />
                </button>
              )}

              {controls}
            </div>
          {stats.length > 0 && (
            <dl className="lx-stats">
              {stats.map((r) => (
                <div key={r.label} className={r.tone === "coral" ? "lx-stat-on" : ""}>
                  <dt>{r.label}</dt>
                  <dd>{statText(r.value)}</dd>
                </div>
              ))}
            </dl>
          )}
          </div>
        </div>

        <Timeline
          steps={steps}
          index={index}
          total={total}
          label={timeline}
          onPick={setIndex ? go : null}
          back={back}
          forward={forward}
        />
      </section>

      <aside className="lx-side">
        <div className="lx-narr ui-card">
          <div className="lx-narr-top">
            <span className="ui-eyebrow">
              Step {index + 1} / {total}
            </span>
            {narration.tag && <span className="ui-tag">{narration.tag}</span>}
          </div>

          <h2 className="lx-narr-title">{narration.title}</h2>
          {narration.body && <div className="lx-narr-body">{narration.body}</div>}

          {narration.notice && (
            <div className="lx-notice">
              <span className="lx-notice-icon">
                <Lightbulb size={15} />
              </span>
              <div>
                <span className="lx-notice-label">{narration.noticeLabel ?? "Notice"}</span>
                <p>{narration.notice}</p>
              </div>
            </div>
          )}

          <div className="lx-narr-nav">
            <button className="ui-btn" onClick={back} disabled={index === 0}>
              <ArrowLeft size={16} /> Back
            </button>

            {!last ? (
              <button className="ui-btn ui-btn-primary lx-next" onClick={forward}>
                <span className="lx-next-text">Next{nextLabel ? `: ${nextLabel}` : ""}</span>
                <ArrowRight size={16} />
              </button>
            ) : info?.next ? (
              <Link className="ui-btn ui-btn-primary lx-next" to={info.next.path}>
                <span className="lx-next-text">Next lesson: {info.next.title}</span>
                <ArrowRight size={16} />
              </Link>
            ) : (
              <span className="lx-finished">
                <CircleCheck size={17} /> Lesson complete
              </span>
            )}
          </div>
        </div>

        {code && <CodePanel {...code} costs={complexity} />}

      </aside>
    </div>
  );
};

const statText = (v) => {
  if (Array.isArray(v)) return v.length ? v.join(", ") : "–";
  if (v === null || v === undefined || v === "" || v === -1) return "–";
  return v;
};

// The small isometric stack beside the module badge.
const Thumb = () => (
  <svg className="lx-thumb" width="66" height="50" viewBox="0 0 66 50" aria-hidden="true">
    <g strokeLinejoin="round" strokeWidth="1.2">
      {[0, 1, 2, 3, 4].map((i) => {
        const x = 6 + i * 10;
        const y = 34 - i * 6;
        const h = 6 + i * 3;
        return (
          <g key={i}>
            <path d={`M${x} ${y} l9 -5 l9 5 l-9 5Z`} className="lx-thumb-top" transform={`translate(0 ${-h})`} />
            <path d={`M${x} ${y - h} v${h} l9 5 v${-h}Z`} className="lx-thumb-left" />
            <path d={`M${x + 18} ${y - h} v${h} l-9 5 v${-h}Z`} className="lx-thumb-right" />
          </g>
        );
      })}
    </g>
  </svg>
);


const Timeline = ({ steps, index, total, label, onPick, back, forward }) => {
  const track = useRef(null);

  // Keep the current step centred in the strip.
  useLayoutEffect(() => {
    const el = track.current?.querySelector(".lx-tl-on");
    if (!el || !track.current) return;
    const t = track.current;
    const left = el.offsetLeft - t.clientWidth / 2 + el.clientWidth / 2;
    t.scrollTo({ left, behavior: "smooth" });
  }, [index]);

  return (
    <div className="lx-tl ui-card">
      <div className="lx-tl-head">
        <span className="ui-eyebrow">In this lesson</span>
        <span className="lx-tl-hint">
          <span className="ui-kbd">←</span>
          <span className="ui-kbd">→</span> to step
          <b>
            Step {index + 1} of {total}
          </b>
        </span>
      </div>

      <div className="lx-tl-body">
        <button className="lx-tl-arrow" onClick={back} disabled={index === 0} aria-label="Previous step">
          <ChevronLeft size={16} />
        </button>

        <div className="lx-tl-track" ref={track}>
          {steps.map((s, i) => (
            <button
              key={i}
              className={`lx-tl-step ${i === index ? "lx-tl-on" : ""} ${i < index ? "lx-tl-past" : ""}`}
              onClick={onPick ? () => onPick(i) : undefined}
              disabled={!onPick}
              tabIndex={-1}
            >
              <span className="lx-tl-dot">{i + 1}</span>
              <span className="lx-tl-label">{label(s, i)}</span>
            </button>
          ))}
        </div>

        <button className="lx-tl-arrow" onClick={forward} disabled={index >= total - 1} aria-label="Next step">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

// `file` is accepted for callers but not shown; the header holds the costs.
const CodePanel = ({ lines, active, plain = false, costs = [] }) => {
  const box = useRef(null);

  // Scroll the lit line into view inside the panel only.
  useLayoutEffect(() => {
    const el = box.current?.querySelector(".lx-code-on");
    if (!el || !box.current) return;
    const b = box.current;
    const top = el.offsetTop - b.clientHeight / 2 + el.clientHeight / 2;
    b.scrollTo({ top, behavior: "smooth" });
  }, [active]);

  return (
    <div className="lx-code ui-card">
      <div className="lx-code-head">
        <ListOrdered size={18} className="lx-code-icon" />
        <h3>Code</h3>
        {costs.length > 0 && (
          <span className="lx-code-costs">
            {costs.slice(0, 2).map((c) => (
              <span key={c.label}>
                {c.label.replace(/\s*\(.*\)/, "")} <b>{c.value}</b>
              </span>
            ))}
          </span>
        )}
      </div>
      <pre className="lx-code-body" ref={box}>
        {lines.map((line, i) => (
          <div key={i} className={`lx-code-line ${active === i + 1 ? "lx-code-on" : ""}`}>
            <span className="lx-code-no">{i + 1}</span>
            <span className="lx-code-src">{typeof line === "string" && !plain ? highlight(line) : line}</span>
          </div>
        ))}
      </pre>
    </div>
  );
};

export default Lesson;
