import { useMemo, useState } from "react";
import { randomArray } from "../../../shared/randomArray";
import { usePlayback } from "../../../shared/usePlayback";
import Lesson from "../../../../lesson/Lesson";
import IsoArray from "../../../../iso/IsoArray";

const SIZE = 8;

const CODE = [
  "void insertionSort(vector<int>& arr) {",
  "  int n = arr.size();",
  "  for (int i = 1; i < n; i++) {",
  "    int key = arr[i];",
  "    int j = i - 1;",
  "    while (j >= 0 && arr[j] > key) {",
  "      arr[j + 1] = arr[j];",
  "      j--;",
  "    }",
  "    arr[j + 1] = key;",
  "  }",
  "}",
];

// Cells carry their own id from the start, so the key lifted out of the row
// and the values sliding right can be drawn as the same cubes moving.
function insertionSortSteps(input) {
  const n = input.length;
  const row = input.map((value, id) => ({ id, value }));
  const steps = [];
  let comparisons = 0;
  let shifts = 0;

  const save = (s) =>
    steps.push({ row: row.map((c) => (c ? { ...c } : null)), key: null, gap: null, j: null, compare: null, comparisons, shifts, ...s });

  save({
    phase: "idea",
    line: 1,
    sortedTo: 1,
    title: "Grow a sorted hand",
    body: "Think of sorting playing cards. The left part of the row is your sorted hand. Take the next value and slide it left until it fits.",
    notice: "A single value on its own is already sorted, so the hand starts with one card.",
  });

  for (let i = 1; i < n; i++) {
    const key = row[i];
    row[i] = null;
    let j = i - 1;

    save({
      phase: "pick",
      line: 4,
      key: { ...key, pos: i },
      gap: i,
      j,
      sortedTo: i,
      title: `Pick up ${key.value}`,
      body: `Lift ${key.value} out of the row. That leaves a gap at index ${i} which the bigger values can slide into.`,
    });

    while (j >= 0) {
      comparisons++;
      const bigger = row[j].value > key.value;
      save({
        phase: "compare",
        line: 6,
        key: { ...key, pos: j + 1 },
        gap: j + 1,
        j,
        compare: j,
        sortedTo: i,
        title: `Is ${row[j].value} bigger than ${key.value}?`,
        body: bigger ? `Yes, so ${row[j].value} belongs to the right of ${key.value}.` : `No. ${key.value} belongs right after ${row[j].value}.`,
      });

      if (!bigger) break;

      row[j + 1] = row[j];
      row[j] = null;
      shifts++;
      save({
        phase: "shift",
        line: 7,
        key: { ...key, pos: j },
        gap: j,
        j,
        compare: j + 1,
        sortedTo: i,
        title: `Slide ${row[j + 1].value} right`,
        body: `${row[j + 1].value} moves into the gap. The gap is now at index ${j}.`,
      });
      j--;
    }

    row[j + 1] = key;
    save({
      phase: "insert",
      line: 10,
      j: null,
      landed: j + 1,
      sortedTo: i + 1,
      title: `Drop ${key.value} into index ${j + 1}`,
      body: j + 1 === i ? `${key.value} was already bigger than everything to its left, so it goes straight back.` : `${key.value} lands in the gap. The first ${i + 1} values are sorted.`,
    });
  }

  save({
    phase: "done",
    line: 12,
    sortedTo: n,
    title: "Sorted",
    body: `Finished after ${comparisons} comparisons and ${shifts} shifts.`,
    notice: "On a nearly sorted row, each value only slides a little, so insertion sort runs close to O(n).",
  });

  return steps;
}

const TAGS = { idea: "Idea", pick: "Pick", compare: "Compare", shift: "Shift", insert: "Insert", done: "Sorted" };

const InsertionSort = () => {
  const [seed, setSeed] = useState(() => randomArray(SIZE));
  const steps = useMemo(() => insertionSortSteps(seed), [seed]);
  const playback = usePlayback(steps.length);
  const { index, reset } = playback;
  const s = steps[index];

  const cells = [];
  s.row.forEach((c, k) => {
    if (!c) return;
    let tone = k < s.sortedTo || s.phase === "done" ? "sage" : "idle";
    if (k === s.compare) tone = s.phase === "shift" ? "amber" : "soft";
    if (k === s.landed) tone = "coral";
    cells.push({ id: c.id, value: c.value, pos: k, tone });
  });
  if (s.key) cells.push({ id: s.key.id, value: s.key.value, pos: s.key.pos, tone: "coral", dy: 1.9 });

  const tiles = s.gap !== null ? { [s.gap]: "slot" } : {};
  const callouts = s.key ? [{ id: s.key.id, text: `key = ${s.key.value}` }] : [];

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
      stage={<IsoArray cells={cells} slots={SIZE} heights="value" tiles={tiles} callouts={callouts} front={1.9} label="Insertion sort" />}
      narration={{ tag: TAGS[s.phase], title: s.title, body: <p>{s.body}</p>, notice: s.notice }}
      code={{ lines: CODE, active: s.line, file: "insertion_sort.cpp" }}
      panels={[
        {
          title: "The hand",
          rows: [
            { label: "Key in hand", value: s.key?.value ?? null, tone: s.key ? "coral" : undefined },
            { label: "Sorted so far", value: s.row.slice(0, s.sortedTo).filter(Boolean).map((c) => c.value) },
          ],
        },
        {
          title: "Work done",
          rows: [
            { label: "Comparisons", value: s.comparisons },
            { label: "Shifts", value: s.shifts },
          ],
        },
      ]}
      legend={[
        { label: "Key", tone: "coral" },
        { label: "Comparing", tone: "soft" },
        { label: "Sliding right", tone: "amber" },
        { label: "Sorted hand", tone: "sage" },
        { label: "Gap", tone: "slot" },
      ]}
    />
  );
};

export default InsertionSort;
