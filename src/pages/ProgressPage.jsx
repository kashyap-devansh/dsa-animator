import { Link } from "react-router-dom";
import { CircleCheck, Circle, RotateCcw } from "lucide-react";
import { MODULES, TOTAL } from "../course/course";
import { useProgress } from "../course/store";
import "./ProgressPage.css";

// Where the learner stands: overall, per module, and every lesson.
const ProgressPage = () => {
  const { done, reset } = useProgress();
  const finished = MODULES.flatMap((m) => m.lessons).filter((l) => done.has(l.path)).length;
  const pct = Math.round((finished / TOTAL) * 100);
  const nextUp = MODULES.flatMap((m) => m.lessons).find((l) => !done.has(l.path));

  return (
    <div className="pp">
      <header className="pp-head">
        <div>
          <span className="ui-eyebrow">Progress</span>
          <h1>
            {finished} of {TOTAL} lessons finished
          </h1>
          <p>A lesson counts as finished once you step through to its last step.</p>
        </div>

        <div className="pp-ring" style={{ "--pct": pct }}>
          <span>{pct}%</span>
        </div>
      </header>

      <div className="pp-actions">
        {nextUp && (
          <Link className="ui-btn ui-btn-primary" to={nextUp.path}>
            Continue: {nextUp.title}
          </Link>
        )}
        {finished > 0 && (
          <button
            className="ui-btn"
            onClick={() => {
              if (confirm("Clear all lesson progress on this device?")) reset();
            }}
          >
            <RotateCcw size={15} /> Reset progress
          </button>
        )}
      </div>

      <div className="pp-grid">
        {MODULES.map((m) => {
          const count = m.lessons.filter((l) => done.has(l.path)).length;
          return (
            <section key={m.id} className="pp-mod ui-card">
              <div className="pp-mod-head">
                <span className="pp-mod-num">{m.number}</span>
                <h2>{m.title}</h2>
                <span className="pp-mod-count">
                  {count}/{m.lessons.length}
                </span>
              </div>
              <div className="pp-mod-bar">
                <div style={{ width: `${(count / m.lessons.length) * 100}%` }} />
              </div>
              <ul>
                {m.lessons.map((l) => (
                  <li key={l.path}>
                    <Link to={l.path} className={done.has(l.path) ? "pp-done" : ""}>
                      {done.has(l.path) ? <CircleCheck size={16} /> : <Circle size={16} />}
                      <span>{l.title}</span>
                      <small>{l.complexity}</small>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressPage;
