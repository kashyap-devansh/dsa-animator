import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { NOTE_GROUPS, NOTES } from "./content";
import { useLearned } from "./useLearned";
import { Progress } from "./NotesSidebar";
import CheatSheet from "./CheatSheet";
import GrowthChart from "./GrowthChart";
import { Reveal } from "../components/shared/effects";
import "./Notes.css";

const EASE = [0.22, 1, 0.36, 1];
const QUESTIONS = NOTES.reduce((sum, n) => sum + n.quiz.length, 0);


// One topic: its title and a one-line summary. Nothing else.
const TopicRow = ({ note, learned }) => (
  <Link to={`/notes/${note.slug}`} className={`nh-row ${learned ? "nh-row-done" : ""}`}>
    <h3>{note.title}</h3>
    <p>{note.tldr}</p>
  </Link>
);

const NotesHub = () => {
  const reduced = useReducedMotion();
  const { learned } = useLearned();
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const groups = NOTE_GROUPS.map((g) => ({
    ...g,
    notes: NOTES.filter((n) => n.groupId === g.id && (!q || `${n.title} ${n.tldr} ${n.group}`.toLowerCase().includes(q))),
  })).filter((g) => g.notes.length);

  return (
    <div className="nh">
      <section className="nh-hero">
        <div className="nh-hero-grid" aria-hidden="true" />
        <div className="nh-hero-glow" aria-hidden="true" />


        <div className="nh-hero-inner">
          <motion.span className="nh-eyebrow" initial={reduced ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            study notes · {NOTES.length} topics
          </motion.span>

          <h1 className="nh-title">
            {["Learn it.", "See it.", "Prove it."].map((word, i) => (
              <motion.span
                key={word}
                className={`nh-title-word nh-title-${i}`}
                initial={reduced ? false : { opacity: 0, y: 40, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.8, delay: 0.1 + i * 0.14, ease: EASE }}
              >
                {word}
              </motion.span>
            ))}
          </h1>

          <motion.p className="nh-lede" initial={reduced ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5, ease: EASE }}>
            Every topic in the playground, written up for revision: the intuition, the steps, the complexity, clean C++, the mistakes examiners look for — and a quick quiz to prove you've got it.
          </motion.p>

          <motion.div className="nh-search" initial={reduced ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.62, ease: EASE }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search notes — try “rotation”, “stable” or “hash”" aria-label="Search notes" />
            {query && (
              <button type="button" onClick={() => setQuery("")} aria-label="Clear search">
                ×
              </button>
            )}
          </motion.div>

          <motion.div className="nh-stats" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.75 }}>
            <span>
              <b>{NOTES.length}</b> topics
            </span>
            <span>
              <b>{QUESTIONS}</b> quiz questions
            </span>
            <span>
              <b>{NOTE_GROUPS.length}</b> chapters
            </span>
            <Progress />
          </motion.div>
        </div>
      </section>

      <section className="nh-map">
        <AnimatePresence mode="popLayout">
          {groups.map((g, gi) => (
            <motion.div key={g.id} className="nh-group" layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="nh-group-head">
                <span className={`nh-group-num tone-text tone-${g.tone}`}>{String(gi + 1).padStart(2, "0")}</span>
                <h2>{g.label}</h2>
                <span className="nh-group-count">
                  {g.notes.filter((n) => learned.has(n.slug)).length} / {g.notes.length}
                </span>
              </div>

              <div className="nh-rows">
                {g.notes.map((n) => (
                  <TopicRow key={n.slug} note={n} learned={learned.has(n.slug)} />
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {!groups.length && <p className="nh-empty">No notes match “{query}”.</p>}
      </section>

      <section className="nh-block" id="growth">
        <Reveal className="nh-block-head">
          <span className="nh-eyebrow">interactive</span>
          <h2>Feel the difference between n² and n log n.</h2>
          <p>Drag n and watch the curves pull apart, then scale the input up to see what “slow” really means.</p>
        </Reveal>
        <Reveal className="nh-block-body">
          <GrowthChart />
        </Reveal>
      </section>

      <section className="nh-block" id="cheatsheet">
        <Reveal className="nh-block-head">
          <span className="nh-eyebrow">cheat sheet</span>
          <h2>Every complexity, one table.</h2>
          <p>Best, average and worst case for everything in the notes. Click a row to open the topic.</p>
        </Reveal>
        <Reveal>
          <CheatSheet />
        </Reveal>
      </section>

    </div>
  );
};

export default NotesHub;
