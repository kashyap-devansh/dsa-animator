import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MiniSort, MiniBinarySearch, MiniTree, MiniList, MiniQueue } from "../../components/MiniViz/MiniViz";
import { trackPointer } from "../../components/shared/pointer";

const SLIDES = [
  { title: "Bubble Sort", tag: "sorting", path: "/playground/sorting/bubble-sort", Viz: MiniSort },
  { title: "Binary Search", tag: "searching", path: "/playground/searching/binary-search", Viz: MiniBinarySearch },
  { title: "BST Search", tag: "binary search tree", path: "/playground/bst/search", Viz: MiniTree },
  { title: "Insert at Head", tag: "linked list", path: "/playground/linkedList/insert-at-head", Viz: MiniList },
  { title: "Enqueue", tag: "queue", path: "/playground/queue/enqueue", Viz: MiniQueue },
];

const DURATION = 7;

// "Now rendering" card: cycles through live previews of real visualizers.
const Showcase = () => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  const slide = SLIDES[index];
  const { Viz } = slide;

  useEffect(() => {
    if (paused || reduced) return;
    const timer = setTimeout(() => setIndex((i) => (i + 1) % SLIDES.length), DURATION * 1000);
    return () => clearTimeout(timer);
  }, [index, paused, reduced]);

  return (
    <div
      className="pg-showcase spotlight"
      onPointerMove={trackPointer}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      <div className="pg-showcase-head">
        <span className="pg-showcase-eyebrow">
          <i className="pg-showcase-live" /> now rendering
        </span>

        <div className="pg-showcase-tabs">
          {SLIDES.map((s, i) => (
            <button
              key={s.path}
              type="button"
              className={`pg-showcase-tab ${i === index ? "pg-showcase-tab-active" : ""}`}
              onClick={() => setIndex(i)}
              aria-label={s.title}
            />
          ))}
        </div>
      </div>

      <div className="pg-showcase-stage">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            className="pg-showcase-viz"
            initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <Viz />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="pg-showcase-foot">
        <div>
          <span className="pg-showcase-tag">{slide.tag}</span>
          <h3 className="pg-showcase-title">{slide.title}</h3>
        </div>

        <Link to={slide.path} className="pg-showcase-open">
          Open <span aria-hidden="true">→</span>
        </Link>
      </div>

      {!reduced && (
        <motion.span
          key={`${index}-${paused}`}
          className="pg-showcase-progress"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: paused ? 0 : 1 }}
          transition={{ duration: paused ? 0.2 : DURATION, ease: "linear" }}
        />
      )}
    </div>
  );
};

export default Showcase;
