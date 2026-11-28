import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { KIND, decodeLesson, describe, formatMinutes, minutesOf, questionsOf, totalMinutes } from "./lesson";
import "./Teach.css";

// A printable sheet for a lecture: the outline, then every question in it
// with space to answer, and (optionally) an answer key on its own page.

const letter = (i) => String.fromCharCode(65 + i);

const Handout = () => {
  const { search } = useLocation();
  const lesson = useMemo(() => decodeLesson(search), [search]);
  const [withKey, setWithKey] = useState(false);
  const [withOutline, setWithOutline] = useState(true);
  const questions = lesson.items.flatMap(questionsOf);

  return (
    <div className="ho">
      <div className="ho-bar">
        <Link to="/classroom" className="tp-link">
          ← Teach
        </Link>
        <label>
          <input type="checkbox" checked={withOutline} onChange={(e) => setWithOutline(e.target.checked)} /> Outline
        </label>
        <label>
          <input type="checkbox" checked={withKey} onChange={(e) => setWithKey(e.target.checked)} /> Answer key
        </label>
        <button type="button" className="cq-btn tp-small" onClick={() => window.print()}>
          Print
        </button>
      </div>

      <article className="ho-sheet">
        <header className="ho-head">
          <h1>{lesson.title}</h1>
          <div className="ho-fill">
            <span>Name</span>
            <span>Roll no.</span>
            <span>Date</span>
          </div>
        </header>

        {withOutline && (
          <section>
            <h2>In this lecture · {formatMinutes(totalMinutes(lesson.items))}</h2>
            <ol className="ho-outline">
              {lesson.items.map((item, i) => (
                <li key={i}>
                  <span>{KIND[item.type].label}</span>
                  {describe(item).title}
                  {item.type === "v" && <small> · {describe(item).group}</small>}
                  <em>{Math.round(minutesOf(item))} min</em>
                </li>
              ))}
            </ol>
          </section>
        )}

        {questions.length > 0 ? (
          <section>
            <h2>Questions</h2>
            <ol className="ho-questions">
              {questions.map((q, i) => (
                <li key={i}>
                  <p>{q.q}</p>
                  <ul>
                    {q.options.map((o, k) => (
                      <li key={k}>
                        <span className="ho-box" /> {letter(k)}. {o}
                      </li>
                    ))}
                  </ul>
                  <div className="ho-lines" aria-hidden="true">
                    <span>Why:</span>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ) : (
          <p className="ho-none">This lecture has no quiz items. Add a class quiz or your own question to put questions on the handout.</p>
        )}

        {withKey && questions.length > 0 && (
          <section className="ho-key">
            <h2>Answer key</h2>
            <ol>
              {questions.map((q, i) => (
                <li key={i}>
                  <b>{letter(q.answer)}.</b> {q.options[q.answer]}
                  {q.why && <span> · {q.why}</span>}
                </li>
              ))}
            </ol>
          </section>
        )}
      </article>
    </div>
  );
};

export default Handout;
