import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { NOTE_GROUPS, NOTES } from "./content";
import { useLearned } from "./useLearned";

export const Progress = ({ compact = false }) => {
  const { learned } = useLearned();
  const done = NOTES.filter((n) => learned.has(n.slug)).length;
  const pct = Math.round((done / NOTES.length) * 100);

  return (
    <div className={`nt-progress ${compact ? "nt-progress-compact" : ""}`}>
      <div className="nt-progress-head">
        <span>your progress</span>
        <b>
          {done} / {NOTES.length}
        </b>
      </div>
      <div className="nt-progress-track">
        <motion.i initial={false} animate={{ width: `${pct}%` }} transition={{ type: "spring", stiffness: 140, damping: 24 }} />
      </div>
    </div>
  );
};

const NotesSidebar = ({ active }) => {
  const [query, setQuery] = useState("");
  const { learned } = useLearned();
  const q = query.trim().toLowerCase();

  return (
    <aside className="nt-sidebar">
      <Link to="/notes" className="nt-back">
        ← All notes
      </Link>

      <input className="nt-filter" placeholder="Filter topics…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Filter topics" />

      <div className="nt-index" data-lenis-prevent>
        {NOTE_GROUPS.map((group) => {
          const notes = group.notes.filter((n) => !q || n.title.toLowerCase().includes(q));
          if (!notes.length) return null;

          return (
            <div key={group.id} className="nt-index-group">
              <span className="nt-index-label">
                <i className={`tone-dot tone-${group.tone}`} />
                {group.label}
              </span>

              {notes.map((n) => (
                <Link key={n.slug} to={`/notes/${n.slug}`} className={`nt-index-link ${n.slug === active ? "is-active" : ""}`}>
                  {n.slug === active && <motion.span layoutId="nt-index-pill" className="nt-index-pill" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
                  <span className="nt-index-title">{n.title}</span>
                  {learned.has(n.slug) && <span className="nt-index-check" aria-label="learned">✓</span>}
                </Link>
              ))}
            </div>
          );
        })}
      </div>

      <Progress compact />
    </aside>
  );
};

export default NotesSidebar;
