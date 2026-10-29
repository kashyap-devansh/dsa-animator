import { useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { KIND, decodeLesson, describe, pathOf, writeLesson } from "./lesson";
import "./Teach.css";

// Title slide for a shared lesson link. Opening it makes the lesson active
// for this tab, so the lesson bar follows the teacher through every item.

const LessonCover = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const lesson = useMemo(() => decodeLesson(search), [search]);
  const empty = !lesson.items.length;

  useEffect(() => {
    if (!empty) writeLesson(lesson);
  }, [lesson, empty]);

  const start = () => !empty && navigate(pathOf(lesson.items[0]));

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

  const counts = lesson.items.reduce((acc, it) => ({ ...acc, [it.type]: (acc[it.type] ?? 0) + 1 }), {});

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
          {Object.entries(counts)
            .map(([type, count]) => `${count} ${KIND[type].label.toLowerCase()}${count > 1 && type !== "n" ? "s" : ""}`)
            .join(" · ")}
        </motion.p>

        <ol className="lc-list">
          {lesson.items.map((item, i) => {
            const info = describe(item);
            return (
              <motion.li
                key={`${item.type}-${item.ref}-${i}`}
                initial={reduced ? false : { opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: 0.35 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link to={pathOf(item)}>
                  <span className="lc-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className={`lc-kind tone-text tone-${KIND[item.type].tone}`}>{KIND[item.type].label}</span>
                  <span className="lc-name">{info.title}</span>
                  <span className="lc-group">{info.group}</span>
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
            Advance with <kbd>PageDown</kbd> or a presentation clicker · <kbd>F</kbd> for fullscreen
          </span>
        </div>
      </div>
    </div>
  );
};

export default LessonCover;
