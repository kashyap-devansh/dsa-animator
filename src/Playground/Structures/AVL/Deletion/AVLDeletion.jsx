import { useState } from "react";
import TreePage from "../../Tree/TreePage";
import { useTreeRun } from "../../Tree/useTreeRun";
import { AVL_DELETE_CODE } from "../../Tree/treeCode";
import { buildAVL, collectValues, countNodes, deleteSteps, fromSpec, parseKey, randomValues, snapshotHeight } from "../../Tree/treeEngine";

const generate = (tree, key) => deleteSteps(tree, key, { balanced: true });

// R = deleted from the right subtree, L = from the left; the number is the
// balance factor of the sibling child that has to rotate up.
const DELETE_CASES = [
  { id: "R0", hint: "right rotation", spec: [50, [30, [20, [10], [25]], [40, [35], [45]]], [70, null, [80]]], key: 80 },
  { id: "R1", hint: "right rotation", spec: [50, [30, [20, [10], [25]], [40]], [70, null, [80]]], key: 80 },
  { id: "R-1", hint: "left → right", spec: [50, [30, [20], [40, [35], [45]]], [70, null, [80]]], key: 80 },
  { id: "L0", hint: "left rotation", spec: [50, [30, [20]], [70, [60, [55], [65]], [80, [75], [90]]]], key: 20 },
  { id: "L1", hint: "right → left", spec: [50, [30, [20]], [70, [60, [55], [65]], [80]]], key: 20 },
  { id: "L-1", hint: "left rotation", spec: [50, [30, [20]], [70, [60], [80, [75], [90]]]], key: 20 },
];

const caseRun = (c) => ({ tree: fromSpec(c.spec), key: c.key });

const randomExisting = (root) => {
  const values = collectValues(root);
  return values[Math.floor(Math.random() * values.length)];
};

const MIN_NODES = 3;

const randomRun = () => {
  const tree = buildAVL(randomValues(15));
  return { tree, key: randomExisting(tree) };
};

const session = {
  nextKey: randomExisting,
  shouldStop: (root) => countNodes(root) <= MIN_NODES,
  restart: randomRun,
  minBounds: { count: 15, depth: 4 },
};

const AVLDeletion = () => {
  const [inputValue, setInputValue] = useState("");
  const [activeCase, setActiveCase] = useState("R0");
  const run = useTreeRun(generate, () => caseRun(DELETE_CASES[0]), session);
  const { current } = run;

  const remove = () => {
    if (run.result) run.continueWith(parseKey(inputValue) ?? randomExisting(run.result));
    else run.load(randomRun(), true);
    setInputValue("");
    setActiveCase(null);
  };

  const chooseCase = (c) => {
    run.load(caseRun(c));
    setActiveCase(c.id);
  };

  const shuffle = () => {
    run.load(randomRun());
    setActiveCase(null);
  };

  return (
    <TreePage
      eyebrow="avl tree"
      title="AVL Deletion"
      blurb="Delete like a BST, then rebalance every ancestor on the way up. R/L says which side lost a node; 0, 1, -1 is the sibling's balance."
      complexity={[
        { label: "time", value: "O(log n)", tone: "time" },
        { label: "rotations", value: "O(log n)", tone: "worst" },
        { label: "space", value: "O(log n)", tone: "space" },
      ]}
      filename="avl_delete.cpp"
      code={AVL_DELETE_CODE}
      run={run}
      showBalance
      legend={["active", "path", "found", "remove", "successor", "pivot", "rotate"]}
      scenarios={DELETE_CASES}
      scenarioLabel="rotation"
      activeScenario={activeCase}
      onScenario={chooseCase}
      shuffleLabel="Random tree"
      onShuffle={shuffle}
      inputValue={inputValue}
      onInputChange={setInputValue}
      actionLabel="Delete"
      onAction={remove}
      doneMessage={`down to ${MIN_NODES} nodes — press play for a new tree`}
      stats={[
        { label: "deleting", value: run.run.key },
        { label: "comparisons", value: current.comparisons },
        { label: "rotations", value: current.rotations },
        { label: "nodes", value: current.nodes.length },
        { label: "height", value: snapshotHeight(current.nodes) },
      ]}
    />
  );
};

export default AVLDeletion;
