import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { KIND, LESSON_EVENT, describe, encodeLesson, minutesOf, pathOf, readLesson, totalMinutes, writeLesson } from "./lesson";

// "Lesson in progress" bar. Sits in the top bar wherever the current page is
// one of the lesson's items. PageDown / PageUp (what presentation clickers
// send) and N / B move through the lesson; S shows the speaker notes and
// the lecture clock (elapsed against the plan).

const subscribe = (cb) => {
  window.addEventListener(LESSON_EVENT, cb);
  return () => window.removeEventListener(LESSON_EVENT, cb);
};
const snapshot = () => JSON.stringify(readLesson());

export function useActiveLesson() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => "null");
  return useMemo(() => JSON.parse(raw), [raw]);
}

const clock = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const pad = (n) => String(n).padStart(2, "0");
  return h ? `${h}:${pad(m)}:${pad(s % 60)}` : `${m}:${pad(s % 60)}`;
};

function useNow(active) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [active]);
  return now;
}

const LessonBar = () => {
  const lesson = useActiveLesson();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [notesOpen, setNotesOpen] = useState(false);

  const index = lesson ? lesson.items.findIndex((item, i) => pathOf(item, i) === pathname) : -1;
  const active = index >= 0;
  const total = lesson?.items.length ?? 0;
  const now = useNow(active && !!lesson?.startedAt);

  const goTo = (i) => {
    if (!lesson) return;
    if (i < 0) navigate(encodeLesson(lesson));
    else if (i < total) navigate(pathOf(lesson.items[i], i));
  };

  useEffect(() => {
    document.body.classList.toggle("in-lesson", active);
    return () => document.body.classList.remove("in-lesson");
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e) => {
      if (e.target.closest?.("input, textarea, select, [contenteditable]") || e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key;
      if (k === "PageDown" || k === "n" || k === "N") {
        e.preventDefault();
        if (index + 1 < total) navigate(pathOf(lesson.items[index + 1], index + 1));
      } else if (k === "PageUp" || k === "b" || k === "B") {
        e.preventDefault();
        if (index > 0) navigate(pathOf(lesson.items[index - 1], index - 1));
        else navigate(encodeLesson(lesson));
      } else if (k === "s" || k === "S") {
        e.preventDefault();
        setNotesOpen((o) => !o);
      } else if (k === "Escape" && notesOpen) {
        setNotesOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, index, total, lesson, navigate, notesOpen]);

  if (!active) return null;

  const item = lesson.items[index];
  const info = describe(item);
  const next = lesson.items[index + 1];
  const planned = totalMinutes(lesson.items);
  const elapsed = lesson.startedAt ? now - lesson.startedAt : 0;
  // Where the plan says we should be by now, against where we are.
  const plannedSoFar = lesson.items.slice(0, index).reduce((s, it) => s + minutesOf(it), 0) * 60000;
  const behind = lesson.startedAt && elapsed - plannedSoFar > 3 * 60000;
  const over = lesson.startedAt && elapsed > planned * 60000;

  return (
    <>
      <motion.div className="lb" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
        <button type="button" className="lb-btn" onClick={() => goTo(index - 1)} aria-label="Previous item">
          ←
        </button>

        <div className="lb-info">
          <span className="lb-lesson">{lesson.title}</span>
          <span className="lb-item">
            <i className={`tone-text tone-${KIND[item.type].tone}`}>{KIND[item.type].label}</i> {info?.title}
          </span>
        </div>

        <span className="lb-count">
          {index + 1} / {total}
        </span>

        <button
          type="button"
          className={`lb-clock ${over ? "is-over" : behind ? "is-behind" : ""} ${notesOpen ? "is-open" : ""}`}
          onClick={() => setNotesOpen((o) => !o)}
          title="Speaker notes and timing (S)"
          aria-expanded={notesOpen}
        >
          {lesson.startedAt ? clock(elapsed) : "0:00"}
          <small>/ {planned}m</small>
          {item.note && <span className="lb-note-dot" aria-label="This item has notes" />}
        </button>

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

      <AnimatePresence>
        {notesOpen && (
          <motion.aside
            className="lb-notes"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            aria-label="Speaker notes"
          >
            <div className="lb-notes-head">
              <span>speaker notes · item {index + 1}</span>
              <span>planned {Math.round(minutesOf(item))} min</span>
            </div>
            <p className={item.note ? "" : "lb-notes-empty"}>{item.note || "No notes for this item. Add them in Teach → Edit, under the item."}</p>
            <div className="lb-notes-foot">
              {lesson.startedAt ? (
                <span>
                  {clock(elapsed)} in · plan had you here at {clock(plannedSoFar)}
                  {behind ? " · running behind" : ""}
                </span>
              ) : (
                <span>The clock starts when you press Start on the lesson cover.</span>
              )}
              {next && <span>Next: {describe(next)?.title}</span>}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default LessonBar;
