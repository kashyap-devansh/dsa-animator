import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { NOTE_GROUPS, NOTES, bigOTone } from "./content";

// One table with the complexity of everything in the notes — the page
// students screenshot before an exam.

const FILTERS = [{ id: "all", label: "Everything" }, ...NOTE_GROUPS.filter((g) => g.id !== "foundations").map((g) => ({ id: g.id, label: g.label }))];

export const BigO = ({ value }) => <span className={`bo bo-${bigOTone(value)}`}>{value}</span>;

const CheatSheet = () => {
  const [filter, setFilter] = useState("all");
  const rows = NOTES.filter((n) => n.groupId !== "foundations" && (filter === "all" || n.groupId === filter));

  return (
    <div className="cs">
      <div className="cs-filters">
        {FILTERS.map((f) => (
          <button key={f.id} type="button" className={`cs-filter ${filter === f.id ? "is-active" : ""}`} onClick={() => setFilter(f.id)}>
            {filter === f.id && <motion.span layoutId="cs-pill" className="cs-pill" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
            <span>{f.label}</span>
          </button>
        ))}
      </div>

      <div className="cs-table-wrap">
        <table className="cs-table">
          <thead>
            <tr>
              <th>Topic</th>
              <th>Best</th>
              <th>Average</th>
              <th>Worst</th>
              <th>Space</th>
              <th className="cs-hide-sm">Key fact</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false} mode="popLayout">
              {rows.map((n) => (
                <motion.tr
                  key={n.slug}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <td>
                    <Link to={`/notes/${n.slug}`} className="cs-topic">
                      <i className={`tone-dot tone-${n.tone}`} />
                      {n.title}
                    </Link>
                  </td>
                  <td><BigO value={n.complexity.best} /></td>
                  <td><BigO value={n.complexity.average} /></td>
                  <td><BigO value={n.complexity.worst} /></td>
                  <td><BigO value={n.complexity.space} /></td>
                  <td className="cs-hide-sm cs-fact">
                    {n.facts[0].label}: <b>{n.facts[0].value}</b>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      <div className="cs-key">
        <span><i className="bo-swatch bo-good" /> excellent</span>
        <span><i className="bo-swatch bo-mid" /> fine</span>
        <span><i className="bo-swatch bo-warn" /> slow at scale</span>
        <span><i className="bo-swatch bo-bad" /> explodes</span>
      </div>
    </div>
  );
};

export default CheatSheet;
