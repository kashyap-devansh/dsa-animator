import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// "Check yourself": pick an answer, see instantly whether it was right and why.

const Question = ({ item, index, picked, onPick }) => {
  const done = picked !== undefined;

  return (
    <div className="qz-card">
      <p className="qz-q">
        <span className="qz-num">Q{index + 1}</span>
        {item.q}
      </p>

      <div className="qz-options">
        {item.options.map((opt, i) => {
          let state = "";
          if (done && i === item.answer) state = "is-right";
          else if (done && i === picked) state = "is-wrong";
          else if (done) state = "is-dim";

          return (
            <motion.button
              key={opt}
              type="button"
              className={`qz-option ${state}`}
              disabled={done}
              onClick={() => onPick(i)}
              animate={state === "is-wrong" ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
              transition={{ duration: 0.35 }}
            >
              <span className="qz-letter">{String.fromCharCode(65 + i)}</span>
              {opt}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {done && (
          <motion.p
            className={`qz-why ${picked === item.answer ? "is-right" : "is-wrong"}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
          >
            <b>{picked === item.answer ? "Correct." : "Not quite."}</b> {item.why}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

const Quiz = ({ items }) => {
  const [answers, setAnswers] = useState({});
  const answered = Object.keys(answers).length;
  const score = items.filter((item, i) => answers[i] === item.answer).length;

  return (
    <div className="qz">
      {items.map((item, i) => (
        <Question key={item.q} item={item} index={i} picked={answers[i]} onPick={(choice) => setAnswers((a) => ({ ...a, [i]: choice }))} />
      ))}

      <div className="qz-foot">
        <span>
          {answered === items.length ? (
            <>
              You scored <b>{score} / {items.length}</b>
              {score === items.length ? " — nailed it." : ""}
            </>
          ) : (
            `${answered} of ${items.length} answered`
          )}
        </span>
        {answered > 0 && (
          <button type="button" className="qz-reset" onClick={() => setAnswers({})}>
            Try again
          </button>
        )}
      </div>
    </div>
  );
};

export default Quiz;
