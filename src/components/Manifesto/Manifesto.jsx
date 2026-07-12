import "./Manifesto.css";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

function Manifesto() {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start center", "end center"],
  });

  const color1 = useTransform(scrollYProgress, [0.00, 0.15], ["#262626", "#ffffff"]);
  const color2 = useTransform(scrollYProgress, [0.10, 0.25], ["#262626", "#ffffff"]);
  const color3 = useTransform(scrollYProgress, [0.20, 0.35], ["#262626", "#ffffff"]);
  const color4 = useTransform(scrollYProgress, [0.30, 0.45], ["#262626", "#ffffff"]);
  const color5 = useTransform(scrollYProgress, [0.40, 0.55], ["#262626", "#ffffff"]);
  const color6 = useTransform(scrollYProgress, [0.50, 0.65], ["#262626", "#ffffff"]);
  const color7 = useTransform(scrollYProgress, [0.60, 0.75], ["#262626", "#ffffff"]);
  const color8 = useTransform(scrollYProgress, [0.70, 0.85], ["#262626", "#ffffff"]);

  return (
    <div ref={ref} className="manifesto">
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
        comparison, every sway, every
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
