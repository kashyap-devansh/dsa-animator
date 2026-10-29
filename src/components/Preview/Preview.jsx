import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MiniSort, MiniBinarySearch, MiniTree, MiniList, MiniQueue } from "../MiniViz/MiniViz";
import { Reveal } from "../shared/effects";
import { trackPointer } from "../shared/pointer";
import "./Preview.css";

const PROJECTS = [
  {
    title: "Sorting Algorithms",
    complexity: "O(n log n) avg",
    Viz: MiniSort,
    detail:
      "Bubble, selection, insertion, merge, quick, radix, bucket and counting sort rendered bar by bar, with every comparison and swap traced in real time.",
  },
  {
    title: "Searching",
    complexity: "O(log n)",
    Viz: MiniBinarySearch,
    detail:
      "Linear, binary, jump, interpolation, exponential and Fibonacci search — watch the search window shrink with every probe.",
  },
  {
    title: "BST & AVL Trees",
    complexity: "O(log n)",
    Viz: MiniTree,
    detail:
      "Insert, search and delete in binary search trees, plus every AVL rotation — LL, RR, LR, RL — as the tree rebalances itself.",
  },
  {
    title: "Linked Lists",
    complexity: "O(1) insert",
    Viz: MiniList,
    detail:
      "Insert and delete at the head, tail or any position, with every pointer reassignment animated as nodes are rewired.",
  },
  {
    title: "Stacks & Queues",
    complexity: "O(1) push",
    Viz: MiniQueue,
    detail:
      "Push, pop, enqueue and dequeue on LIFO and FIFO structures — plus hash tables with chaining and probing.",
  },
];

const Preview = () => {
  const [active, setActive] = useState(0);

  return (
    <div
      className="preview-wrapper"
      id="visualizers"
    >
      <section className="preview">
        <Reveal className="preview-header">
          <span className="preview-eyebrow">THE LIBRARY</span>
          <h1>What you can visualize</h1>
        </Reveal>

        <div className="preview-grid">
          <div className="preview-list">
            {
              PROJECTS.map((project, index) => (
                <div
                  key={index}
                  className={`preview-item ${active === index ? "active" : ""}`}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => setActive(index)}
                >
                  <h2>{project.title}</h2>

                  <span>{project.complexity}</span>
                </div>
              ))
            }
          </div>

          <div className="preview-card spotlight" onPointerMove={trackPointer}>
            <p className="preview-complexity">
              <span className="preview-live" /> live · {PROJECTS[active].complexity}
            </p>

            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                className="preview-stage"
                initial={{ opacity: 0, scale: 0.97, filter: "blur(6px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.98, filter: "blur(6px)" }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                {(() => {
                  const Viz = PROJECTS[active].Viz;
                  return <Viz />;
                })()}
              </motion.div>
            </AnimatePresence>

            <div className="preview-content">
              <h2>{PROJECTS[active].title}</h2>

              <p>{PROJECTS[active].detail}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Preview;
