import { useState } from "react";
import TreePage from "../../Tree/TreePage";
import { useTreeRun } from "../../Tree/useTreeRun";
import { BST_DELETE_CODE } from "../../Tree/treeCode";
import { buildBST, collectNodes, countNodes, deleteSteps, parseKey, randomValues, snapshotHeight } from "../../Tree/treeEngine";

const generate = (tree, key) => deleteSteps(tree, key);

const childCount = (n) => (n.left ? 1 : 0) + (n.right ? 1 : 0);

const CASES = [
  { id: "Leaf", hint: "just unlink", children: 0 },
  { id: "One child", hint: "child moves up", children: 1 },
  { id: "Two children", hint: "inorder successor", children: 2 },
];

const pick = (list) => list[Math.floor(Math.random() * list.length)];

// Finds a node with the requested number of children, growing a new tree if needed.
function runFor(tree, children) {
  for (let attempt = 0; attempt < 50; attempt++) {
    const matches = collectNodes(tree).filter((n) => children === undefined || childCount(n) === children);
    if (matches.length) return { tree, key: pick(matches).value };
    tree = buildBST(randomValues(15));
  }

  return { tree, key: collectNodes(tree)[0].value };
}

const MIN_NODES = 3;

const freshRun = () => runFor(buildBST(randomValues(15)), 2);

const session = {
  nextKey: (root) => pick(collectNodes(root)).value,
  shouldStop: (root) => countNodes(root) <= MIN_NODES,
  restart: freshRun,
  minBounds: { count: 15, depth: 4 },
};

const BSTDelete = () => {
  const [inputValue, setInputValue] = useState("");
  const [activeCase, setActiveCase] = useState("Two children");
  const run = useTreeRun(generate, freshRun, session);
  const { current } = run;

  const remove = () => {
    const key = parseKey(inputValue);
    const next = key !== null ? { tree: run.result, key } : runFor(run.result);

    if (next.tree === run.result) run.continueWith(next.key);
    else run.load(next, true);
    setInputValue("");
    setActiveCase(null);
  };

  const chooseCase = (c) => {
    const next = runFor(run.result, c.children);

    if (next.tree === run.result) run.continueWith(next.key, false);
    else run.load(next);
    setActiveCase(c.id);
  };

  const shuffle = () => {
    run.load(freshRun());
    setActiveCase("Two children");
  };

  return (
    <TreePage
      eyebrow="binary search tree"
      title="BST Deletion"
      blurb="A leaf is just unlinked, a single child slides up, and a node with two children borrows its inorder successor."
      complexity={[
        { label: "time (avg)", value: "O(log n)", tone: "time" },
        { label: "time (worst)", value: "O(n)", tone: "worst" },
        { label: "space", value: "O(h)", tone: "space" },
      ]}
      filename="bst_delete.cpp"
      code={BST_DELETE_CODE}
      run={run}
      legend={["active", "path", "found", "remove", "successor", "rotate"]}
      scenarios={CASES}
      scenarioLabel="case"
      activeScenario={activeCase}
      onScenario={chooseCase}
      shuffleLabel="New tree"
      onShuffle={shuffle}
      inputValue={inputValue}
      onInputChange={setInputValue}
      actionLabel="Delete"
      onAction={remove}
      doneMessage={`down to ${MIN_NODES} nodes — press play for a new tree`}
      stats={[
        { label: "deleting", value: run.run.key },
        { label: "comparisons", value: current.comparisons },
        { label: "nodes", value: current.nodes.length },
        { label: "stops at", value: MIN_NODES },
        { label: "height", value: snapshotHeight(current.nodes) },
      ]}
    />
  );
};

export default BSTDelete;
