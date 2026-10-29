import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { noteBySlug } from "../Notes/content";
import "./Teach.css";

// A quiz built for the projector: one big question, the class calls out an
// answer, the teacher reveals it. Space reveals, then moves on.

const SECONDS = 30;

const Timer = ({ running, onDone, resetKey }) => {
  const [left, setLeft] = useState(SECONDS);
  const reduced = useReducedMotion();

  useEffect(() => setLeft(SECONDS), [resetKey]);

  useEffect(() => {
    if (!running || left <= 0) return;
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [running, left]);

  useEffect(() => {
    if (left === 0) onDone();
  }, [left, onDone]);

  const r = 26;
  const c = 2 * Math.PI * r;

  return (
    <div className={`cq-timer ${left <= 5 ? "is-low" : ""}`} aria-label={`${left} seconds left`}>
      <svg viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} className="cq-timer-track" />
        <motion.circle
          cx="32"
          cy="32"
          r={r}
          className="cq-timer-ring"
          strokeDasharray={c}
          animate={{ strokeDashoffset: c * (1 - left / SECONDS) }}
          transition={{ duration: reduced ? 0 : 1, ease: "linear" }}
        />
      </svg>
      <b>{left}</b>
    </div>
  );
};

const Quiz = ({ note }) => {
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const item = note.quiz[qi];
  const last = qi === note.quiz.length - 1;

  const advance = () => {
    if (!revealed) setRevealed(true);
    else if (!last) {
      setQi((i) => i + 1);
      setPicked(null);
      setRevealed(false);
    }
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.("input, textarea") || e.metaKey || e.ctrlKey) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        e.stopImmediatePropagation();
        document.activeElement?.blur?.();
        advance();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  });

  return (
    <div className="cq" data-present-root>
      <div className="cq-head">
        <span className="cq-eyebrow">
          class quiz · {note.group} · {note.title}
        </span>
        <span className="cq-progress">
          question {qi + 1} of {note.quiz.length}
        </span>
        <Timer running={!revealed} resetKey={qi} onDone={() => setRevealed(true)} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={qi}
          initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -20, filter: "blur(6px)" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="cq-q">{item.q}</h1>

          <div className="cq-options">
            {item.options.map((opt, i) => {
              let state = "";
              if (revealed && i === item.answer) state = "is-right";
              else if (revealed && i === picked) state = "is-wrong";
              else if (revealed) state = "is-dim";
              else if (i === picked) state = "is-picked";

              return (
                <motion.button
                  key={opt}
                  type="button"
                  className={`cq-option ${state}`}
                  onClick={() => !revealed && setPicked(i)}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0, scale: state === "is-right" ? 1.03 : 1 }}
                  transition={{ duration: 0.4, delay: 0.15 + i * 0.07 }}
                >
                  <span className="cq-letter">{String.fromCharCode(65 + i)}</span>
                  <span>{opt}</span>
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence>
            {revealed && (
              <motion.p className="cq-why" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <b>Answer {String.fromCharCode(65 + item.answer)}.</b> {item.why}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      <div className="cq-foot">
        <button type="button" className="cq-btn" onClick={advance} disabled={revealed && last}>
          {!revealed ? "Reveal answer" : last ? "Quiz complete" : "Next question →"}
          <kbd>Space</kbd>
        </button>
        <Link to={`/notes/${note.slug}`} className="cq-link">
          Revise the note →
        </Link>
      </div>
    </div>
  );
};

const ClassQuiz = () => {
  const { slug } = useParams();
  const note = noteBySlug(slug);
  if (!note) return <Navigate to="/classroom" replace />;
  return (
    <div className="cq-page">
      <Quiz key={slug} note={note} />
    </div>
  );
};

export default ClassQuiz;
