import { motion } from "framer-motion";
import "./LoadingScreen.css";

export default function LoadingScreen() {
  return (
    <motion.div
      className="loading-screen"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* color: #111315*/}
      <h1 className="loading-text">Are you ready?</h1>
      <div className="loading-bar">
        <div className="loading-value"></div>
      </div>
    </motion.div>
  );
}
