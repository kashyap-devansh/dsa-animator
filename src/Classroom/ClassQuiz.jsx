import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { noteBySlug } from "../Notes/content";
import { useActiveLesson } from "./LessonBar";
import "./Teach.css";

// A quiz built for the projector: one big question, the class answers, the
// teacher reveals. Optional hand count: tap + on each option as hands go up
// (or type the number), and the reveal shows how the room split. Space
// reveals, then moves on; the last screen sums up the session.

const TIMERS = [0, 20, 30, 60];
const TIMER_KEY = "quizSeconds";

const readTimer = () => {
  try {
    const v = Number(localStorage.getItem(TIMER_KEY));
    return TIMERS.includes(v) ? v : 30;
  } catch {
    return 30;
  }
};

const Timer = ({ seconds, running, onDone, resetKey }) => {
  const [left, setLeft] = useState(seconds);
  const reduced = useReducedMotion();

  useEffect(() => setLeft(seconds), [resetKey, seconds]);

  useEffect(() => {
    if (!running || left <= 0) return;
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [running, left]);

  useEffect(() => {
    if (left === 0 && running) onDone();
  }, [left, running, onDone]);

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
          animate={{ strokeDashoffset: c * (1 - left / seconds) }}
          transition={{ duration: reduced ? 0 : 1, ease: "linear" }}
        />
      </svg>
      <b>{left}</b>
    </div>
  );
};

const letter = (i) => String.fromCharCode(65 + i);

const Summary = ({ questions, results, onRestart, revise }) => {
  const asked = results.filter(Boolean);
  const counted = asked.filter((r) => r.total > 0);
  const avg = counted.length ? Math.round((counted.reduce((s, r) => s + r.right / r.total, 0) / counted.length) * 100) : null;

  return (
    <motion.div className="cq-summary" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <span className="cq-eyebrow">quiz complete</span>
      <h1 className="cq-q">{avg === null ? `${questions.length} question${questions.length > 1 ? "s" : ""} done.` : `The room got ${avg}% right.`}</h1>
      {counted.length > 0 ? (
        <ol className="cq-results">
          {questions.map((q, i) => {
            const r = results[i];
            const pct = r?.total ? Math.round((r.right / r.total) * 100) : null;
            return (
              <li key={i} className={pct !== null && pct < 50 ? "is-weak" : ""}>
                <span className="cq-results-q">{q.q}</span>
                <span className="cq-results-bar">
                  <i style={{ width: `${pct ?? 0}%` }} />
                </span>
                <b>{pct === null ? "–" : `${pct}%`}</b>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="cq-why">Tip: switch on “Count hands” next time to see how the room split on each question.</p>
      )}
      {counted.some((r) => r.right / r.total < 0.5) && <p className="cq-why">Questions under 50% are worth going over again before moving on.</p>}
      <div className="cq-foot">
        <button type="button" className="cq-btn" onClick={onRestart}>
          Run it again
        </button>
        {revise}
      </div>
    </motion.div>
  );
};

const Quiz = ({ title, group, questions, revise }) => {
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [seconds, setSeconds] = useState(readTimer);
  const [counting, setCounting] = useState(false);
  const [tally, setTally] = useState(() => questions.map((q) => q.options.map(() => 0)));
  const [results, setResults] = useState([]);
  const [done, setDone] = useState(false);
  const item = questions[qi];
  const last = qi === questions.length - 1;
  const counts = tally[qi];
  const handsUp = counts.reduce((a, b) => a + b, 0);

  const reveal = useCallback(() => {
    setRevealed(true);
    setResults((r) => {
      const next = [...r];
      next[qi] = { right: counts[item.answer], total: handsUp };
      return next;
    });
  }, [qi, counts, item.answer, handsUp]);

  const advance = () => {
    if (!revealed) reveal();
    else if (!last) {
      setQi((i) => i + 1);
      setPicked(null);
      setRevealed(false);
    } else setDone(true);
  };

  const restart = () => {
    setQi(0);
    setPicked(null);
    setRevealed(false);
    setDone(false);
    setResults([]);
    setTally(questions.map((q) => q.options.map(() => 0)));
  };

  const bump = (i, d) => setTally((t) => t.map((row, k) => (k === qi ? row.map((n, j) => (j === i ? Math.max(0, n + d) : n)) : row)));

  const chooseTimer = (s) => {
    setSeconds(s);
    try {
      localStorage.setItem(TIMER_KEY, String(s));
    } catch {
      /* not remembered */
    }
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.("input, textarea") || e.metaKey || e.ctrlKey) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        e.stopImmediatePropagation();
        document.activeElement?.blur?.();
        if (done) return;
        advance();
      } else if (!revealed && !done && /^[a-d]$/i.test(e.key)) {
        const i = e.key.toLowerCase().charCodeAt(0) - 97;
        if (i < item.options.length) {
          e.preventDefault();
          e.stopImmediatePropagation();
          if (counting) bump(i, 1);
          else setPicked(i);
        }
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  });

  if (done) return <div className="cq" data-present-root><Summary questions={questions} results={results} onRestart={restart} revise={revise} /></div>;

  return (
    <div className="cq" data-present-root>
      <div className="cq-head">
        <span className="cq-eyebrow">
          class quiz · {group} · {title}
        </span>
        <span className="cq-progress">
          question {qi + 1} of {questions.length}
        </span>
        {seconds > 0 && <Timer seconds={seconds} running={!revealed} resetKey={qi} onDone={reveal} />}
      </div>

      <div className="cq-tools">
        <div className="cq-seg" role="group" aria-label="Timer">
          {TIMERS.map((s) => (
            <button key={s} type="button" className={seconds === s ? "is-on" : ""} onClick={() => chooseTimer(s)}>
              {s ? `${s}s` : "No timer"}
            </button>
          ))}
        </div>
        <button type="button" className={`cq-toggle ${counting ? "is-on" : ""}`} onClick={() => setCounting((c) => !c)} aria-pressed={counting}>
          Count hands {counting && handsUp > 0 ? `· ${handsUp}` : ""}
        </button>
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
              const share = handsUp ? Math.round((counts[i] / handsUp) * 100) : 0;

              return (
                <motion.div
                  key={opt}
                  className={`cq-option ${state}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => !revealed && (counting ? bump(i, 1) : setPicked(i))}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0, scale: state === "is-right" ? 1.02 : 1 }}
                  transition={{ duration: 0.4, delay: 0.15 + i * 0.07 }}
                >
                  {revealed && handsUp > 0 && <span className="cq-share" style={{ width: `${share}%` }} aria-hidden="true" />}
                  <span className="cq-letter">{letter(i)}</span>
                  <span className="cq-opt-text">{opt}</span>
                  {counting && (
                    <span className="cq-count" onClick={(e) => e.stopPropagation()}>
                      {!revealed && (
                        <button type="button" onClick={() => bump(i, -1)} aria-label={`One fewer for ${letter(i)}`}>
                          −
                        </button>
                      )}
                      <input
                        type="number"
                        min={0}
                        value={counts[i]}
                        readOnly={revealed}
                        onChange={(e) => setTally((t) => t.map((row, k) => (k === qi ? row.map((n, j) => (j === i ? Math.max(0, Number(e.target.value) || 0) : n)) : row)))}
                        aria-label={`Hands for ${letter(i)}`}
                      />
                      {!revealed && (
                        <button type="button" onClick={() => bump(i, 1)} aria-label={`One more for ${letter(i)}`}>
                          +
                        </button>
                      )}
                    </span>
                  )}
                  {revealed && handsUp > 0 && !counting && <b className="cq-pct">{share}%</b>}
                </motion.div>
              );
            })}
          </div>

          <AnimatePresence>
            {revealed && (
              <motion.p className="cq-why" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <b>Answer {letter(item.answer)}.</b> {item.why}
                {handsUp > 0 && ` ${Math.round((counts[item.answer] / handsUp) * 100)}% of the room got it.`}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      <div className="cq-foot">
        <button type="button" className="cq-btn" onClick={advance}>
          {!revealed ? "Reveal answer" : last ? "See results" : "Next question →"}
          <kbd>Space</kbd>
        </button>
        <span className="cq-keys">
          {counting ? "A–D add a hand" : "A–D pick for the room"}
        </span>
        {revise}
      </div>
    </div>
  );
};

// /quiz/:slug — a note's questions.
export const NoteQuiz = () => {
  const { slug } = useParams();
  const note = noteBySlug(slug);
  if (!note) return <Navigate to="/classroom" replace />;
  return (
    <div className="cq-page">
      <Quiz
        key={slug}
        title={note.title}
        group={note.group}
        questions={note.quiz}
        revise={
          <Link to={`/notes/${note.slug}`} className="cq-link">
            Revise the note →
          </Link>
        }
      />
    </div>
  );
};

// /question/:index — the teacher's own question, from the lesson being taught.
export const OwnQuestion = () => {
  const { index } = useParams();
  const lesson = useActiveLesson();
  const item = lesson?.items[Number(index)];
  if (!item || item.type !== "c") return <Navigate to="/classroom" replace />;
  return (
    <div className="cq-page">
      <Quiz key={`${lesson.title}-${index}`} title={lesson.title} group="your question" questions={[item.q]} />
    </div>
  );
};

export default NoteQuiz;
