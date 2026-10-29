import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { MiniSort } from "../MiniViz/MiniViz";
import { Reveal } from "../shared/effects";
import { trackPointer } from "../shared/pointer";
import "./ClassroomSection.css";

// Landing section pitching the site to lecturers and students: a mock
// projector running a visualizer with live pen ink and a laser dot.

const KEYS = [
  { key: "Space", label: "play / pause" },
  { key: "←  →", label: "step" },
  { key: "F", label: "present" },
  { key: "P", label: "pen" },
  { key: "L", label: "laser" },
  { key: "⌘ K", label: "jump anywhere" },
];

const TEACHERS = [
  { title: "Present mode", text: "One key goes fullscreen, hides the site chrome and scales the stage to fit the projector." },
  { title: "Pen & laser pointer", text: "Circle the pivot, underline the swap, point at the line of code — right on top of the animation." },
  { title: "Drive it from the keyboard", text: "Space to play, arrows to step, R to reset. Pause on the exact frame you want to talk about." },
];

const STUDENTS = [
  { title: "Step at your own pace", text: "Rewind any frame. Every step is synced to the highlighted line of C++." },
  { title: "Notes with quizzes", text: "29 topics with intuition, pitfalls, exam tips and instant-feedback questions." },
  { title: "Track your progress", text: "Mark topics as learned and keep a complexity cheat sheet one click away." },
];

const Feature = ({ item, i }) => (
  <motion.li
    initial={{ opacity: 0, y: 18 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-10% 0px" }}
    transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
  >
    <h4>{item.title}</h4>
    <p>{item.text}</p>
  </motion.li>
);

function useKeyCycle(length, ms) {
  const [i, setI] = useState(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return;
    const t = setInterval(() => setI((x) => (x + 1) % length), ms);
    return () => clearInterval(t);
  }, [length, ms, reduced]);
  return i;
}

const Projector = () => {
  const reduced = useReducedMotion();
  const pressed = useKeyCycle(KEYS.length, 1400);

  return (
    <div className="cls-projector spotlight" onPointerMove={trackPointer}>
      <div className="cls-screen">
        <div className="cls-screen-head">
          <span className="cls-screen-eyebrow">sorting</span>
          <span className="cls-screen-title">Bubble Sort</span>
          <span className="cls-rec">
            <i /> presenting
          </span>
        </div>

        <div className="cls-screen-stage">
          <MiniSort />
        </div>

        {/* hand-drawn annotation, inked in on a loop */}
        <svg className="cls-ink" viewBox="0 0 400 220" preserveAspectRatio="none" aria-hidden="true">
          <motion.path
            d="M248 58 C 210 40, 168 52, 160 92 C 152 140, 210 160, 262 146 C 306 132, 312 84, 270 62"
            fill="none"
            stroke="#b4ff39"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={reduced ? { pathLength: 1, opacity: 1 } : { pathLength: [0, 1, 1, 1], opacity: [1, 1, 1, 0] }}
            transition={{ duration: 5, times: [0, 0.3, 0.85, 1], repeat: Infinity, repeatDelay: 0.6, ease: "easeInOut" }}
          />
          <motion.path
            d="M318 40 C 300 30, 290 40, 284 52 M284 52 l 3 -12 M284 52 l 11 -4"
            fill="none"
            stroke="#b4ff39"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={reduced ? { pathLength: 1, opacity: 1 } : { pathLength: [0, 0, 1, 1, 1], opacity: [1, 1, 1, 1, 0] }}
            transition={{ duration: 5, times: [0, 0.3, 0.42, 0.85, 1], repeat: Infinity, repeatDelay: 0.6, ease: "easeInOut" }}
          />
        </svg>
        <motion.span
          className="cls-ink-note"
          initial={{ opacity: 0 }}
          animate={reduced ? { opacity: 1 } : { opacity: [0, 0, 1, 1, 0] }}
          transition={{ duration: 5, times: [0, 0.4, 0.5, 0.85, 1], repeat: Infinity, repeatDelay: 0.6 }}
        >
          biggest bubbles up!
        </motion.span>

        {!reduced && (
          <motion.span
            className="cls-laser"
            animate={{ left: ["22%", "48%", "70%", "38%", "22%"], top: ["70%", "52%", "64%", "40%", "70%"] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden="true"
          />
        )}

        <div className="cls-mini-dock" aria-hidden="true">
          <span className="is-on" />
          <span className="is-on is-ink" />
          <span />
          <span />
        </div>
      </div>

      <div className="cls-keys">
        {KEYS.map((k, i) => (
          <span key={k.key} className={`cls-key ${i === pressed ? "is-pressed" : ""}`}>
            <kbd>{k.key}</kbd>
            <small>{k.label}</small>
          </span>
        ))}
      </div>
    </div>
  );
};

const ClassroomSection = () => (
  <section className="cls" id="classroom">
    <div className="cls-glow" aria-hidden="true" />

    <div className="cls-inner">
      <Reveal className="cls-head">
        <span className="cls-eyebrow">for classrooms</span>
        <h2>
          Built for the <em>lecture hall.</em>
        </h2>
        <p>Put any visualizer on the projector and teach from it. Students open the same page on their laptops and replay it later at their own pace.</p>
      </Reveal>

      <div className="cls-body">
        <Reveal className="cls-demo">
          <Projector />
        </Reveal>

        <div className="cls-columns">
          <div className="cls-col">
            <span className="cls-col-label cls-col-teach">for teachers</span>
            <ul>
              {TEACHERS.map((item, i) => (
                <Feature key={item.title} item={item} i={i} />
              ))}
            </ul>
          </div>

          <div className="cls-col">
            <span className="cls-col-label cls-col-learn">for students</span>
            <ul>
              {STUDENTS.map((item, i) => (
                <Feature key={item.title} item={item} i={i} />
              ))}
            </ul>
          </div>

          <div className="cls-ctas">
            <Link to="/playground/sorting/quick-sort" className="cls-btn cls-btn-primary">
              Try present mode
            </Link>
            <Link to="/notes" className="cls-btn">
              Browse the notes →
            </Link>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default ClassroomSection;
