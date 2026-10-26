import { useNavigate } from "react-router-dom";
import "./Notes.css";

const NOTES_PREVIEW = [
  { topic: "Foundations", title: "Big O, actually visualized", number: "#01" },
  { topic: "Recursion", title: "Watching the call stack breathe", number: "#02" },
  { topic: "Trees", title: "Why AVL rotations feels like Magic", number: "#03" },
  { topic: "Graphs", title: "BFS vs DFS: a frontiers's tale", number: "#04" },
  { topic: "Dynamic Programming", title: "From recursion tree to memo table", number: "#05" },
];

const Notes = () => {
  const navigate = useNavigate();
  return (
    <div className="notes-wrapper">
      <div className="notes">
        <div className="notes-header">
          <span className="notes-eyebrow">Notes from the lab</span>
          <h1>
            Reading between the
            <br />
            frames
          </h1>

          {NOTES_PREVIEW.map((note) => (
            <div
              key={note.number}
              className="notes-item"
              onClick={() => navigate(`/notes`)}
            >
              <span className="notes-topic">{note.topic}</span>
              <h2>{note.title}</h2>
              <span className="notes-number">{note.number}</span>
              <span className="notes-arrow"> ↗ </span>
            </div>
          ))}

        </div>
      </div>
    </div>
  )
}

export default Notes
