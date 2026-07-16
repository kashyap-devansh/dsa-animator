import { motion, useAnimationControls } from "framer-motion";
import { useEffect } from "react";
import "./LoadingScreen.css";

const container = {
  enter: {
    transition: {
      staggerChildren: 0.15,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.15,
      staggerDirection: -1,
    },
  },
};

const word = {
  initial: {
    y: "100%",
    opacity: 0,
  },
  enter: {
    y: "0%",
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    y: "-100%",
    opacity: 0,
    transition: {
      duration: 0.5,
      ease: [0.76, 0, 0.24, 1],
    },
  },
};

const LoadingScreen = ({ onComplete }) => {
  const textControls = useAnimationControls();
  const barControls = useAnimationControls();
  const screenControls = useAnimationControls();

  useEffect(() => {
    const sequence = async () => {
      await Promise.all([
        textControls.start("enter"),

        barControls.start({
          width: "100%",
          transition: {
            duration: 0.9,
            ease: "linear",
          },
        }),
      ]);

      await Promise.all([
        textControls.start("exit"),

        screenControls.start({
          y: "-100%",
          transition: {
            duration: 1,
            ease: [0.76, 0, 0.24, 1],
          },
        }),
      ]);

      onComplete?.();
    };
    sequence();
  }, []);

  return (
    <motion.div
      className="loading-screen"
      initial={{ y: "0%" }}
      animate={screenControls}
    >
      <motion.div
        className="loading-text-wrapper"
        variants={container}
        initial="initial"
        animate={textControls}
      >
        <span className="word-mask">
          <motion.span className="loading-text" variants={word}>
            Are
          </motion.span>
        </span>

        <span className="word-mask">
          <motion.span className="loading-text" variants={word}>
            &nbsp;you
          </motion.span>
        </span>

        <span className="word-mask">
          <motion.span className="loading-text" variants={word}>
            &nbsp;ready?
          </motion.span>
        </span>
      </motion.div>

      <div className="loading-bar">
        <motion.div
          className="loading-value"
          initial={{ width: "2%" }}
          animate={barControls}
        />
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
