import "./Notes.css";

const Notes = () => {
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

          <div className="notes-item">
            <span className="notes-topic">Foundations</span>
            <h2>Big O, actually visualized</h2>
            <span className="notes-number">#01</span>
            <span className="notes-arrow"> ↗ </span>
          </div>

          <div className="notes-item">
            <span className="notes-topic">Recursion</span>
            <h2>Watching the call stack breathe</h2>
            <span className="notes-number">#02</span>
            <span className="notes-arrow"> ↗ </span>
          </div>

          <div className="notes-item">
            <span className="notes-topic">Trees</span>
            <h2>Why AVL rotations feels like Magic</h2>
            <span className="notes-number">#03</span>
            <span className="notes-arrow"> ↗ </span>
          </div>

          <div className="notes-item">
            <span className="notes-topic">Graphs</span>
            <h2>BFS vs DFS: a frontiers's tale</h2>
            <span className="notes-number">#04</span>
            <span className="notes-arrow"> ↗ </span>
          </div>

          <div className="notes-item">
            <span className="notes-topic">Dynamic Programming</span>
            <h2>From recursion tree to memo table</h2>
            <span className="notes-number">#01</span>
            <span className="notes-arrow"> ↗ </span>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Notes
