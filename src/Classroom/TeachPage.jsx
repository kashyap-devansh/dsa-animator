import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, Reorder, motion } from "framer-motion";
import SYLLABUS from "./syllabus";
import { CATALOG, KIND, describe, encodeLesson, formatMinutes, keyOf, minutesOf, totalMinutes, writeLesson } from "./lesson";
import { createLecture, deleteLecture, duplicateLecture, exportLectures, importLectures, restoreLecture, updateLecture, useLectures } from "./library";
import "./Teach.css";

// The faculty dashboard: your saved lectures, an editor for them, and the
// syllabus map as ready-made starting points.

const EASE = [0.22, 1, 0.36, 1];

const ago = (t) => {
  const s = (Date.now() - t) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return new Date(t).toLocaleDateString(undefined, { day: "numeric", month: "short" });
};

const studentLink = (lecture) => `${window.location.origin}${encodeLesson(lecture)}`;

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    window.prompt("Copy this link:", text);
    return false;
  }
}

// Start teaching: the active lesson keeps the speaker notes, the link doesn't.
function useTeach() {
  const navigate = useNavigate();
  return (lecture) => {
    writeLesson({ title: lecture.title, items: lecture.items, startedAt: null });
    navigate(encodeLesson(lecture));
  };
}

/* ---------- your own question ---------- */

const BLANK = { q: "", options: ["", "", "", ""], answer: 0, why: "" };

const QuestionForm = ({ initial, onSave, onCancel }) => {
  const [form, setForm] = useState(() => initial ?? BLANK);
  const options = form.options.map((o) => o.trim());
  const filled = options.filter(Boolean);
  const valid = form.q.trim() && filled.length >= 2 && options[form.answer];

  const submit = (e) => {
    e.preventDefault();
    if (!valid) return;
    // Drop blank options, keeping the correct answer pointed at the right one.
    const kept = form.options.map((o, i) => ({ o: o.trim(), i })).filter((x) => x.o);
    onSave({ q: form.q.trim(), options: kept.map((x) => x.o), answer: kept.findIndex((x) => x.i === form.answer), why: form.why.trim() });
    if (!initial) setForm(BLANK);
  };

  return (
    <form className="tp-qform" onSubmit={submit}>
      <label className="tp-field">
        <span>question</span>
        <textarea rows={2} value={form.q} onChange={(e) => setForm({ ...form, q: e.target.value })} placeholder="e.g. What is the worst-case height of a BST with n nodes?" autoFocus />
      </label>

      <div className="tp-qopts">
        <span className="tp-field-label">options · tick the correct one</span>
        {form.options.map((opt, i) => (
          <div key={i} className={`tp-qopt ${form.answer === i ? "is-answer" : ""}`}>
            <button type="button" className="tp-qtick" onClick={() => setForm({ ...form, answer: i })} aria-label={`Mark option ${String.fromCharCode(65 + i)} correct`} aria-pressed={form.answer === i}>
              {form.answer === i ? "✓" : String.fromCharCode(65 + i)}
            </button>
            <input
              value={opt}
              onChange={(e) => setForm({ ...form, options: form.options.map((o, k) => (k === i ? e.target.value : o)) })}
              placeholder={i < 2 ? `Option ${String.fromCharCode(65 + i)}` : `Option ${String.fromCharCode(65 + i)} (optional)`}
            />
          </div>
        ))}
      </div>

      <label className="tp-field">
        <span>explanation shown after the reveal (optional)</span>
        <input value={form.why} onChange={(e) => setForm({ ...form, why: e.target.value })} placeholder="Why the answer is right" />
      </label>

      <div className="tp-qform-actions">
        <button type="submit" className="cq-btn tp-small" disabled={!valid}>
          {initial ? "Save question" : "Add question"}
        </button>
        {onCancel && (
          <button type="button" className="tp-ghost tp-small" onClick={onCancel}>
            Cancel
          </button>
        )}
        {!valid && <span className="tp-hint">Needs a question, two options and a correct answer.</span>}
      </div>
    </form>
  );
};

/* ---------- editor ---------- */

const Row = ({ row, open, onToggle, onChange, onRemove }) => {
  const info = describe(row);
  const [editing, setEditing] = useState(false);

  return (
    <Reorder.Item
      value={row}
      className={`tp-row ${open ? "is-open" : ""}`}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12, transition: { duration: 0.15 } }}
      whileDrag={{ scale: 1.02, boxShadow: "0 18px 40px rgba(0,0,0,0.25)" }}
    >
      <div className="tp-row-line">
        <span className="tp-grip" aria-hidden="true">⋮⋮</span>
        <span className={`tp-row-kind tone-text tone-${KIND[row.type].tone}`}>{KIND[row.type].label}</span>
        <button type="button" className="tp-row-title" onClick={onToggle} aria-expanded={open}>
          {info.title}
          {row.note && <span className="tp-row-noted" title="Has speaker notes">notes</span>}
        </button>
        <span className="tp-row-min">{Math.round(minutesOf(row))}′</span>
        <button type="button" className="tp-row-x" onClick={onRemove} aria-label={`Remove ${info.title}`}>
          ×
        </button>
      </div>

      {open && (
        <div className="tp-row-detail" onPointerDown={(e) => e.stopPropagation()}>
          <div className="tp-row-fields">
            <label className="tp-field tp-field-min">
              <span>minutes</span>
              <input type="number" min={1} max={120} value={row.min ?? ""} placeholder={String(Math.round(minutesOf({ ...row, min: 0 })))} onChange={(e) => onChange({ ...row, min: e.target.value ? Math.max(1, Math.min(120, Number(e.target.value))) : undefined })} />
            </label>
            <label className="tp-field tp-field-note">
              <span>speaker notes · only you see these, press S in class</span>
              <textarea rows={2} value={row.note ?? ""} onChange={(e) => onChange({ ...row, note: e.target.value || undefined })} placeholder="What to say, an example to draw, a question to ask the room…" />
            </label>
          </div>
          {row.type === "c" &&
            (editing ? (
              <QuestionForm
                initial={row.q}
                onSave={(q) => {
                  onChange({ ...row, q });
                  setEditing(false);
                }}
                onCancel={() => setEditing(false)}
              />
            ) : (
              <button type="button" className="tp-link" onClick={() => setEditing(true)}>
                Edit question
              </button>
            ))}
        </div>
      )}
    </Reorder.Item>
  );
};

const Editor = ({ lecture, onClose }) => {
  const teach = useTeach();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [open, setOpen] = useState(null);
  const [copied, setCopied] = useState(false);
  const ids = useRef(0);

  // Reorder needs stable identities, and the same item may appear twice.
  const [rows, setRows] = useState(() => lecture.items.map((item) => ({ ...item, uid: ++ids.current })));
  const [title, setTitle] = useState(lecture.title);

  // Save as you go.
  useEffect(() => {
    const t = setTimeout(() => updateLecture(lecture.id, { title: title.trim() || "Untitled lecture", items: rows }), 250);
    return () => clearTimeout(t);
  }, [rows, title, lecture.id]);

  // Every word has to match somewhere, in any order: "bst insert" finds "Insertion · BST".
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const results = CATALOG.filter((c) => {
    if (kind !== "all" && c.type !== kind) return false;
    const hay = `${c.title} ${c.group} ${KIND[c.type].label} ${c.ref.replace(/[/-]/g, " ")}`.toLowerCase();
    return words.every((w) => hay.includes(w));
  }).slice(0, 60);

  const add = (item) => setRows((r) => [...r, { ...item, uid: ++ids.current }]);
  const current = { title, items: rows.map(({ uid: _u, ...it }) => it) };
  const minutes = totalMinutes(current.items);

  const copy = async () => {
    await copyText(studentLink(current));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <motion.div className="tp-editor" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE }}>
      <div className="tp-editor-top">
        <label className="tp-title-field">
          <span>lecture title</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Week 6 — Balancing trees" />
        </label>
        <button type="button" className="tp-ghost tp-small" onClick={onClose}>
          Done
        </button>
      </div>

      <div className="tp-builder">
        <div className="tp-lesson">
          <div className="tp-lesson-head">
            <span>
              {rows.length} item{rows.length === 1 ? "" : "s"} · {formatMinutes(minutes)} planned · click an item for timing and notes
            </span>
            {rows.length > 0 && (
              <button type="button" className="tp-link" onClick={() => setRows([])}>
                Clear
              </button>
            )}
          </div>

          <Reorder.Group axis="y" values={rows} onReorder={setRows} className="tp-rows" data-lenis-prevent>
            <AnimatePresence initial={false}>
              {rows.map((row) => (
                <Row
                  key={row.uid}
                  row={row}
                  open={open === row.uid}
                  onToggle={() => setOpen((o) => (o === row.uid ? null : row.uid))}
                  onChange={(next) => setRows((r) => r.map((x) => (x.uid === row.uid ? next : x)))}
                  onRemove={() => setRows((r) => r.filter((x) => x.uid !== row.uid))}
                />
              ))}
            </AnimatePresence>
            {!rows.length && <li className="tp-empty">Add visualizers, notes, quizzes or your own questions from the right →</li>}
          </Reorder.Group>

          <div className="tp-actions">
            <button type="button" className="cq-btn tp-small" disabled={!rows.length} onClick={() => teach(current)}>
              Teach now →
            </button>
            <button type="button" className="tp-ghost tp-small" disabled={!rows.length} onClick={copy}>
              {copied ? "✓ Link copied" : "Copy student link"}
            </button>
            <a className={`tp-ghost tp-small ${rows.length ? "" : "is-disabled"}`} href={rows.length ? encodeLesson(current, "/handout") : undefined} target="_blank" rel="noreferrer">
              Print handout
            </a>
          </div>
        </div>

        <div className="tp-picker">
          <div className="tp-picker-head">
            {kind !== "c" && <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search visualizers, notes and quizzes…" aria-label="Search items to add" />}
            <div className="tp-kinds">
              {[["all", "All"], ["v", "Visualize"], ["n", "Notes"], ["q", "Quizzes"], ["c", "+ Your question"]].map(([id, label]) => (
                <button key={id} type="button" className={kind === id ? "is-active" : ""} onClick={() => setKind(id)}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {kind === "c" ? (
            <QuestionForm onSave={(question) => add({ type: "c", q: question })} />
          ) : (
            <ul className="tp-results" data-lenis-prevent>
              {results.map((c) => (
                <li key={keyOf(c)}>
                  <button type="button" onClick={() => add({ type: c.type, ref: c.ref })}>
                    <span className={`tp-row-kind tone-text tone-${KIND[c.type].tone}`}>{KIND[c.type].label}</span>
                    <span className="tp-row-title">{c.title}</span>
                    <span className="tp-res-group">{c.group}</span>
                    <span className="tp-add">+</span>
                  </button>
                </li>
              ))}
              {!results.length && <li className="tp-empty">Nothing matches “{query}”.</li>}
            </ul>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/* ---------- library ---------- */

const LectureCard = ({ lecture, onEdit, onDeleted }) => {
  const teach = useTeach();
  const [copied, setCopied] = useState(false);
  const counts = lecture.items.reduce((acc, it) => ({ ...acc, [it.type]: (acc[it.type] ?? 0) + 1 }), {});

  return (
    <motion.li layout className="tp-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.25, ease: EASE }}>
      <button type="button" className="tp-card-main" onClick={onEdit}>
        <h3>{lecture.title}</h3>
        <p>
          {lecture.items.length} items · {formatMinutes(totalMinutes(lecture.items))}
          {counts.c ? ` · ${counts.c} own question${counts.c > 1 ? "s" : ""}` : ""}
        </p>
        <span className="tp-card-date">edited {ago(lecture.updatedAt)}</span>
      </button>
      <div className="tp-card-actions">
        <button type="button" className="cq-btn tp-small" disabled={!lecture.items.length} onClick={() => teach(lecture)}>
          Teach
        </button>
        <button type="button" className="tp-icon-btn" onClick={onEdit}>
          Edit
        </button>
        <button
          type="button"
          className="tp-icon-btn"
          disabled={!lecture.items.length}
          onClick={async () => {
            await copyText(studentLink(lecture));
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          }}
        >
          {copied ? "Copied" : "Link"}
        </button>
        <a className="tp-icon-btn" href={encodeLesson(lecture, "/handout")} target="_blank" rel="noreferrer">
          Print
        </a>
        <button type="button" className="tp-icon-btn" onClick={() => duplicateLecture(lecture.id)}>
          Duplicate
        </button>
        <button type="button" className="tp-icon-btn tp-danger" onClick={onDeleted}>
          Delete
        </button>
      </div>
    </motion.li>
  );
};

/* ---------- page ---------- */

const TeachPage = () => {
  const teach = useTeach();
  const lectures = useLectures();
  const [editing, setEditing] = useState(null);
  const [undo, setUndo] = useState(null);
  const [notice, setNotice] = useState(null);
  const fileRef = useRef(null);
  const editorRef = useRef(null);

  const editingLecture = lectures.find((l) => l.id === editing);

  const scrollTo = (el) => {
    if (!el) return;
    if (window.__lenis) window.__lenis.scrollTo(el, { offset: -90 });
    else el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const edit = (id) => {
    setEditing(id);
    requestAnimationFrame(() => scrollTo(editorRef.current));
  };

  const fromUnit = (unit) => edit(createLecture({ title: `${unit.unit} — ${unit.title}`, items: unit.items }));

  const remove = (lecture) => {
    const index = lectures.findIndex((l) => l.id === lecture.id);
    deleteLecture(lecture.id);
    if (editing === lecture.id) setEditing(null);
    setUndo({ lecture, index });
  };

  useEffect(() => {
    if (!undo) return;
    const t = setTimeout(() => setUndo(null), 6000);
    return () => clearTimeout(t);
  }, [undo]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  const onImport = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const n = await importLectures(file);
      setNotice(`Imported ${n} lecture${n > 1 ? "s" : ""}.`);
    } catch (err) {
      setNotice(err.message?.startsWith("No lectures") ? err.message : "That file isn't a lecture export.");
    }
  };

  return (
    <div className="tp">
      <header className="tp-head">
        <div>
          <span className="tp-eyebrow">for faculty</span>
          <h1 className="tp-head-title">Teach</h1>
          <p className="tp-lede">Plan lectures from the visualizers, notes and quizzes, add your own questions and speaker notes, then present with one key.</p>
        </div>
        <div className="tp-head-actions">
          <button type="button" className="cq-btn tp-small" onClick={() => edit(createLecture())}>
            + New lecture
          </button>
          <button type="button" className="tp-ghost tp-small" onClick={() => fileRef.current?.click()}>
            Import
          </button>
          <button type="button" className="tp-ghost tp-small" disabled={!lectures.length} onClick={exportLectures}>
            Export all
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={onImport} />
        </div>
      </header>

      <section className="tp-section" id="lectures">
        <div className="tp-section-bar">
          <h2>My lectures</h2>
          <span>{lectures.length ? `${lectures.length} saved in this browser · export to move them to another computer` : "saved in this browser"}</span>
        </div>

        {lectures.length ? (
          <ul className="tp-cards">
            <AnimatePresence initial={false}>
              {lectures.map((l) => (
                <LectureCard key={l.id} lecture={l} onEdit={() => edit(l.id)} onDeleted={() => remove(l)} />
              ))}
            </AnimatePresence>
          </ul>
        ) : (
          <div className="tp-blank">
            <p>No lectures yet. Start from a syllabus unit below, or make one from scratch.</p>
            <button type="button" className="cq-btn tp-small" onClick={() => edit(createLecture())}>
              + New lecture
            </button>
          </div>
        )}
      </section>

      <div ref={editorRef}>
        {editingLecture && (
          <section className="tp-section" id="builder">
            <Editor key={editingLecture.id} lecture={editingLecture} onClose={() => setEditing(null)} />
          </section>
        )}
      </div>

      <section className="tp-section" id="syllabus">
        <div className="tp-section-bar">
          <h2>Syllabus units</h2>
          <span>a standard undergraduate DSA course, ready to teach or copy and adapt</span>
        </div>
        <div className="tp-units">
          {SYLLABUS.map((unit) => (
            <div key={unit.id} className="tp-unit-row">
              <button type="button" className="tp-unit-main" onClick={() => teach({ title: `${unit.unit} — ${unit.title}`, items: unit.items })}>
                <span className="tp-unit-n">{unit.unit.replace(/\D/g, "").padStart(2, "0")}</span>
                <span className="tp-unit-text">
                  <h3>{unit.title}</h3>
                  <p>{unit.outcome}</p>
                </span>
                <span className="tp-unit-meta">
                  {unit.items.length} items · {unit.hours} h
                </span>
                <span className="tp-unit-go" aria-hidden="true">→</span>
              </button>
              <button type="button" className="tp-unit-edit" onClick={() => fromUnit(unit)}>
                Copy to my lectures
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="tp-section">
        <div className="tp-section-bar">
          <h2>In the classroom</h2>
          <span>works with a presentation clicker · press ? on any lesson for every shortcut</span>
        </div>
        <ul className="tp-keys">
          {[
            ["F", "Present fullscreen"],
            ["Space · ← →", "Play and step the animation"],
            ["PgDn · PgUp", "Next / previous lecture item"],
            ["S", "Speaker notes and lecture clock"],
            ["P · L", "Pen and laser pointer"],
            ["W", "Blank whiteboard"],
            ["K", "Pick a student at random"],
            ["T", "Light theme for washed-out projectors"],
          ].map(([k, what]) => (
            <li key={k}>
              <kbd>{k}</kbd>
              <span>{what}</span>
            </li>
          ))}
        </ul>
      </section>

      <AnimatePresence>
        {(undo || notice) && (
          <motion.div className="tp-toast" role="status" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}>
            {undo ? (
              <>
                Deleted “{undo.lecture.title}”.
                <button
                  type="button"
                  onClick={() => {
                    restoreLecture(undo.lecture, undo.index);
                    setUndo(null);
                  }}
                >
                  Undo
                </button>
              </>
            ) : (
              notice
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeachPage;
