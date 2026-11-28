import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { KIND, decodeLesson, describe, encodeLesson, formatMinutes, minutesOf, pathOf, readLesson, sameLesson, totalMinutes, writeLesson } from "./lesson";
import "./Teach.css";

// Title slide for a lesson link. Opening it makes the lesson active for this
// tab, so the lesson bar follows the teacher through every item. When the
// teacher opened it from their library, the active copy already holds their
// speaker notes, so it is kept rather than replaced by the link's copy.

const COUNT_LABEL = { v: ["visualizer", "visualizers"], n: ["note", "notes"], q: ["question set", "question sets"] };

const LessonCover = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const fromLink = useMemo(() => decodeLesson(search), [search]);
  const lesson = useMemo(() => {
    const active = readLesson();
    return sameLesson(active, fromLink) ? active : fromLink;
  }, [fromLink]);
  const empty = !lesson.items.length;
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}${encodeLesson(lesson)}`;
  const hasNotes = lesson.items.some((it) => it.note);

  useEffect(() => {
    // Coming back to the cover mid-lecture keeps the clock running.
    if (!empty && !sameLesson(readLesson(), lesson)) writeLesson({ ...lesson, startedAt: null });
  }, [lesson, empty]);

  const start = () => {
    if (empty) return;
    writeLesson({ ...lesson, startedAt: readLesson()?.startedAt ?? Date.now() });
    navigate(pathOf(lesson.items[0], 0));
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.("input, textarea")) return;
      if (["PageDown", "ArrowRight", "Enter", "n", "N"].includes(e.key)) {
        e.preventDefault();
        start();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (empty) {
    return (
      <div className="lc">
        <div className="lc-inner">
          <h1 className="lc-title">This lesson link is empty.</h1>
          <Link to="/classroom" className="cq-btn">
            Build a lesson →
          </Link>
        </div>
      </div>
    );
  }

  const counts = lesson.items.reduce((acc, it) => {
    const k = it.type === "c" ? "q" : it.type;
    return { ...acc, [k]: (acc[k] ?? 0) + 1 };
  }, {});

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      window.prompt("Copy this lesson link:", link);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="lc">
      <div className="lc-glow" aria-hidden="true" />
      <div className="lc-inner" data-present-root>
        <motion.span className="lc-eyebrow" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }}>
          today's lecture
        </motion.span>

        <motion.h1
          className="lc-title"
          initial={reduced ? false : { opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {lesson.title}
        </motion.h1>

        <motion.p className="lc-meta" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          {[
            ...Object.entries(counts).map(([type, count]) => `${count} ${COUNT_LABEL[type][count > 1 ? 1 : 0]}`),
            `about ${formatMinutes(totalMinutes(lesson.items))}`,
          ].join(" · ")}
        </motion.p>

        <ol className="lc-list">
          {lesson.items.map((item, i) => {
            const info = describe(item);
            return (
              <motion.li
                key={`${i}-${item.type}`}
                initial={reduced ? false : { opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: 0.35 + Math.min(i, 12) * 0.04, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link to={pathOf(item, i)}>
                  <span className="lc-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className={`lc-kind tone-text tone-${KIND[item.type].tone}`}>{KIND[item.type].label}</span>
                  <span className="lc-name">{info.title}</span>
                  <span className="lc-group">
                    {item.type === "c" ? "" : `${info.group} · `}
                    {Math.round(minutesOf(item))} min
                  </span>
                </Link>
              </motion.li>
            );
          })}
        </ol>

        <div className="lc-actions">
          <button type="button" className="cq-btn" onClick={start}>
            Start lesson →
          </button>
          <span className="lc-hint">
            <kbd>PageDown</kbd> or a clicker advances · <kbd>F</kbd> fullscreen{hasNotes ? <> · <kbd>S</kbd> your speaker notes</> : null}
          </span>
        </div>

        <div className="lc-share">
          <div>
            <span className="lc-share-label">students follow along at</span>
            <code className="lc-share-link">{link.replace(/^https?:\/\//, "")}</code>
          </div>
          <button type="button" className="tp-ghost tp-small" onClick={copy}>
            {copied ? "✓ Copied" : "Copy link"}
          </button>
          <a className="tp-ghost tp-small" href={encodeLesson(lesson, "/handout")} target="_blank" rel="noreferrer">
            Print handout
          </a>
        </div>
      </div>
    </div>
  );
};

export default LessonCover;
