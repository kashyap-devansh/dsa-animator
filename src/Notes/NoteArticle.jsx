import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { NOTES, noteBySlug } from "./content";
import NotesData from "../components/NotesSection/NotesData.js";
import { NotebookPaper } from "../components/NotesSection/NotesSection.jsx";
import { MiniSort, MiniBinarySearch, MiniTree, MiniList, MiniQueue } from "../components/MiniViz/MiniViz";
import { highlight } from "../Playground/shared/highlight";
import { trackPointer } from "../components/shared/pointer";
import NotesSidebar from "./NotesSidebar";
import GrowthChart from "./GrowthChart";
import Quiz from "./Quiz";
import { BigO } from "./CheatSheet";
import { useLearned } from "./useLearned";
import "./Notes.css";

const VIZ = { sort: MiniSort, binary: MiniBinarySearch, tree: MiniTree, list: MiniList, queue: MiniQueue };
const EASE = [0.22, 1, 0.36, 1];

const rise = (i = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.6, delay: i * 0.05, ease: EASE },
});

function useActiveSection(idKey) {
  const [active, setActive] = useState(idKey.split(",")[0]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    idKey.split(",").forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [idKey]);

  return active;
}

const jumpTo = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  if (window.__lenis) window.__lenis.scrollTo(el, { offset: -110 });
  else el.scrollIntoView({ behavior: "smooth" });
};

const Section = ({ id, kicker, title, children }) => (
  <motion.section id={id} className="na-section" {...rise()}>
    <span className="na-kicker">{kicker}</span>
    <h2 className="na-h2">{title}</h2>
    {children}
  </motion.section>
);

const Article = ({ note }) => {
  const reduced = useReducedMotion();
  const { learned, toggle } = useLearned();
  const isLearned = learned.has(note.slug);
  const Viz = VIZ[note.viz];
  const paper = NotesData.find((p) => p.id === note.notebook);
  const index = NOTES.findIndex((n) => n.slug === note.slug);
  const prev = NOTES[index - 1];
  const next = NOTES[index + 1];

  const sections = [
    ["intuition", "Intuition"],
    ["steps", "How it works"],
    ["complexity", "Complexity"],
    ["code", "Code"],
    ["pitfalls", "Pitfalls"],
    paper && ["notebook", "From the notebook"],
    ["quiz", "Check yourself"],
  ].filter(Boolean);
  const active = useActiveSection(sections.map(([id]) => id).join(","));

  return (
    <>
      <article className="na-article" data-present-root="scroll">
        <header className="na-head">
          <motion.div className="na-crumbs" initial={reduced ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Link to="/notes">Notes</Link>
            <span>/</span>
            <span className={`tone-text tone-${note.tone}`}>{note.group}</span>
          </motion.div>

          <motion.h1
            className="na-title"
            initial={reduced ? false : { opacity: 0, y: 30, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            {note.title}
          </motion.h1>

          <motion.p className="na-tldr" initial={reduced ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.12, ease: EASE }}>
            {note.tldr}
          </motion.p>

          <motion.div className="na-meta" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.25 }}>
            <span className={`na-level na-level-${note.level.toLowerCase()}`}>{note.level}</span>
            <span>{note.minutes} min read</span>
            {note.growth ? (
              <span className="tone-text tone-lime">interactive chart below</span>
            ) : (
              <span>
                average <BigO value={note.complexity.average} />
              </span>
            )}
          </motion.div>

          <motion.div className="na-actions" initial={reduced ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.32, ease: EASE }}>
            {note.visualizers?.[0] && (
              <Link to={note.visualizers[0].path} className="na-btn na-btn-primary">
                <span className="na-live-dot" /> Watch it run
              </Link>
            )}
            <button type="button" className={`na-btn ${isLearned ? "na-btn-done" : ""}`} onClick={() => toggle(note.slug)} aria-pressed={isLearned}>
              {isLearned ? "✓ Learned" : "Mark as learned"}
            </button>
          </motion.div>
        </header>

        {(Viz || note.growth) && (
          <motion.div
            className={`na-hero-viz spotlight ${note.growth ? "na-hero-growth" : ""}`}
            onPointerMove={trackPointer}
            initial={reduced ? false : { opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
          >
            {note.growth ? (
              <GrowthChart />
            ) : (
              <>
                <span className="na-hero-viz-tag">
                  <span className="na-live-dot" /> live preview
                </span>
                <Viz />
              </>
            )}
          </motion.div>
        )}

        <Section id="intuition" kicker="01" title="Intuition">
          {note.intuition.map((p) => (
            <p key={p.slice(0, 24)} className="na-p">
              {p}
            </p>
          ))}
        </Section>

        <Section id="steps" kicker="02" title="How it works">
          <ol className="na-steps">
            {note.steps.map((s, i) => (
              <motion.li key={s} {...rise(i)}>
                <span className="na-step-num">{i + 1}</span>
                <span>{s}</span>
              </motion.li>
            ))}
          </ol>
        </Section>

        <Section id="complexity" kicker="03" title="Complexity">
          <div className="na-cx">
            {[
              ["Best", note.complexity.best],
              ["Average", note.complexity.average],
              ["Worst", note.complexity.worst],
              ["Space", note.complexity.space],
            ].map(([label, value], i) => (
              <motion.div key={label} className="na-cx-cell" {...rise(i)}>
                <span>{label}</span>
                <BigO value={value} />
              </motion.div>
            ))}
          </div>

          <div className="na-facts">
            {note.facts.map((f) => (
              <span key={f.label}>
                {f.label} <b>{f.value}</b>
              </span>
            ))}
          </div>
        </Section>

        <Section id="code" kicker="04" title="Code">
          <div className="na-code">
            <div className="na-code-bar">
              <i />
              <i />
              <i />
              <span>{note.slug.replace(/-/g, "_")}.cpp</span>
            </div>
            <pre>
              {note.code.map((line, i) => (
                <div key={i} className="na-code-line">
                  <span className="na-code-no">{i + 1}</span>
                  {line ? highlight(line) : " "}
                </div>
              ))}
            </pre>
          </div>
        </Section>

        <Section id="pitfalls" kicker="05" title="Common pitfalls">
          <ul className="na-pitfalls">
            {note.pitfalls.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>

          <div className="na-tip">
            <span className="na-tip-label">exam tip</span>
            <p>{note.examTip}</p>
          </div>
        </Section>

        {paper && (
          <Section id="notebook" kicker="06" title="From the notebook">
            <p className="na-p na-muted">The handwritten page this topic started from.</p>
            <div className="na-paper">
              <div className="page">
                <NotebookPaper note={paper} reduced={reduced} />
              </div>
              <a href={paper.pdf} target="_blank" rel="noreferrer" className="na-btn">
                Open PDF ↗
              </a>
            </div>
          </Section>
        )}

        <Section id="quiz" kicker={paper ? "07" : "06"} title="Check yourself">
          <Quiz key={note.slug} items={note.quiz} />
        </Section>

        {note.visualizers?.length > 0 && (
          <motion.div className="na-viz-links" {...rise()}>
            <span className="na-kicker">see it move</span>
            <div>
              {note.visualizers.map((v) => (
                <Link key={v.path} to={v.path} className="na-viz-link">
                  {v.label} <span>→</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        <div className="na-pager">
          {prev ? (
            <Link to={`/notes/${prev.slug}`} className="na-pager-card">
              <span>← previous</span>
              <b>{prev.title}</b>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link to={`/notes/${next.slug}`} className="na-pager-card na-pager-next">
              <span>next →</span>
              <b>{next.title}</b>
            </Link>
          )}
        </div>
      </article>

      <aside className="na-rail">
        <span className="na-rail-label">on this page</span>
        {sections.map(([id, label]) => (
          <button key={id} type="button" className={`na-rail-link ${active === id ? "is-active" : ""}`} onClick={() => jumpTo(id)}>
            {label}
          </button>
        ))}
      </aside>
    </>
  );
};

const NoteArticle = () => {
  const { slug } = useParams();
  const note = noteBySlug(slug);
  if (!note) return <Navigate to="/notes" replace />;
  return (
    <div className="na-layout">
      <NotesSidebar active={note.slug} />
      <Article key={note.slug} note={note} />
    </div>
  );
};

export default NoteArticle;
