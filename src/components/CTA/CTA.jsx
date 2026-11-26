import { useNavigate } from "react-router-dom";
import { FIRST_LESSON } from "../../course/course";
import { Reveal } from "../shared/effects";
import "./CTA.css";

// A rising isometric staircase: each step a little taller, the last one coral.
const CtaStairs = () => (
  <svg className="cta-stairs" viewBox="0 0 260 200" aria-hidden="true">
    <g strokeLinejoin="round" strokeWidth="1.5">
      {[0, 1, 2, 3, 4, 5].map((k) => {
        const x = 20 + k * 36;
        const base = 170 - k * 18;
        const h = 20 + k * 16;
        const hot = k === 5;
        return (
          <g key={k}>
            <path d={`M${x} ${base - h} l18 -10 l18 10 l-18 10Z`} className="cta-top" />
            <path d={`M${x} ${base - h} v${h} l18 10 v${-h}Z`} className={hot ? "cta-hot" : "cta-left"} />
            <path d={`M${x + 36} ${base - h} v${h} l-18 10 v${-h}Z`} className="cta-right" />
          </g>
        );
      })}
    </g>
  </svg>
);

const CTA = () => {
  const navigate = useNavigate();

  return (
    <section className="cta">
      <div className="cta-content">
        <CtaStairs />
        <Reveal>
          <p className="cta-eyebrow">READY WHEN YOU ARE</p>

          <h1>
            Stop reading pseudocode.
            <br />
            Start watching it run.
          </h1>
        </Reveal>

        <div className="cta-actions">
          <button className="cta-btn" onClick={() => navigate(FIRST_LESSON)}>
            Start the first lesson <span aria-hidden="true">→</span>
          </button>
          <p>Arrow keys step through every lesson. No sign-up.</p>
        </div>
      </div>
    </section>
  );
}

export default CTA;

