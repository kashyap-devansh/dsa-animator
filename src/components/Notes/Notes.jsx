import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Reveal } from "../shared/effects";
import "./Notes.css";

const NOTES_PREVIEW = [
  { topic: "Foundations", title: "Big O, actually visualized", number: "#01", slug: "big-o" },
  { topic: "Recursion", title: "Watching the call stack breathe", number: "#02", slug: "factorial" },
  { topic: "Trees", title: "Why AVL rotations feel like magic", number: "#03", slug: "avl-tree" },
  { topic: "Hashing", title: "O(1) lookups and the collisions behind them", number: "#04", slug: "hash-tables" },
  { topic: "Memoization", title: "From recursion tree to memo table", number: "#05", slug: "fibonacci-sequence" },
];

const Notes = () => {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  return (
    <div className="notes-wrapper">
      <div className="notes">
        <div className="notes-header">
          <Reveal>
            <span className="notes-eyebrow">Notes from the lab</span>
            <h1>
              Reading between the
              <br />
              frames
            </h1>
          </Reveal>

          {NOTES_PREVIEW.map((note, i) => (
            <motion.div
              key={note.number}
              className="notes-item"
              onClick={() => navigate(`/notes/${note.slug}`)}
              initial={reduced ? false : { opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="notes-topic">{note.topic}</span>
              <h2>{note.title}</h2>
              <span className="notes-number">{note.number}</span>
              <span className="notes-arrow"> ↗ </span>
            </motion.div>
          ))}

        </div>
      </div>
    </div>
  )
}

export default Notes
