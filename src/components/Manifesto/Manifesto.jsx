import { useTheme } from "../../course/store";
import "./Manifesto.css";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

function Manifesto() {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start center", "end center"],
  });

  const { theme } = useTheme();
  const dim = theme === "dark" ? "#2c2d31" : "#d9d3c8";
  const lit = theme === "dark" ? "#f2f0eb" : "#27282c";
  const color1 = useTransform(scrollYProgress, [0.00, 0.15], [dim, lit]);
  const color2 = useTransform(scrollYProgress, [0.10, 0.25], [dim, lit]);
  const color3 = useTransform(scrollYProgress, [0.20, 0.35], [dim, lit]);
  const color4 = useTransform(scrollYProgress, [0.30, 0.45], [dim, lit]);
  const color5 = useTransform(scrollYProgress, [0.40, 0.55], [dim, lit]);
  const color6 = useTransform(scrollYProgress, [0.50, 0.65], [dim, lit]);
  const color7 = useTransform(scrollYProgress, [0.60, 0.75], [dim, lit]);
  const color8 = useTransform(scrollYProgress, [0.70, 0.85], [dim, lit]);

  return (
    <div
      ref={ref}
      className="manifesto"
      id="manifesto"
    >
      <span className="manifesto-eyebrow">THE MANIFESTO</span>

      <motion.h1 style={{ color: color1 }}>
        An algorithm is not a paragraph
      </motion.h1>

      <motion.h1 style={{ color: color2 }}>
        of pseudocode. It is motion —
      </motion.h1>

      <motion.h1 style={{ color: color3 }}>
        sequence of decisions made
      </motion.h1>

      <motion.h1 style={{ color: color4 }}>
        visible. We build the frame between
      </motion.h1>

      <motion.h1 style={{ color: color5 }}>
        input and output, so every
      </motion.h1>

      <motion.h1 style={{ color: color6 }}>
        comparison, every swap, every
      </motion.h1>

      <motion.h1 style={{ color: color7 }}>
        recursive call can be seen, paused,
      </motion.h1>

      <motion.h1 style={{ color: color8 }}>
        and understood, not just memorized.
      </motion.h1>
    </div>
  );
}

export default Manifesto;
