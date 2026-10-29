import { useEffect, useMemo, useSyncExternalStore } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { KIND, LESSON_EVENT, describe, encodeLesson, pathOf, readLesson, writeLesson } from "./lesson";

// Floating "lesson in progress" bar. Shows wherever the current page is one
// of the lesson's items; PageDown / PageUp (what presentation clickers send)
// and N / B move through the lesson.

const subscribe = (cb) => {
  window.addEventListener(LESSON_EVENT, cb);
  return () => window.removeEventListener(LESSON_EVENT, cb);
};
const snapshot = () => JSON.stringify(readLesson());

function useActiveLesson() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => "null");
  return useMemo(() => JSON.parse(raw), [raw]);
}

const LessonBar = () => {
  const lesson = useActiveLesson();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const index = lesson ? lesson.items.findIndex((item) => pathOf(item) === pathname) : -1;
  const active = index >= 0;
  const total = lesson?.items.length ?? 0;

  const goTo = (i) => {
    if (!lesson) return;
    if (i < 0) navigate(encodeLesson(lesson));
    else if (i < total) navigate(pathOf(lesson.items[i]));
  };

  useEffect(() => {
    document.body.classList.toggle("in-lesson", active);
    return () => document.body.classList.remove("in-lesson");
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e) => {
      if (e.target.closest?.("input, textarea, select") || e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key;
      if (k === "PageDown" || k === "n" || k === "N") {
        e.preventDefault();
        if (index + 1 < total) navigate(pathOf(lesson.items[index + 1]));
      } else if (k === "PageUp" || k === "b" || k === "B") {
        e.preventDefault();
        if (index > 0) navigate(pathOf(lesson.items[index - 1]));
        else navigate(encodeLesson(lesson));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, index, total, lesson, navigate]);

  if (!active) return null;

  const item = lesson.items[index];
  const info = describe(item);

  return (
    <motion.div className="lb" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
      <button type="button" className="lb-btn" onClick={() => goTo(index - 1)} aria-label="Previous item">
        ←
      </button>

      <div className="lb-info">
        <span className="lb-lesson">{lesson.title}</span>
        <span className="lb-item">
          <i className={`tone-text tone-${KIND[item.type].tone}`}>{KIND[item.type].label}</i> {info?.title}
        </span>
      </div>

      <div className="lb-dots" aria-hidden="true">
        {lesson.items.map((it, i) => (
          <span key={i} className={i === index ? "is-current" : i < index ? "is-done" : ""} />
        ))}
      </div>

      <span className="lb-count">
        {index + 1} / {total}
      </span>

      <button type="button" className="lb-btn lb-next" onClick={() => goTo(index + 1)} disabled={index + 1 >= total} aria-label="Next item">
        →
      </button>

      <button
        type="button"
        className="lb-end"
        onClick={() => {
          writeLesson(null);
          navigate("/classroom");
        }}
        aria-label="End lesson"
        title="End lesson"
      >
        ×
      </button>
    </motion.div>
  );
};

export default LessonBar;
