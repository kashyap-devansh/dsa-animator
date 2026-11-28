import { useState } from "react";
import TreePage from "../../Tree/TreePage";
import { useTreeRun } from "../../Tree/useTreeRun";
import { BST_INSERT_CODE } from "../../Tree/treeCode";
import { balancedKey, countNodes, insertSteps, parseKey, randomBalancedBST, snapshotHeight } from "../../Tree/treeEngine";

const generate = (tree, key) => insertSteps(tree, key);

const MAX_NODES = 15;

const freshRun = (mode = "small") => {
  // Automatic trees and keys stay balanced; a key you type goes wherever BST rules put it.
  const tree = mode === "empty" ? null : randomBalancedBST(4);
  return { tree, key: balancedKey(tree) };
};

const session = {
  nextKey: balancedKey,
  shouldStop: (root) => countNodes(root) >= MAX_NODES,
  minBounds: { count: MAX_NODES, depth: 4 },
};

const BSTInsert = () => {
  const [inputValue, setInputValue] = useState("");
  const [startMode, setStartMode] = useState("small");
  const run = useTreeRun(generate, freshRun, { ...session, restart: () => freshRun(startMode) });
  const { current } = run;

  const insert = () => {
    run.continueWith(parseKey(inputValue) ?? balancedKey(run.result));
    setInputValue("");
  };

  const shuffle = () => {
    run.load(freshRun(startMode));
  };

  const chooseStart = (mode) => {
    setStartMode(mode);
    run.load(freshRun(mode));
  };

  return (
    <TreePage
      eyebrow="binary search tree"
      title="BST Insertion"
      blurb="Compare against each node and step left or right until an empty spot opens up — the new key always lands as a leaf."
      complexity={[
        { label: "time (avg)", value: "O(log n)", tone: "time" },
        { label: "time (worst)", value: "O(n)", tone: "worst" },
        { label: "space", value: "O(h)", tone: "space" },
      ]}
      filename="bst_insert.cpp"
      code={BST_INSERT_CODE}
      run={run}
      legend={["active", "path", "new"]}
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
        { label: "nodes", value: `${current.nodes.length} / ${MAX_NODES}` },
        { label: "height", value: snapshotHeight(current.nodes) },
      ]}
    />
  );
};

export default BSTInsert;
