import { useState } from "react";
import TreePage from "../../Tree/TreePage";
import { useTreeRun } from "../../Tree/useTreeRun";
import { AVL_INSERT_CODE } from "../../Tree/treeCode";
import { buildAVL, countNodes, fromSpec, insertSteps, parseKey, randomMissingValue, randomValues, snapshotHeight } from "../../Tree/treeEngine";

const generate = (tree, key) => insertSteps(tree, key, { balanced: true });

// Each preset is a valid AVL tree plus the key whose insertion triggers that case.
const INSERT_CASES = [
  { id: "LL", hint: "right rotation", spec: [50, [30, [20], [40]], [70]], key: 10 },
  { id: "RR", hint: "left rotation", spec: [50, [30], [70, [60], [80]]], key: 90 },
  { id: "LR", hint: "left → right", spec: [50, [30, [20], [40]], [70]], key: 45 },
  { id: "RL", hint: "right → left", spec: [50, [30], [70, [60], [80]]], key: 55 },
];

const caseRun = (c) => ({ tree: fromSpec(c.spec), key: c.key });

const MAX_NODES = 15;

const randomRun = (mode = "small") => {
  const tree = mode === "empty" ? null : buildAVL(randomValues(4));
  return { tree, key: randomMissingValue(tree) };
};

const session = {
  nextKey: randomMissingValue,
  shouldStop: (root) => countNodes(root) >= MAX_NODES,
  minBounds: { count: MAX_NODES, depth: 4 },
};

const AVLInsertion = () => {
  const [inputValue, setInputValue] = useState("");
  const [activeCase, setActiveCase] = useState("LL");
  const [startMode, setStartMode] = useState(null);
  const run = useTreeRun(generate, () => caseRun(INSERT_CASES[0]), {
    ...session,
    restart: () => randomRun(startMode ?? "small"),
  });
  const { current } = run;

  const insert = () => {
    run.continueWith(parseKey(inputValue) ?? randomMissingValue(run.result));
    setInputValue("");
    setActiveCase(null);
  };

  const chooseCase = (c) => {
    run.load(caseRun(c));
    setStartMode(null);
    setActiveCase(c.id);
  };

  const shuffle = () => {
    const mode = startMode ?? "small";
    run.load(randomRun(mode));
    setStartMode(mode);
    setActiveCase(null);
  };

  const chooseStart = (mode) => {
    run.load(randomRun(mode));
    setStartMode(mode);
    setActiveCase(null);
  };

  return (
    <TreePage
      eyebrow="avl tree"
      title="AVL Insertion"
      blurb="Insert like a BST, then walk back up. The first node whose balance hits ±2 is fixed with an LL, RR, LR or RL rotation."
      complexity={[
        { label: "time", value: "O(log n)", tone: "time" },
        { label: "rotations", value: "≤ 2", tone: "worst" },
        { label: "space", value: "O(log n)", tone: "space" },
      ]}
      filename="avl_insert.cpp"
      code={AVL_INSERT_CODE}
      run={run}
      showBalance
      legend={["active", "path", "new", "pivot", "rotate"]}
      scenarios={INSERT_CASES}
      scenarioLabel="rotation"
      activeScenario={activeCase}
      onScenario={chooseCase}
      shuffleLabel="New tree"
      onShuffle={shuffle}
      startMode={startMode}
      onStartMode={chooseStart}
      inputValue={inputValue}
      onInputChange={setInputValue}
      actionLabel="Insert"
      onAction={insert}
      doneMessage={`reached ${MAX_NODES} nodes — press play for a new tree`}
      stats={[
        { label: "inserting", value: run.run.key },
        { label: "comparisons", value: current.comparisons },
        { label: "rotations", value: current.rotations },
        { label: "nodes", value: `${current.nodes.length} / ${MAX_NODES}` },
        { label: "height", value: snapshotHeight(current.nodes) },
      ]}
    />
  );
};

export default AVLInsertion;
