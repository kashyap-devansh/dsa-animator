import { useState } from "react";
import TreePage from "../Tree/TreePage";
import { useTreeRun } from "../Tree/useTreeRun";
import { parseKey, randomMissingValue, snapshotHeight } from "../Tree/treeEngine";
import { RB_INSERT_CODE, RB_DELETE_CODE, rbInsertSteps, rbDeleteSteps, rbFromSpec, randomRB, rbCount, randomExistingKey } from "../Tree/rbEngine";

// Red-black insertion and deletion on the shared tree page. Each preset is a
// valid red-black tree plus the key that triggers one fix-up case.

const RULES =
  "Three rules keep it balanced: the root is black; a red node never has a red child; and every path from a node down to an empty leaf passes the same number of black nodes. Together they keep the height under 2·log₂(n + 1).";

// Black nodes from the root down to any empty leaf, counting the leaf.
function blackCount(nodes) {
  const byId = Object.fromEntries(nodes.filter((n) => !n.float).map((n) => [n.id, n]));
  const root = Object.values(byId).find((n) => n.parentId === null || n.parentId === undefined);
  if (!root) return 1;
  let count = 1;
  let n = root;
  while (n) {
    if (!n.red) count++;
    const kids = Object.values(byId).filter((k) => k.parentId === n.id);
    n = kids.sort((a, b) => a.rank - b.rank)[0] ?? null;
  }
  return count;
}

const INSERT_CASES = [
  { id: "Recolour", hint: "red uncle: case 1", spec: [40, "b", [20, "b", [10, "r"], [30, "r"]], [60, "b", [50, "r"], [70, "r"]]], key: 25 },
  { id: "Triangle", hint: "black uncle, bent: case 2 → 3", spec: [40, "b", [20, "b", [10, "r"]], [60, "b"]], key: 15 },
  { id: "Line", hint: "black uncle, straight: case 3", spec: [40, "b", [20, "b", [10, "r"]], [60, "b"]], key: 5 },
  { id: "Root", hint: "recolour reaches the root", spec: [20, "b", [10, "r"], [30, "r"]], key: 5 },
];

const DELETE_CASES = [
  { id: "Red leaf", hint: "removing red costs nothing", spec: [40, "b", [20, "b", [10, "r"], [30, "r"]], [60, "b"]], key: 30 },
  { id: "Red child", hint: "the child turns black", spec: [40, "b", [20, "b", [10, "r"]], [60, "b"]], key: 20 },
  { id: "Case 1", hint: "red sibling", spec: [20, "b", [10, "b"], [40, "r", [30, "b"], [50, "b"]]], key: 10 },
  { id: "Case 2", hint: "black sibling, black children", spec: [40, "b", [20, "r", [10, "b"], [30, "b"]], [60, "b", [50, "r"]]], key: 10 },
  { id: "Case 3", hint: "near child red", spec: [20, "b", [10, "b"], [30, "b", [25, "r"]]], key: 10 },
  { id: "Case 4", hint: "far child red", spec: [20, "b", [10, "b"], [30, "b", null, [40, "r"]]], key: 10 },
];

const caseRun = (c) => ({ tree: rbFromSpec(c.spec), key: c.key });

const stats = (label, run) => [
  { label, value: run.run.key },
  { label: "comparisons", value: run.current.comparisons },
  { label: "rotations", value: run.current.rotations },
  { label: "recolours", value: run.current.recolors },
  { label: "black height", value: blackCount(run.current.nodes) },
  { label: "height", value: snapshotHeight(run.current.nodes) },
];

const legendNote = (step) =>
  step.description.startsWith("insert(") || step.description.startsWith("remove(") ? (
    <p>
      Rings show what each step is doing: <b>coral</b> for a conflict or the node being looked at, <b>amber</b> for the uncle or sibling, <b>green</b> for a node just placed or recoloured.
    </p>
  ) : null;

const MAX_NODES = 15;

export const RBInsertion = () => {
  const [inputValue, setInputValue] = useState("");
  const [activeCase, setActiveCase] = useState(INSERT_CASES[0].id);
  const [startMode, setStartMode] = useState(null);
  const randomRun = (mode = "small") => {
    const tree = mode === "empty" ? null : randomRB(5);
    return { tree, key: randomMissingValue(tree) };
  };
  const run = useTreeRun(rbInsertSteps, () => caseRun(INSERT_CASES[0]), {
    nextKey: randomMissingValue,
    shouldStop: (root) => rbCount(root) >= MAX_NODES,
    restart: () => randomRun(startMode ?? "small"),
    minBounds: { count: MAX_NODES, depth: 4 },
  });

  const load = (mode) => {
    run.load(randomRun(mode));
    setStartMode(mode);
    setActiveCase(null);
  };

  return (
    <TreePage
      blurb={RULES}
      complexity={[
        { label: "time", value: "O(log n)" },
        { label: "rotations", value: "≤ 2" },
      ]}
      filename="rb_insert.cpp"
      code={RB_INSERT_CODE}
      run={run}
      leanCheck={false}
      extraNotice={legendNote}
      scenarios={INSERT_CASES}
      scenarioLabel="case"
      activeScenario={activeCase}
      onScenario={(c) => {
        run.load(caseRun(c));
        setStartMode(null);
        setActiveCase(c.id);
      }}
      shuffleLabel="New tree"
      onShuffle={() => load(startMode ?? "small")}
      startMode={startMode}
      onStartMode={load}
      inputValue={inputValue}
      onInputChange={setInputValue}
      actionLabel="Insert"
      onAction={() => {
        run.continueWith(parseKey(inputValue) ?? randomMissingValue(run.result));
        setInputValue("");
        setActiveCase(null);
      }}
      doneMessage={`reached ${MAX_NODES} nodes — press play for a new tree`}
      stats={stats("inserting", run)}
    />
  );
};

const MIN_NODES = 3;

export const RBDeletion = () => {
  const [inputValue, setInputValue] = useState("");
  const [activeCase, setActiveCase] = useState(DELETE_CASES[0].id);
  const randomRun = () => {
    const tree = randomRB(13);
    return { tree, key: randomExistingKey(tree) };
  };
  const run = useTreeRun(rbDeleteSteps, () => caseRun(DELETE_CASES[0]), {
    nextKey: randomExistingKey,
    shouldStop: (root) => rbCount(root) <= MIN_NODES,
    restart: randomRun,
    minBounds: { count: 13, depth: 4 },
  });

  return (
    <TreePage
      blurb={RULES}
      complexity={[
        { label: "time", value: "O(log n)" },
        { label: "rotations", value: "≤ 3" },
      ]}
      filename="rb_delete.cpp"
      code={RB_DELETE_CODE}
      run={run}
      leanCheck={false}
      extraNotice={legendNote}
      scenarios={DELETE_CASES}
      scenarioLabel="case"
      activeScenario={activeCase}
      onScenario={(c) => {
        run.load(caseRun(c));
        setActiveCase(c.id);
      }}
      shuffleLabel="Random tree"
      onShuffle={() => {
        run.load(randomRun());
        setActiveCase(null);
      }}
      inputValue={inputValue}
      onInputChange={setInputValue}
      actionLabel="Delete"
      onAction={() => {
        if (run.result) run.continueWith(parseKey(inputValue) ?? randomExistingKey(run.result));
        else run.load(randomRun(), true);
        setInputValue("");
        setActiveCase(null);
      }}
      doneMessage={`down to ${MIN_NODES} nodes — press play for a new tree`}
      stats={stats("deleting", run)}
    />
  );
};
