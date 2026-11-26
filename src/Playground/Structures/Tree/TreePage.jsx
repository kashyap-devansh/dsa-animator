import Lesson from "../../../lesson/Lesson";
import TreeStage from "./TreeStage";
import "./TreeStage.css";

// Shared lesson page for BST and AVL operations, driven by useTreeRun.
// Operations chain: when one finishes, the next starts on the resulting tree.

const START_MODES = [
  { id: "empty", label: "Empty" },
  { id: "small", label: "Small tree" },
];

function tagFor(step) {
  const d = step.description.toLowerCase();
  if (d.includes("no rotation")) return "Balanced";
  if (step.rot) return step.rot.done ? "Rotated" : "Rotation";
  if (d.includes("rotat")) return "Rotate";
  if (d.includes("unbalanced") || d.includes("balance")) return "Balance";
  if (d.includes("found")) return "Found";
  if (d.includes("successor")) return "Successor";
  if (d.includes("insert") || d.includes("new node") || d.includes("place")) return "Insert";
  if (d.includes("delet") || d.includes("remov")) return "Delete";
  if (d.includes("compare") || d.includes("<") || d.includes(">")) return "Compare";
  return "Step";
}

// What a rotation does, in words, using the actual node values.
function explainRotation(step) {
  const { dir, at, done } = step.rot;
  const byId = Object.fromEntries(step.nodes.map((n) => [n.id, n]));
  const node = byId[at];
  if (!node) return null;
  const kids = step.nodes.filter((n) => n.parentId === at).sort((a, b) => a.rank - b.rank);
  const parent = byId[node.parentId];

  if (!done) {
    // Before: `node` is too heavy; its child on the heavy side will move up.
    const up = dir === "right" ? kids[0] : kids[kids.length - 1];
    if (!up) return null;
    return dir === "right"
      ? `A right rotation at ${node.value}: its left child ${up.value} moves up into its place, ${node.value} drops down to become ${up.value}'s right child, and ${up.value}'s old right subtree is handed over as ${node.value}'s new left subtree.`
      : `A left rotation at ${node.value}: its right child ${up.value} moves up into its place, ${node.value} drops down to become ${up.value}'s left child, and ${up.value}'s old left subtree is handed over as ${node.value}'s new right subtree.`;
  }

  // After: `node` is the new top of this subtree.
  const down = dir === "right" ? kids[kids.length - 1] : kids[0];
  return `${node.value} is now at the top of this subtree${parent ? ` under ${parent.value}` : ", so it is the new root"}${down ? `, with ${down.value} below it on the ${dir === "right" ? "right" : "left"}` : ""}. Values still read in the same order from left to right, so it is still a valid search tree, just shorter.`;
}

// "headline — detail" becomes title and body.
function split(text) {
  const [head, ...rest] = String(text).split(" — ");
  return { title: head, body: rest.join(" — ") };
}

const TreePage = ({
  blurb,
  complexity,
  filename,
  code,
  run,
  showBalance = false,
  scenarios,
  activeScenario,
  onScenario,
  scenarioLabel,
  shuffleLabel,
  onShuffle,
  inputValue,
  onInputChange,
  actionLabel,
  onAction,
  stats,
  doneMessage,
  startMode,
  onStartMode,
}) => {
  const { current, steps, index } = run;
  const { title, body } = split(current.description);
  const first = index === 0 && run.opNumber === 1;
  // One frame for the whole session, centred on the root. It only grows (and
  // eases out when it does), so the root holds its spot from step to step.
  // Growth comes in coarse steps, so a session zooms out once or twice at most.
  const frame = { half: Math.max(3, 2 * Math.ceil((run.bounds.half - 1) / 2) + 1), depth: Math.max(3, run.bounds.reach) };

  const controls = (
    <>
      {onStartMode && (
        <div className="lx-segment" role="group" aria-label="Start from">
          {START_MODES.map((m) => (
            <button key={m.id} className={startMode === m.id ? "lx-segment-on" : ""} onClick={() => onStartMode(m.id)}>
              {m.label}
            </button>
          ))}
        </div>
      )}

      {scenarios && (
        <div className="lx-segment" role="group" aria-label={scenarioLabel}>
          {scenarios.map((sc) => (
            <button key={sc.id} className={activeScenario === sc.id ? "lx-segment-on" : ""} onClick={() => onScenario(sc)} title={sc.hint}>
              {sc.label ?? sc.id}
            </button>
          ))}
        </div>
      )}

      {onAction && (
        <form
          className="lx-field"
          onSubmit={(e) => {
            e.preventDefault();
            onAction();
          }}
        >
          <label htmlFor="tree-key">key</label>
          <input id="tree-key" type="number" value={inputValue} placeholder="any" onChange={(e) => onInputChange(e.target.value)} />
          <button type="submit">{actionLabel}</button>
        </form>
      )}
    </>
  );

  return (
    <Lesson
      steps={steps}
      playback={{
        index,
        playing: run.playing,
        speed: run.speed,
        setSpeed: run.setSpeed,
        reset: run.reset,
        stepBack: run.stepBack,
        stepForward: run.stepForward,
        togglePlay: run.togglePlay,
        canBack: run.canBack,
        canForward: run.canForward,
      }}
      timeline={(st) => split(st.description).title}
      onShuffle={onShuffle}
      shuffleLabel={shuffleLabel}
      controls={controls}
      complexity={complexity.map((c) => ({ label: c.label, value: c.value }))}
      stage={<TreeStage step={current} bounds={frame} showBalance={showBalance} />}
      narration={{
        tag: run.finished ? "Done" : tagFor(current),
        title,
        body: (
          <>
            {body && <p>{body}</p>}
            {current.rot && !current.labels && <p>{explainRotation(current)}</p>}
            {first && blurb && <p>{blurb}</p>}
          </>
        ),
        notice: run.finished && doneMessage ? doneMessage : run.opNumber > 1 && index === 0 ? `Operation ${run.opNumber} starts on the tree the last one left behind.` : null,
        noticeLabel: run.finished ? "Session over" : "Chained",
      }}
      code={{ lines: code, active: current.codeLine, file: filename }}
      panels={[
        {
          title: "Work done",
          rows: [{ label: "Operation", value: `#${run.opNumber}` }, ...stats.map((st) => ({ label: st.label.charAt(0).toUpperCase() + st.label.slice(1), value: st.value }))],
        },
      ]}
    />
  );
};

export default TreePage;
