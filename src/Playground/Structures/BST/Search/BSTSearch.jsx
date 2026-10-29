import { useState } from "react";
import TreePage from "../../Tree/TreePage";
import { useTreeRun } from "../../Tree/useTreeRun";
import { BST_SEARCH_CODE } from "../../Tree/treeCode";
import { buildBST, collectValues, parseKey, randomMissingValue, randomValues, searchSteps, snapshotHeight } from "../../Tree/treeEngine";

const generate = (tree, key) => searchSteps(tree, key);

// Mostly pick a key that exists so the "found" path shows up more often.
const randomTarget = (root) => {
  const values = collectValues(root);

  if (values.length && Math.random() < 0.75) {
    return values[Math.floor(Math.random() * values.length)];
  }

  return randomMissingValue(root);
};

const freshRun = () => {
  const tree = buildBST(randomValues(9));
  return { tree, key: randomTarget(tree) };
};

const BSTSearch = () => {
  const [inputValue, setInputValue] = useState("");
  const run = useTreeRun(generate, freshRun);
  const { current } = run;

  const search = () => {
    run.continueWith(parseKey(inputValue) ?? randomTarget(run.result));
    setInputValue("");
  };

  const shuffle = () => {
    run.load(freshRun());
  };

  return (
    <TreePage
      eyebrow="binary search tree"
      title="BST Search"
      blurb="Every comparison throws away half of what's left — smaller keys live to the left, larger ones to the right."
      complexity={[
        { label: "time (avg)", value: "O(log n)", tone: "time" },
        { label: "time (worst)", value: "O(n)", tone: "worst" },
        { label: "space", value: "O(1)", tone: "space" },
      ]}
      filename="bst_search.cpp"
      code={BST_SEARCH_CODE}
      run={run}
      legend={["active", "path", "found"]}
      shuffleLabel="New tree"
      onShuffle={shuffle}
      inputValue={inputValue}
      onInputChange={setInputValue}
      actionLabel="Search"
      onAction={search}
      stats={[
        { label: "target", value: run.run.key },
        { label: "comparisons", value: current.comparisons },
        { label: "nodes", value: current.nodes.length },
        { label: "height", value: snapshotHeight(current.nodes) },
      ]}
    />
  );
};

export default BSTSearch;
