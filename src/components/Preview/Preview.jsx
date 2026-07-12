import { useState } from "react";
import "./Preview.css";

const PROJECTS = [
  {
    title: "Sorting Algorithms",
    complexity: "O(n log n) avg",
    detail:
      "Quicksort, merge sort, heap sort and bubble sort rendered bar by bar, with every comparison and swap traced in real time.",
  },
  {
    title: "Searching & Trees",
    complexity: "O(log n) avg",
    detail:
      "Binary search, BSTs and AVL rotations shown as the tree rebalances itself, node by node, in front of you.",
  },
  {
    title: "Graph Traversal",
    complexity: "O(V + E)",
    detail:
      "BFS and DFS sweep across nodes and edges, lighting the frontier as it expands outward through the graph.",
  },
  {
    title: "Dynamic Programming",
    complexity: "O(n·m) table",
    detail:
      "Watch memoization tables fill cell by cell — knapsack, LCS and edit distance, no longer abstract recurrences.",
  },
  {
    title: "Linked Structures",
    complexity: "O(1) insert",
    detail:
      "Stacks, queues and linked lists animate every pointer reassignment as nodes are pushed, popped and rewired.",
  },
];

const Preview = () => {
  const [active, setActive] = useState(1);

  return (
    <div className="preview-wrapper">
      <section className="preview">
        <div className="preview-header">
          <span className="preview-eyebrow">THE LIBRARY</span>
          <h1>What you can visualize</h1>
        </div>

        <div className="preview-grid">
          <div className="preview-list">
            {
              PROJECTS.map((project, index) => (
                <div
                  key={index}
                  className={`preview-item ${active === index ? "active" : ""}`}
                  onMouseEnter={() => setActive(index)}
                >
                  <h2>{project.title}</h2>

                  <span>{project.complexity}</span>
                </div>
              ))
            }
          </div>

          <div className="preview-card">
            <p className="preview-complexity">
              {PROJECTS[active].complexity}
            </p>

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
