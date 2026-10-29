import { motion } from "framer-motion";
import { Variables } from "./StepperPage";
import "./ArrayStage.css";

// Array cells with index labels, highlight roles, pointer tags and a
// variables strip. Pass `keys` to make cells glide when elements swap.
const ArrayStage = ({ values, keys, roles = {}, range, pointers = [], vars, caption, compact = false }) => {
  const columns = { gridTemplateColumns: `repeat(${values.length}, minmax(0, 42px))` };
  const dimmed = (i) => range && (i < range[0] || i > range[1]);

  return (
    <div className={`as-stage ${compact ? "as-compact" : ""}`}>
      {caption && <p className="as-caption">{caption}</p>}

      <div className="as-grid" style={columns}>
        {values.map((_, i) => (
          <span key={i} className="as-index">{i}</span>
        ))}
      </div>

      <div className="as-grid" style={columns}>
        {values.map((value, i) => (
          <motion.div
            key={keys ? keys[i] : i}
            layout
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className={`as-cell ${roles[i] ? `as-${roles[i]}` : ""} ${dimmed(i) ? "as-dim" : ""}`}
          >
            {value}
          </motion.div>
        ))}
      </div>

      <div className="as-grid as-pointer-row" style={columns}>
        {values.map((_, i) => (
          <div key={i} className="as-pointers">
            {pointers
              .filter((p) => p.index === i)
              .map((p) => (
                <span key={p.label} className={`as-ptr as-ptr-${p.tone ?? "orange"}`}>
                  {p.label}
                </span>
              ))}
          </div>
        ))}
      </div>

      {vars && <Variables items={vars} />}
    </div>
  );
};

export default ArrayStage;
