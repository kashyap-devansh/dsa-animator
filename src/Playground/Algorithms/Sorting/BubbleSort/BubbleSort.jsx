import { useMemo, useState } from "react";
import { randomArray } from "../../../shared/randomArray";
import { usePlayback } from "../../../shared/usePlayback";
import Lesson from "../../../../lesson/Lesson";
import IsoArray from "../../../../iso/IsoArray";
import { trackIds } from "../../../../iso/trackIds";

const SIZE = 8;

const CODE = [
  "void bubbleSort(vector<int>& arr) {",
  "  int n = arr.size();",
  "  for (int i = 0; i < n - 1; i++) {",
  "    for (int j = 0; j < n - 1 - i; j++) {",
  "      if (arr[j] > arr[j + 1]) {",
  "        swap(arr[j], arr[j + 1]);",
  "      }",
  "    }",
  "  }",
  "}",
];

function bubbleSortSteps(input) {
  const arr = [...input];
  const n = arr.length;
  const steps = [];
  let comparisons = 0;
  let swaps = 0;

  const save = (s) => steps.push({ array: [...arr], compare: [], swapped: false, pass: 0, comparisons, swaps, ...s });

  save({
    phase: "idea",
    line: 1,
    sortedFrom: n,
    title: "Let the big values bubble up",
    body: `Walk the row comparing neighbours. Whenever the left one is bigger, swap them. By the end of one pass, the largest of the ${n} values has been carried all the way to the right.`,
    notice: "Each pass fixes one more value at the end, so the unsorted part shrinks by one every time.",
  });

  for (let i = 0; i < n - 1; i++) {
    let swappedThisPass = false;

    for (let j = 0; j < n - 1 - i; j++) {
      comparisons++;
      const a = arr[j];
      const b = arr[j + 1];
      save({
        phase: "compare",
        line: 5,
        compare: [j, j + 1],
        pass: i + 1,
        sortedFrom: n - i,
        title: `Compare ${a} and ${b}`,
        body: a > b ? `${a} is bigger than ${b}, so they are in the wrong order.` : `${a} is not bigger than ${b}. They are already in order, so leave them.`,
      });

      if (a > b) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swaps++;
        swappedThisPass = true;
        save({
          phase: "swap",
          line: 6,
          compare: [j, j + 1],
          swapped: true,
          pass: i + 1,
          sortedFrom: n - i,
          title: `Swap: ${b} goes left, ${a} goes right`,
          body: `${a} keeps moving right. If it is the biggest value left, it will ride all the way to index ${n - 1 - i}.`,
        });
      }
    }

    save({
      phase: "settled",
      line: 3,
      pass: i + 1,
      sortedFrom: n - i - 1,
      title: `${arr[n - 1 - i]} is in its final place`,
      body: `Pass ${i + 1} is done. The biggest value still unsorted has reached index ${n - 1 - i}, and it never moves again.`,
      notice: swappedThisPass ? null : "This pass made no swaps at all, so the row is already sorted. A common tweak stops early here.",
    });
  }

  save({
    phase: "done",
    line: 10,
    sortedFrom: 0,
    title: "Sorted",
    body: `Every value has bubbled into place. That took ${comparisons} comparisons and ${swaps} swaps.`,
    notice: "Comparisons grow with n², so doubling the input roughly quadruples the work.",
  });

  return steps;
}

const TAGS = { idea: "Idea", compare: "Compare", swap: "Swap", settled: "Pass done", done: "Sorted" };

const BubbleSort = () => {
  const [seed, setSeed] = useState(() => randomArray(SIZE));
  const steps = useMemo(() => bubbleSortSteps(seed), [seed]);
  const ids = useMemo(() => trackIds(steps.map((s) => s.array)), [steps]);
  const playback = usePlayback(steps.length);
  const { index, reset } = playback;
  const s = steps[index];

  const cells = s.array.map((value, k) => {
    const sorted = k >= s.sortedFrom;
    const hot = s.compare.includes(k);
    return {
      id: ids[index][k],
      value,
      tone: sorted ? "sage" : hot ? (s.swapped ? "amber" : "soft") : "idle",
      lift: hot ? (s.swapped ? 0.55 : 0.35) : 0,
    };
  });

  const callouts = s.compare.length
    ? [{ index: s.compare[1], text: s.swapped ? "swapped" : s.array[s.compare[0]] > s.array[s.compare[1]] ? `${s.array[s.compare[0]]} > ${s.array[s.compare[1]]}` : `${s.array[s.compare[0]]} ≤ ${s.array[s.compare[1]]}` }]
    : s.phase === "settled"
      ? [{ index: s.sortedFrom, text: "final place", tone: "sage" }]
      : [];

  return (
    <Lesson
      steps={steps}
      playback={playback}
      timeline={(st) => st.title}
      onShuffle={() => {
        setSeed(randomArray(SIZE));
        reset();
      }}
      complexity={[
        { label: "time", value: "O(n²)" },
        { label: "best", value: "O(n)" },
        { label: "space", value: "O(1)" },
      ]}
      stage={<IsoArray cells={cells} slots={SIZE} heights="value" callouts={callouts} indexHighlight={s.compare} label="Bubble sort" />}
      narration={{ tag: TAGS[s.phase], title: s.title, body: <p>{s.body}</p>, notice: s.notice }}
      code={{ lines: CODE, active: s.line, file: "bubble_sort.cpp" }}
      panels={[
        {
          title: "This pass",
          rows: [
            { label: "Pass", value: s.pass || null },
            { label: "Comparing", value: s.compare.map((k) => s.array[k]), tone: s.compare.length ? "coral" : undefined },
            { label: "Settled at the end", value: s.array.slice(s.sortedFrom) },
          ],
        },
        {
          title: "Work done",
          rows: [
            { label: "Comparisons", value: s.comparisons },
            { label: "Swaps", value: s.swaps },
          ],
        },
      ]}
      legend={[
        { label: "Comparing", tone: "soft" },
        { label: "Swapping", tone: "amber" },
        { label: "In final place", tone: "sage" },
      ]}
    />
  );
};

export default BubbleSort;
