import { useMemo, useState } from "react";
import { randomArray } from "../../../shared/randomArray";
import { usePlayback } from "../../../shared/usePlayback";
import Lesson from "../../../../lesson/Lesson";
import IsoArray from "../../../../iso/IsoArray";
import { trackIds } from "../../../../iso/trackIds";

const CodeMeanings = {
  1: "Sort the subarray from index l to r.",
  2: "If the range has 0 or 1 elements, it's already sorted — stop.",
  4: "Partition the subarray around a pivot and get its final index p.",
  6: "Recursively sort everything left of the pivot.",
  7: "Recursively sort everything right of the pivot.",
  11: "Pick the last element as the pivot.",
  12: "i marks the last position known to hold a value ≤ pivot; start just before l.",
  14: "Scan j across the subarray, checking each element against the pivot.",
  15: "If the current element belongs in the left (≤ pivot) partition...",
  16: "...advance i to make room for it in the left partition...",
  17: "...and swap it into that position.",
  21: "Move the pivot right after the ≤-pivot region — its final sorted spot.",
  22: "Return the pivot's final index so the caller knows where to split.",
};

function quickSortSteps(input) {
  const arr = [...input];
  const steps = [];
  const n = arr.length;

  let comparisons = 0;
  let swaps = 0;
  let partitionsCount = 0;
  let maxDepth = 0;
  let nodeId = 0;
  const nodes = [];

  function createNode(l, r, depth, parentId) {
    const node = { id: nodeId++, l, r, depth, parentId, status: "pending", p: null };
    nodes.push(node);
    maxDepth = Math.max(maxDepth, depth);
    return node;
  }

  function cloneNodes() {
    return nodes.map((nd) => ({ ...nd }));
  }

  function save(opts) {
    const range = opts.range || [];

    steps.push({
      array: [...arr],
      codeLine: opts.line,
      codeMeaning: CodeMeanings[opts.line] || "",
      description: opts.description,
      explanation: opts.explanation || "",
      range,
      compare: opts.compare || [],
      swap: opts.swap || [],
      pivot: opts.pivotIdx ?? -1,
      pivotVal: opts.pivotVal ?? null,
      placed: opts.placed ?? -1,
      l: range.length ? range[0] : null,
      r: range.length ? range[1] : null,
      i: opts.i ?? null,
      j: opts.j ?? null,
      p: opts.p ?? null,
      phase: opts.phase || "",
      comparisons,
      swaps,
      partitions: partitionsCount,
      maxDepth,
      callTree: cloneNodes(),
      activeNodeId: opts.activeNodeId ?? -1,
    });
  }

  function swapArr(a, b) {
    const t = arr[a];
    arr[a] = arr[b];
    arr[b] = t;
  }

  function partition(l, r, node) {
    const pivotVal = arr[r];

    save({
      line: 11,
      range: [l, r],
      pivotIdx: r,
      pivotVal,
      activeNodeId: node.id,
      phase: "pivot",
      description: `Pivot = ${pivotVal} (index ${r})`,
      explanation: `The last element, ${pivotVal}, is chosen as the pivot. Elements ≤ ${pivotVal} will end up on its left, everything greater on its right.`,
    });

    let i = l - 1;

    save({
      line: 12,
      range: [l, r],
      pivotIdx: r,
      pivotVal,
      i,
      activeNodeId: node.id,
      phase: "init-i",
      description: `i = ${i}`,
      explanation: "i tracks the last position known to hold a value ≤ pivot. It starts one before l, since nothing has been classified yet.",
    });

    for (let j = l; j < r; j++) {
      comparisons++;

      save({
        line: 15,
        range: [l, r],
        pivotIdx: r,
        pivotVal,
        i,
        j,
        compare: [j],
        activeNodeId: node.id,
        phase: "compare",
        description: `Compare arr[${j}] = ${arr[j]} with pivot ${pivotVal}`,
        explanation: `j = ${j} is the element being examined. Is ${arr[j]} ≤ ${pivotVal}?`,
      });

      if (arr[j] <= pivotVal) {
        i++;

        save({
          line: 16,
          range: [l, r],
          pivotIdx: r,
          pivotVal,
          i,
          j,
          compare: [j],
          activeNodeId: node.id,
          phase: "advance-i",
          description: `${arr[j]} ≤ ${pivotVal} → i moves forward`,
          explanation: `${arr[j]} belongs in the left partition, so i advances to ${i} to make room for it.`,
        });

        swapArr(i, j);
        swaps++;

        save({
          line: 17,
          range: [l, r],
          pivotIdx: r,
          pivotVal,
          i,
          j,
          swap: [i, j],
          activeNodeId: node.id,
          phase: "swap",
          description: `Swap index ${i} and ${j}`,
          explanation: `Swapping puts ${arr[i]} into the left (≤ pivot) partition at index ${i}.`,
        });
      } else {
        save({
          line: 15,
          range: [l, r],
          pivotIdx: r,
          pivotVal,
          i,
          j,
          compare: [j],
          activeNodeId: node.id,
          phase: "skip",
          description: `${arr[j]} > ${pivotVal} → leave it, continue`,
          explanation: `${arr[j]} is greater than the pivot, so it stays where it is for now.`,
        });
      }
    }

    swapArr(i + 1, r);
    swaps++;
    partitionsCount++;

    save({
      line: 21,
      range: [l, r],
      i,
      p: i + 1,
      swap: [i + 1, r],
      placed: i + 1,
      activeNodeId: node.id,
      phase: "place-pivot",
      description: `Place pivot at index ${i + 1}`,
      explanation: `The pivot swaps into index ${i + 1}, right after the ≤-pivot region. Everything left of it is ≤ pivot, everything right is greater — the pivot is now in its final sorted position.`,
    });

    save({
      line: 22,
      range: [l, r],
      i,
      p: i + 1,
      placed: i + 1,
      activeNodeId: node.id,
      phase: "return-p",
      description: `Return index ${i + 1}`,
      explanation: "The caller uses this index to split the array into a left subarray and a right subarray.",
    });

    return i + 1;
  }

  function quickSort(l, r, depth, parentId) {
    const node = createNode(l, r, depth, parentId);
    node.status = "active";

    save({
      line: 1,
      range: [l, r],
      activeNodeId: node.id,
      phase: "call",
      description: `quickSort(${l}, ${r})`,
      explanation:
        depth === 0
          ? `Sorting the full array from index ${l} to ${r}.`
          : `Recursively sorting the subarray from index ${l} to ${r}.`,
    });

    if (l >= r) {
      node.status = "done";

      save({
        line: 2,
        range: [l, r],
        activeNodeId: node.id,
        phase: "base",
        description: "Base case reached",
        explanation:
          l === r
            ? "A single element is already sorted — nothing to do."
            : "An empty range needs no sorting.",
      });

      return;
    }

    const p = partition(l, r, node);
    node.p = p;

    save({
      line: 4,
      range: [l, r],
      p,
      activeNodeId: node.id,
      phase: "partition-done",
      description: `Partition index p = ${p}`,
      explanation: `The array is now split at index ${p}: [${l}..${p - 1}] ≤ pivot, and [${p + 1}..${r}] > pivot.`,
    });

    save({
      line: 6,
      range: [l, Math.max(l, p - 1)],
      p,
      activeNodeId: node.id,
      phase: "recurse-left",
      description: `Now recursively sort the LEFT subarray [${l}, ${p - 1}]`,
      explanation: "The left partition still needs to be sorted, so quickSort calls itself on it.",
    });

    quickSort(l, p - 1, depth + 1, node.id);

    save({
      line: 7,
      range: [Math.min(r, p + 1), r],
      p,
      activeNodeId: node.id,
      phase: "recurse-right",
      description: `Now recursively sort the RIGHT subarray [${p + 1}, ${r}]`,
      explanation: "Now the right partition gets the same treatment.",
    });

    quickSort(p + 1, r, depth + 1, node.id);

    node.status = "done";

    save({
      line: 8,
      range: [l, r],
      activeNodeId: node.id,
      phase: "call-done",
      description: `quickSort(${l}, ${r}) complete`,
      explanation: "Both halves are sorted and the pivot is placed — this range is fully sorted.",
    });
  }

  save({
    line: 1,
    range: [0, n - 1],
    activeNodeId: -1,
    phase: "start",
    description: "Started Quick Sort",
    explanation: "Quick Sort repeatedly picks a pivot, partitions around it, and recurses on the two sides.",
  });

  quickSort(0, n - 1, 0, null);

  save({
    line: 23,
    range: [0, n - 1],
    activeNodeId: -1,
    phase: "done",
    description: "Array Sorted!",
    explanation:
      "Every pivot has been placed in its final position, and each smaller subarray was recursively sorted — so the whole array is sorted.",
  });

  return steps;
}

const CODE = [
  "void quickSort(vector<int>& arr, int l, int r) {",
  "  if (l >= r) return;",
  "",
  "  int p = partition(arr, l, r);",
  "",
  "  quickSort(arr, l, p - 1);",
  "  quickSort(arr, p + 1, r);",
  "}",
  "",
  "int partition(vector<int>& arr, int l, int r) {",
  "  int pivot = arr[r];",
  "  int i = l - 1;",
  "",
  "  for (int j = l; j < r; j++) {",
  "    if (arr[j] <= pivot) {",
  "      i++;",
  "      swap(arr[i], arr[j]);",
  "    }",
  "  }",
  "",
  "  swap(arr[i + 1], arr[r]);",
  "  return i + 1;",
  "}",
];

const TAGS = {
  start: "Idea",
  call: "Recurse",
  base: "Base case",
  pivot: "Pivot",
  "init-i": "Partition",
  compare: "Compare",
  "advance-i": "Partition",
  swap: "Swap",
  skip: "Partition",
  "place-pivot": "Place",
  "return-p": "Partition",
  "partition-done": "Split",
  "recurse-left": "Recurse",
  "recurse-right": "Recurse",
  "call-done": "Recurse",
  done: "Sorted",
};

const QuickSort = () => {
  const [seed, setSeed] = useState(() => randomArray(10));
  const steps = useMemo(() => quickSortSteps(seed), [seed]);
  const ids = useMemo(() => trackIds(steps.map((s) => s.array)), [steps]);
  const playback = usePlayback(steps.length);
  const { index, reset } = playback;
  const s = steps[index];
  const isDone = s.phase === "done";

  // Every pivot placed so far stays placed.
  const placed = useMemo(() => {
    const set = new Set();
    for (let k = 0; k <= index; k++) {
      if (steps[k].placed >= 0) set.add(steps[k].placed);
      if (steps[k].phase === "base" && steps[k].l === steps[k].r) set.add(steps[k].l);
    }
    return set;
  }, [steps, index]);

  const shuffle = () => {
    setSeed(randomArray(10));
    reset();
  };

  const partitioning = s.l !== null && s.r !== null && s.l <= s.r;
  const inRange = (k) => partitioning && k >= s.l && k <= s.r;
  // While i has just moved but the swap hasn't happened, cell i doesn't hold a small value yet.
  const leftEnd = (s.i ?? (s.l ?? 0) - 1) - (s.phase === "advance-i" ? 1 : 0);

  const cells = s.array.map((value, k) => {
    let tone = "idle";
    let lift = 0;
    if (isDone || placed.has(k)) tone = "sage";
    else if (k === s.pivot) tone = "coral";
    else if (s.swap.includes(k)) {
      tone = "amber";
      lift = 0.55;
    } else if (s.compare.includes(k)) {
      tone = "soft";
      lift = 0.4;
    } else if (inRange(k) && s.i !== null && k >= s.l && k <= leftEnd) tone = "soft";
    else if (partitioning && !inRange(k)) tone = "ghost";
    return { id: ids[index][k], value, tone, lift };
  });

  const pointers = [];
  if (s.i !== null && s.i >= 0) pointers.push({ index: s.i, text: "i", tone: "coral" });
  if (s.j !== null) pointers.push({ index: s.j, text: "j" });
  if (s.p !== null && s.p !== undefined) pointers.push({ index: s.p, text: "p", tone: "sage" });

  const callouts = [];
  if (s.phase === "pivot") callouts.push({ index: s.pivot, text: "the pivot" });
  else if (s.compare.length) callouts.push({ index: s.compare[0], text: s.phase === "skip" ? `${s.array[s.j]} > ${s.pivotVal}: leave it` : `${s.array[s.j]} vs ${s.pivotVal}` });
  else if (s.phase === "place-pivot") callouts.push({ index: s.placed, text: "in its final place", tone: "sage" });
  else if (s.phase === "base" && s.l === s.r) callouts.push({ index: s.l, text: "one item: sorted", tone: "sage", small: true });

  const below = partitioning && !isDone ? s.array.slice(s.l, Math.max(s.l, leftEnd + 1)) : [];
  if (s.phase === "advance-i") below.push(s.array[s.j]);
  const above =
    partitioning && s.j !== null
      ? s.array.slice(leftEnd + 1, s.j + (s.phase === "skip" ? 1 : 0)).filter((_, k) => !(s.phase === "advance-i" && leftEnd + 1 + k === s.j))
      : [];

  return (
    <Lesson
      steps={steps}
      playback={playback}
      onShuffle={shuffle}
      complexity={[
        { label: "time", value: "O(n log n)" },
        { label: "worst", value: "O(n²)" },
        { label: "space", value: "O(log n)" },
      ]}
      stage={<IsoArray cells={cells} slots={s.array.length} pointers={pointers} callouts={callouts} indexHighlight={s.compare} label="Quick sort array" />}
      narration={{
        tag: TAGS[s.phase],
        title: s.description,
        body: <p>{s.explanation}</p>,
        notice: s.codeMeaning,
        noticeLabel: `Line ${s.codeLine}`,
      }}
      code={{ lines: CODE, active: s.codeLine, file: "quick_sort.cpp" }}
      panels={[
        {
          title: "Around the pivot",
          rows: [
            { label: "Pivot", value: s.pivotVal, tone: s.pivotVal !== null ? "coral" : undefined },
            { label: "Smaller, on its left", value: s.pivotVal !== null ? below : [] },
            { label: "Bigger, already seen", value: s.pivotVal !== null ? above : [] },
          ],
        },
        {
          title: "Work done",
          rows: [
            { label: "Comparisons", value: s.comparisons },
            { label: "Swaps", value: s.swaps },
            { label: "Partitions", value: s.partitions },
            { label: "Deepest call", value: s.maxDepth },
          ],
        },
      ]}
      legend={[
        { label: "Pivot", tone: "coral" },
        { label: "Being compared / ≤ pivot", tone: "soft" },
        { label: "Swapping", tone: "amber" },
        { label: "In final place", tone: "sage" },
        { label: "Outside this call", tone: "ghost" },
      ]}
    />
  );
};

export default QuickSort;
