import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, Reorder, motion, useReducedMotion } from "framer-motion";
import SYLLABUS from "./syllabus";
import { CATALOG, KIND, describe, encodeLesson, keyOf } from "./lesson";
import { NOTES } from "../Notes/content";
import { Reveal } from "../components/shared/effects";
import { trackPointer } from "../components/shared/pointer";
import "./Teach.css";

const EASE = [0.22, 1, 0.36, 1];
const DRAFT_KEY = "lessonDraft";
const QUESTIONS = NOTES.reduce((sum, n) => sum + n.quiz.length, 0);
const VISUALIZERS = CATALOG.filter((c) => c.type === "v").length;

const FLOW = [
  { step: "01", title: "Plan", text: "Pick a syllabus unit or drag together your own lecture. Share it as one link.", key: "⌘ K" },
  { step: "02", title: "Present", text: "Fullscreen, chrome hidden, stage scaled to the projector. Light mode for washed-out rooms.", key: "F · T" },
  { step: "03", title: "Explain", text: "Step frame by frame, circle what matters with the pen, point with the laser.", key: "Space · P · L" },
  { step: "04", title: "Check", text: "Project a timed class quiz. The room answers, you reveal, the explanation follows.", key: "Space" },
];

const PROMISES = [
  ["No install, no login", "Runs in any modern browser — lab PCs, laptops, phones."],
  ["Clicker-ready", "PageDown / PageUp advance the lesson, so a presentation remote just works."],
  ["Projector light mode", "One key flips the stage to a high-contrast light theme."],
  ["Same page for students", "Share the lesson link; students replay every step at their own pace."],
];

function readDraft() {
  try {
    const d = JSON.parse(localStorage.getItem(DRAFT_KEY));
    if (d && Array.isArray(d.items)) return { title: d.title ?? "", items: d.items.filter((i) => describe(i)) };
  } catch {
    /* no draft or storage blocked */
  }
  return { title: "Sorting in one lecture", items: SYLLABUS[3].items.slice(0, 6) };
}

/* ---------- syllabus ---------- */

const UnitCard = ({ unit, onTeach, onEdit, i }) => {
  const counts = unit.items.reduce((acc, it) => ({ ...acc, [it.type]: (acc[it.type] ?? 0) + 1 }), {});

  return (
    <motion.article
      className="tp-unit spotlight spotlight-relative"
      onPointerMove={trackPointer}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 0.55, delay: (i % 3) * 0.07, ease: EASE }}
    >
      <div className="tp-unit-top">
        <span className="tp-unit-num">{unit.unit}</span>
        <span className="tp-unit-hours">≈ {unit.hours} hrs</span>
      </div>
      <h3>{unit.title}</h3>
      <p>{unit.outcome}</p>

      <div className="tp-unit-chips">
        {unit.items.map((it, k) => (
          <span key={k} className={`tp-chip tone-${KIND[it.type].tone}`} title={describe(it)?.title}>
            {describe(it)?.title.replace(/ quiz$/, "")}
          </span>
        ))}
      </div>

      <div className="tp-unit-foot">
        <span className="tp-unit-counts">
          {counts.v ?? 0} visualizers · {counts.n ?? 0} notes · {counts.q ?? 0} quizzes
        </span>
        <div>
          <button type="button" className="tp-ghost" onClick={onEdit}>
            Customise
          </button>
          <button type="button" className="tp-solid" onClick={onTeach}>
            Teach this unit →
          </button>
        </div>
      </div>
    </motion.article>
  );
};

/* ---------- builder ---------- */

const Builder = ({ draft, setDraft }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [copied, setCopied] = useState(false);
  const ids = useRef(draft.items.length);

  // Reorder needs stable identities, and the same item may appear twice.
  // The builder remounts (keyed on draft.version) when a unit is loaded into it.
  const [rows, setRows] = useState(() => draft.items.map((item, i) => ({ ...item, uid: i + 1 })));

  useEffect(() => {
    const items = rows.map(({ type, ref }) => ({ type, ref }));
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ title: draft.title, items }));
    } catch {
      /* drafts just won't persist */
    }
  }, [rows, draft.title]);

  const q = query.trim().toLowerCase();
  const results = CATALOG.filter((c) => (kind === "all" || c.type === kind) && (!q || `${c.title} ${c.group}`.toLowerCase().includes(q))).slice(0, 40);

  const add = (c) => setRows((r) => [...r, { type: c.type, ref: c.ref, uid: ++ids.current }]);
  const remove = (uid) => setRows((r) => r.filter((x) => x.uid !== uid));
  const lesson = { title: draft.title, items: rows.map(({ type, ref }) => ({ type, ref })) };

  const copy = async () => {
    const url = `${window.location.origin}${encodeLesson(lesson)}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copy this lesson link:", url);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="tp-builder">
      <div className="tp-lesson">
        <label className="tp-title-field">
          <span>lesson title</span>
          <input value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} placeholder="e.g. Week 6 — Balancing trees" />
        </label>

        <div className="tp-lesson-head">
          <span>
            {rows.length} item{rows.length === 1 ? "" : "s"} · drag to reorder
          </span>
          {rows.length > 0 && (
            <button type="button" className="tp-link" onClick={() => setRows([])}>
              Clear
            </button>
          )}
        </div>

        <Reorder.Group axis="y" values={rows} onReorder={setRows} className="tp-rows" data-lenis-prevent>
          <AnimatePresence initial={false}>
            {rows.map((row, i) => {
              const info = describe(row);
              return (
                <Reorder.Item
                  key={row.uid}
                  value={row}
                  className="tp-row"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12, transition: { duration: 0.15 } }}
                  whileDrag={{ scale: 1.02, boxShadow: "0 18px 40px rgba(0,0,0,0.5)" }}
                >
                  <span className="tp-grip" aria-hidden="true">⋮⋮</span>
                  <span className="tp-row-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className={`tp-row-kind tone-text tone-${KIND[row.type].tone}`}>{KIND[row.type].label}</span>
                  <span className="tp-row-title">{info.title}</span>
                  <button type="button" className="tp-row-x" onClick={() => remove(row.uid)} aria-label={`Remove ${info.title}`}>
                    ×
                  </button>
                </Reorder.Item>
              );
            })}
          </AnimatePresence>
          {!rows.length && <li className="tp-empty">Add visualizers, notes and quizzes from the right →</li>}
        </Reorder.Group>

        <div className="tp-actions">
          <button type="button" className="tp-solid" disabled={!rows.length} onClick={() => navigate(encodeLesson(lesson))}>
            Start lesson →
          </button>
          <button type="button" className="tp-ghost" disabled={!rows.length} onClick={copy}>
            {copied ? "✓ Link copied" : "Copy share link"}
          </button>
        </div>
      </div>

      <div className="tp-picker">
        <div className="tp-picker-head">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search 100+ items…" aria-label="Search items to add" />
          <div className="tp-kinds">
            {[["all", "All"], ["v", "Visualize"], ["n", "Notes"], ["q", "Quizzes"]].map(([id, label]) => (
              <button key={id} type="button" className={kind === id ? "is-active" : ""} onClick={() => setKind(id)}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <ul className="tp-results" data-lenis-prevent>
          {results.map((c) => (
            <li key={keyOf(c)}>
              <button type="button" onClick={() => add(c)}>
                <span className={`tp-row-kind tone-text tone-${KIND[c.type].tone}`}>{KIND[c.type].label}</span>
                <span className="tp-row-title">{c.title}</span>
                <span className="tp-res-group">{c.group}</span>
                <span className="tp-add">+</span>
              </button>
            </li>
          ))}
          {!results.length && <li className="tp-empty">Nothing matches “{query}”.</li>}
        </ul>
      </div>
    </div>
  );
};

/* ---------- page ---------- */

const TeachPage = () => {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const [draft, setDraftState] = useState(() => ({ ...readDraft(), version: 0 }));
  const setDraft = (fn) => setDraftState((d) => fn(d));

  const builderRef = useRef(null);
  const teach = (unit) => navigate(encodeLesson({ title: `${unit.unit} — ${unit.title}`, items: unit.items }));
  const edit = (unit) => {
    setDraftState((d) => ({ title: `${unit.unit} — ${unit.title}`, items: unit.items, version: d.version + 1 }));
    const el = builderRef.current;
    if (window.__lenis && el) window.__lenis.scrollTo(el, { offset: -100 });
    else el?.scrollIntoView({ behavior: "smooth" });
  };

  const totalHours = useMemo(() => SYLLABUS.reduce((s, u) => s + u.hours, 0), []);

  return (
    <div className="tp">
      <section className="tp-hero">
        <div className="tp-hero-grid" aria-hidden="true" />
        <div className="tp-hero-inner">
          <motion.span className="tp-eyebrow" initial={reduced ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            for faculty
          </motion.span>
          <motion.h1
            className="tp-title"
            initial={reduced ? false : { opacity: 0, y: 36, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            Your whole DSA course,
            <br />
            <span>ready to project.</span>
          </motion.h1>
          <motion.p className="tp-lede" initial={reduced ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2, ease: EASE }}>
            Seven syllabus units mapped to animated visualizers, revision notes and timed class quizzes. Pick a unit and start teaching, or build your own lecture and share it with one link.
          </motion.p>

          <motion.div className="tp-hero-actions" initial={reduced ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.32, ease: EASE }}>
            <button type="button" className="tp-solid tp-big" onClick={() => teach(SYLLABUS[5])}>
              Run a sample lecture: Trees →
            </button>
            <button type="button" className="tp-ghost tp-big" onClick={() => edit(SYLLABUS[3])}>
              Build your own
            </button>
          </motion.div>

          <motion.dl className="tp-numbers" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
            {[
              [SYLLABUS.length, "syllabus units"],
              [`${totalHours}h`, "of lecture material"],
              [VISUALIZERS, "visualizers"],
              [NOTES.length, "revision notes"],
              [QUESTIONS, "quiz questions"],
            ].map(([value, label]) => (
              <div key={label}>
                <dt>{value}</dt>
                <dd>{label}</dd>
              </div>
            ))}
          </motion.dl>
        </div>
      </section>

      <section className="tp-section">
        <Reveal className="tp-section-head">
          <span className="tp-eyebrow">how a lecture runs</span>
          <h2>Plan. Present. Explain. Check.</h2>
        </Reveal>
        <div className="tp-flow">
          {FLOW.map((f, i) => (
            <motion.div
              key={f.step}
              className="tp-flow-step"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: EASE }}
            >
              <span className="tp-flow-num">{f.step}</span>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
              <kbd>{f.key}</kbd>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="tp-section" id="syllabus">
        <Reveal className="tp-section-head">
          <span className="tp-eyebrow">syllabus map</span>
          <h2>Every unit, already a lesson.</h2>
          <p>Mapped to a standard undergraduate Data Structures course. Each unit opens as a ready-to-teach sequence — or customise it first.</p>
        </Reveal>
        <div className="tp-units">
          {SYLLABUS.map((unit, i) => (
            <UnitCard key={unit.id} unit={unit} i={i} onTeach={() => teach(unit)} onEdit={() => edit(unit)} />
          ))}
        </div>
      </section>

      <section className="tp-section" id="builder" ref={builderRef}>
        <Reveal className="tp-section-head">
          <span className="tp-eyebrow">lesson builder</span>
          <h2>Build tomorrow's lecture in two minutes.</h2>
          <p>Add items, drag them into order, then start teaching — or copy the link and post it for students.</p>
        </Reveal>
        <Builder key={draft.version} draft={draft} setDraft={setDraft} />
      </section>

      <section className="tp-section">
        <div className="tp-promises">
          {PROMISES.map(([title, text], i) => (
            <motion.div
              key={title}
              className="tp-promise"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: EASE }}
            >
              <h4>{title}</h4>
              <p>{text}</p>
            </motion.div>
          ))}
        </div>

        <div className="tp-final">
          <h2>Try it on the projector right now.</h2>
          <div>
            <Link to="/playground/sorting/quick-sort" className="tp-solid tp-big">
              Open Quick Sort, press F
            </Link>
            <Link to="/quiz/avl-tree" className="tp-ghost tp-big">
              See a class quiz
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TeachPage;
