import { motion } from "framer-motion";
import "./CTA.css";

const CTA = () => {
  return (
    <section className="cta">
      <div className="bg">
        <motion.div
          className="blob orange"
          animate={{
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="blob green"
          animate={{
            opacity: [0.25, 0.1, 0.25],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="cta-content">
        <p className="cta-eyebrow">READY WHEN YOU ARE</p>

        <h1>
          Stop reading
          <br />
          pseudocode.
          <br />
          Start watching
          <br />
          it run.
        </h1>

        <motion.button
          className="cta-btn"
          animate={{
            y: [0, -35, -18, -45, -25, 0],
            x: [0, 10, -10, 8, -6, 0],
            rotate: [0, 3, -2, 2.5, -1, 0],
            scale: [1, 1.04, 1.02, 1.06, 1.03, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          whileHover={{
            scale: 1.35,
            transition: {
              duration: 0,
            },
          }}
        >
          Launch the Animator
        </motion.button>
      </div>
    </section>
  );
}

export default CTA;

