import { useMemo, useState } from "react";
import { randomArray } from "../../../shared/randomArray";
import { usePlayback } from "../../../shared/usePlayback";
import Lesson from "../../../../lesson/Lesson";
import IsoArray from "../../../../iso/IsoArray";
import { trackIds } from "../../../../iso/trackIds";

const SIZE = 8;

const CODE = [
  "void selectionSort(vector<int>& arr) {",
  "  int n = arr.size();",
  "  for (int i = 0; i < n - 1; i++) {",
  "    int minIdx = i;",
  "    for (int j = i + 1; j < n; j++) {",
  "      if (arr[j] < arr[minIdx]) {",
  "        minIdx = j;",
  "      }",
  "    }",
  "    swap(arr[i], arr[minIdx]);",
  "  }",
  "}",
];

function selectionSortSteps(input) {
  const arr = [...input];
  const n = arr.length;
  const steps = [];
  let comparisons = 0;
  let swaps = 0;

  const save = (s) => steps.push({ array: [...arr], i: null, j: null, min: null, swapping: [], comparisons, swaps, ...s });

  save({
    phase: "idea",
    line: 1,
    sortedTo: 0,
    title: "Find the smallest, put it first",
    body: "Scan the unsorted part for its smallest value and swap it to the front. Then do the same for what remains.",
    notice: "Selection sort makes at most n − 1 swaps, fewer than any other simple sort.",
  });

  for (let i = 0; i < n - 1; i++) {
    let min = i;
    save({
      phase: "start",
      line: 4,
      i,
      min,
      sortedTo: i,
      title: `Start at index ${i}`,
      body: `Assume ${arr[i]}, the first unsorted value, is the smallest until something beats it.`,
    });

    for (let j = i + 1; j < n; j++) {
      comparisons++;
      const better = arr[j] < arr[min];
      save({
        phase: "compare",
        line: 6,
        i,
        j,
        min,
        sortedTo: i,
        title: `Is ${arr[j]} smaller than ${arr[min]}?`,
        body: better ? `Yes. ${arr[j]} is the new smallest seen so far.` : `No, ${arr[min]} is still the smallest.`,
      });

      if (better) {
        min = j;
        save({
          phase: "new-min",
          line: 7,
          i,
          j,
          min,
          sortedTo: i,
          title: `New minimum: ${arr[min]}`,
          body: `Remember index ${min}. Keep scanning in case something even smaller is further right.`,
        });
      }
    }

    if (min !== i) {
      const a = arr[i];
      const b = arr[min];
      [arr[i], arr[min]] = [arr[min], arr[i]];
      swaps++;
      save({
        phase: "swap",
        line: 10,
        i,
        min: i,
        swapping: [i, min],
        sortedTo: i,
        title: `Swap ${b} into index ${i}`,
        body: `${b} was the smallest of the unsorted values. It trades places with ${a}.`,
      });
    } else {
      save({
        phase: "swap",
        line: 10,
        i,
        min: i,
        sortedTo: i,
        title: `${arr[i]} is already in place`,
        body: "The smallest value was already at the front, so nothing needs to move.",
      });
    }

    save({
      phase: "settled",
      line: 3,
      sortedTo: i + 1,
      title: `Index ${i} is done`,
      body: `The first ${i + 1} value${i ? "s are" : " is"} sorted and will not move again.`,
    });
  }

  save({
    phase: "done",
    line: 12,
    sortedTo: n,
    title: "Sorted",
    body: `Done after ${comparisons} comparisons and only ${swaps} swaps.`,
    notice: "The scan always looks at every remaining value, so even a sorted input costs O(n²) comparisons.",
  });

  return steps;
}

const TAGS = { idea: "Idea", start: "New pass", compare: "Compare", "new-min": "Minimum", swap: "Swap", settled: "Pass done", done: "Sorted" };

const SelectionSort = () => {
  const [seed, setSeed] = useState(() => randomArray(SIZE));
  const steps = useMemo(() => selectionSortSteps(seed), [seed]);
  const ids = useMemo(() => trackIds(steps.map((s) => s.array)), [steps]);
  // Swaps stay on screen longer so the exchange can be followed.
  const playback = usePlayback(steps.length, (i) => (steps[i]?.swapping.length === 2 ? 1.8 : 1));
  const { index, reset } = playback;
  const s = steps[index];

  const cells = s.array.map((value, k) => {
    let tone = "idle";
    let lift = 0;
    if (k < s.sortedTo || s.phase === "done") tone = "sage";
    else if (s.swapping.includes(k)) {
      tone = "amber";
      lift = 0.55;
    } else if (k === s.min) tone = "coral";
    else if (k === s.j) {
      tone = "soft";
      lift = 0.35;
    }
    return { id: ids[index][k], value, tone, lift };
  });

  const pointers = [];
  if (s.i !== null) pointers.push({ index: s.i, text: "i" });
  if (s.j !== null) pointers.push({ index: s.j, text: "j" });
  if (s.min !== null && s.phase !== "swap") pointers.push({ index: s.min, text: "min", tone: "coral" });

  const callouts = s.phase === "new-min" ? [{ index: s.min, text: "new minimum" }] : s.phase === "compare" ? [{ index: s.j, text: `${s.array[s.j]} vs ${s.array[s.min]}`, small: true }] : [];

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
        { label: "space", value: "O(1)" },
      ]}
      stage={<IsoArray cells={cells} slots={SIZE} heights="value" pointers={pointers} callouts={callouts} swaps={s.swapping.length === 2 ? [s.swapping] : []} label="Selection sort" />}
      narration={{ tag: TAGS[s.phase], title: s.title, body: <p>{s.body}</p>, notice: s.notice }}
      code={{ lines: CODE, active: s.line, file: "selection_sort.cpp" }}
      panels={[
        {
          title: "This pass",
          rows: [
            { label: "Smallest so far", value: s.min !== null ? s.array[s.min] : null, tone: s.min !== null ? "coral" : undefined },
            { label: "Checking", value: s.j !== null ? s.array[s.j] : null },
            { label: "Sorted prefix", value: s.array.slice(0, s.sortedTo) },
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
        { label: "Smallest so far", tone: "coral" },
        { label: "Checking", tone: "soft" },
        { label: "Swapping", tone: "amber" },
        { label: "Sorted", tone: "sage" },
      ]}
    />
  );
};

export default SelectionSort;
