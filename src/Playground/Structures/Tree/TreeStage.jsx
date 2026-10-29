import { AnimatePresence, motion } from "framer-motion";
import { formatBf } from "./treeEngine";
import { SpeedDelay } from "../../shared/speedDelay";
import { ROLE_STYLE } from "./roleStyle";
import "./TreeStage.css";

const UNIT_X = 45;
const UNIT_Y = 74;
const PAD = 40;
const PAD_X = 24;
const RADIUS = 19;

const TreeStage = ({ step, bounds, speed, showBalance, emptyLabel = "empty tree" }) => {
  const width = Math.max(bounds.count, 5) * UNIT_X + PAD_X * 2;
  const height = (Math.max(bounds.depth, 2) + 1) * UNIT_Y + PAD;
  const duration = Math.min(0.5, (SpeedDelay[speed] / 1000) * 0.75);
  const transition = { duration, ease: [0.22, 1, 0.36, 1] };

  const n = step.nodes.length;
  // `span` lets callers pin ranks to a precomputed full layout (e.g. recursion trees).
  const span = step.span ?? n;
  const pos = Object.fromEntries(
    step.nodes.map((node) => [
      node.id,
      { x: width / 2 + (node.rank - (span - 1) / 2) * UNIT_X, y: PAD + node.depth * UNIT_Y },
    ])
  );

  return (
    <div className="tr-canvas">
      {step.badge && <span className="tr-badge">{step.badge}</span>}

      {n === 0 && <p className="tr-empty">{emptyLabel}</p>}

      <svg className="tr-svg" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
        <AnimatePresence>
          {step.nodes.map((node) => {
            const parent = pos[node.parentId];
            if (!parent) return null;
            const child = pos[node.id];

            return (
              <motion.line
                key={`edge-${node.id}`}
                initial={{ x1: parent.x, y1: parent.y, x2: parent.x, y2: parent.y, opacity: 0 }}
                animate={{ x1: parent.x, y1: parent.y, x2: child.x, y2: child.y, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={transition}
                stroke="#2e2e33"
                strokeWidth="2"
              />
            );
          })}
        </AnimatePresence>

        <AnimatePresence>
          {step.nodes.map((node) => {
            const role = step.marks[node.id] || "default";
            const style = ROLE_STYLE[role];
            const { x, y } = pos[node.id];
            const unbalanced = Math.abs(node.bf) > 1;

            return (
              <motion.g
                key={node.id}
                initial={{ x, y, opacity: 0, scale: 0.4 }}
                animate={{ x, y, opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.4 }}
                transition={transition}
              >
                <circle
                  r={RADIUS}
                  fill={style.fill}
                  stroke={style.stroke}
                  strokeWidth="2"
                  strokeDasharray={role === "remove" ? "4 3" : undefined}
                  style={{ transition: "fill 0.25s, stroke 0.25s" }}
                />
                <text y="4.5" textAnchor="middle" className="tr-node-value">
                  {node.value}
                </text>

                {node.note && (
                  <text y={RADIUS + 14} textAnchor="middle" className="tr-node-note">
                    {node.note}
                  </text>
                )}

                {showBalance && (
                  <text
                    x={RADIUS + 3}
                    y={-RADIUS + 2}
                    className={`tr-node-bf ${unbalanced ? "tr-node-bf-bad" : ""}`}
                  >
                    {formatBf(node.bf)}
                  </text>
                )}
              </motion.g>
            );
          })}
        </AnimatePresence>
      </svg>
    </div>
  );
};

export default TreeStage;
