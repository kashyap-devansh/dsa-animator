import { useMemo, useState } from "react";
import { randomArray } from "../../../shared/randomArray";
import { usePlayback } from "../../../shared/usePlayback";
import Lesson from "../../../../lesson/Lesson";
import IsoArray, { STEP } from "../../../../iso/IsoArray";
import { At, Tile } from "../../../../iso/IsoParts";

const SIZE = 8;
const TRAY = 3.1;

const CODE = [
  "void mergeSort(vector<int>& a, int l, int r) {",
  "  if (l >= r) return;",
  "  int m = l + (r - l) / 2;",
  "  mergeSort(a, l, m);",
  "  mergeSort(a, m + 1, r);",
  "  merge(a, l, m, r);",
  "}",
  "",
  "void merge(vector<int>& a, int l, int m, int r) {",
  "  vector<int> tmp;",
  "  int i = l, j = m + 1;",
  "  while (i <= m && j <= r) {",
  "    if (a[i] <= a[j]) tmp.push_back(a[i++]);",
  "    else              tmp.push_back(a[j++]);",
  "  }",
  "  while (i <= m) tmp.push_back(a[i++]);",
  "  while (j <= r) tmp.push_back(a[j++]);",
  "  for (int k = l; k <= r; k++) a[k] = tmp[k - l];",
  "}",
];

// Each cell keeps its id. During a merge, taken values move down into the
// tray in front of the row (at the slot they will end up in), then the whole
// run goes back up together.
function mergeSortSteps(input) {
  const n = input.length;
  let row = input.map((value, id) => ({ id, value }));
  const tray = new Map(); // id -> pos
  const steps = [];
  let comparisons = 0;
  let writes = 0;
  let depth = 0;
  let maxDepth = 0;
  const sortedRuns = [];

  const save = (s) =>
    steps.push({
      row: row.map((c) => ({ ...c })),
      tray: new Map(tray),
      range: null,
      mid: null,
      i: null,
      j: null,
      depth,
      runs: sortedRuns.map((r) => [...r]),
      comparisons,
      writes,
      maxDepth,
      ...s,
    });

  save({
    phase: "idea",
    line: 1,
    title: "Split in half, sort each half, merge",
    body: `A row of one value is already sorted. So keep halving the ${n} values until every piece has one, then merge pieces back together in order.`,
    notice: "Merging two sorted rows is easy: keep taking the smaller of the two front values.",
  });

  const sort = (l, r) => {
    depth++;
    maxDepth = Math.max(maxDepth, depth);

    if (l >= r) {
      sortedRuns.push([l, r]);
      save({
        phase: "base",
        line: 2,
        range: [l, r],
        title: `${row[l].value} alone is sorted`,
        body: "A single value has nothing to be out of order with. This is where the splitting stops.",
      });
      depth--;
      return;
    }

    const m = l + Math.floor((r - l) / 2);
    save({
      phase: "split",
      line: 3,
      range: [l, r],
      mid: m,
      title: `Split indices ${l}–${r} at ${m}`,
      body: `Sort the left half (${l}–${m}) first, then the right half (${m + 1}–${r}), then merge them.`,
    });

    sort(l, m);
    sort(m + 1, r);
    merge(l, m, r);
    depth--;
  };

  const merge = (l, m, r) => {
    const left = row.slice(l, m + 1).map((c) => c.value);
    const right = row.slice(m + 1, r + 1).map((c) => c.value);
    save({
      phase: "merge",
      line: 9,
      range: [l, r],
      mid: m,
      i: l,
      j: m + 1,
      title: `Merge [${left.join(", ")}] with [${right.join(", ")}]`,
      body: "Both halves are sorted. Compare their front values and take the smaller each time, filling the tray from the left.",
    });

    let i = l;
    let j = m + 1;
    let k = l;
    const taken = new Set();
    const nextOf = (from, to) => {
      for (let x = from; x <= to; x++) if (!taken.has(x)) return x;
      return null;
    };

    const take = (idx, line, title, body, extra = {}) => {
      tray.set(row[idx].id, k);
      taken.add(idx);
      writes++;
      k++;
      save({ phase: "take", line, range: [l, r], mid: m, i: nextOf(l, m), j: nextOf(m + 1, r), title, body, ...extra });
    };

    while (i <= m && j <= r) {
      comparisons++;
      const a = row[i].value;
      const b = row[j].value;
      save({
        phase: "compare",
        line: 13,
        range: [l, r],
        mid: m,
        i,
        j,
        title: `${a} or ${b}?`,
        body: a <= b ? `${a} is smaller${a === b ? " (or equal, so take the left one to keep the sort stable)" : ""}, so it goes into the tray next.` : `${b} is smaller, so it goes into the tray next.`,
      });

      if (a <= b) {
        take(i, 13, `Take ${a} from the left`, `${a} drops into tray slot ${k}.`);
        i++;
      } else {
        take(j, 14, `Take ${b} from the right`, `${b} drops into tray slot ${k}.`);
        j++;
      }
    }

    while (i <= m) {
      take(i, 16, `Take the leftover ${row[i].value}`, "The right half is empty, so whatever is left on the left comes next, already in order.");
      i++;
    }
    while (j <= r) {
      take(j, 17, `Take the leftover ${row[j].value}`, "The left half is empty, so the rest of the right half follows in order.");
      j++;
    }

    // Copy the tray back up into the row.
    const merged = [...row.slice(l, r + 1)].sort((a, b) => tray.get(a.id) - tray.get(b.id));
    row = [...row.slice(0, l), ...merged, ...row.slice(r + 1)];
    merged.forEach((c) => tray.delete(c.id));
    for (let x = sortedRuns.length - 1; x >= 0; x--) {
      const [a, b] = sortedRuns[x];
      if (a >= l && b <= r) sortedRuns.splice(x, 1);
    }
    sortedRuns.push([l, r]);

    save({
      phase: "copy",
      line: 18,
      range: [l, r],
      title: `Copy back: ${merged.map((c) => c.value).join(", ")}`,
      body: `Indices ${l}–${r} now hold one sorted run of ${r - l + 1} values.`,
    });
  };

  sort(0, n - 1);

  save({
    phase: "done",
    line: 7,
    title: "Sorted",
    body: `The last merge joined the two halves of the whole row. ${comparisons} comparisons, ${writes} writes, recursion ${maxDepth} levels deep.`,
    notice: "There are about log₂ n levels of splitting and each level does O(n) work to merge, which gives O(n log n) every time.",
  });

  return steps;
}

const TAGS = { idea: "Idea", base: "Base case", split: "Split", merge: "Merge", compare: "Compare", take: "Merge", copy: "Copy back", done: "Sorted" };

const MergeSort = () => {
  const [seed, setSeed] = useState(() => randomArray(SIZE));
  const steps = useMemo(() => mergeSortSteps(seed), [seed]);
  const playback = usePlayback(steps.length);
  const { index, reset } = playback;
  const s = steps[index];
  const [l, r] = s.range ?? [0, SIZE - 1];
  const inRun = (k) => s.runs.some(([a, b]) => b > a && k >= a && k <= b);

  const cells = s.row.map((c, k) => {
    const inTray = s.tray.has(c.id);
    let tone = "idle";
    if (s.phase === "done") tone = "sage";
    else if (inTray) tone = "coral";
    else if (s.range && (k < l || k > r)) tone = "ghost";
    else if (k === s.i || k === s.j) tone = "soft";
    else if (inRun(k) || (s.phase === "base" && k === l)) tone = "sage";
    return {
      id: c.id,
      value: c.value,
      pos: inTray ? s.tray.get(c.id) : k,
      dy: inTray ? TRAY : 0,
      tone,
      lift: !inTray && s.phase === "compare" && (k === s.i || k === s.j) ? 0.35 : 0,
    };
  });

  const pointers = [];
  if (s.i !== null) pointers.push({ index: s.i, text: "i" });
  if (s.j !== null) pointers.push({ index: s.j, text: "j", tone: "coral" });
  if (s.phase === "split") pointers.push({ index: s.mid, text: "m", tone: "sage" });

  const tiles = {};
  if (["merge", "compare", "take"].includes(s.phase)) {
    // Empty tray slots for this merge.
    for (let k = l; k <= r; k++) tiles[k] = "slot";
  }

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
        { label: "time", value: "O(n log n)" },
        { label: "space", value: "O(n)" },
      ]}
      stage={
        <IsoArray
          cells={cells}
          slots={SIZE}
          heights="value"
          pointers={pointers}
          front={TRAY}
          before={<TraySlots tiles={tiles} />}
          label="Merge sort"
        />
      }
      narration={{ tag: TAGS[s.phase], title: s.title, body: <p>{s.body}</p>, notice: s.notice }}
      code={{ lines: CODE, active: s.line, file: "merge_sort.cpp" }}
      panels={[
        {
          title: "This merge",
          rows: [
            { label: "Range", value: s.range ? `${l}–${r}` : null },
            { label: "Left front", value: s.i !== null ? s.row[s.i].value : null, tone: s.phase === "compare" ? "coral" : undefined },
            { label: "Right front", value: s.j !== null ? s.row[s.j].value : null, tone: s.phase === "compare" ? "coral" : undefined },
            { label: "In the tray", value: s.row.filter((c) => s.tray.has(c.id)).sort((a, b) => s.tray.get(a.id) - s.tray.get(b.id)).map((c) => c.value) },
          ],
        },
        {
          title: "Work done",
          rows: [
            { label: "Comparisons", value: s.comparisons },
            { label: "Writes", value: s.writes },
            { label: "Recursion depth", value: s.depth || null },
          ],
        },
      ]}
      legend={[
        { label: "Front of each half", tone: "soft" },
        { label: "Taken into the tray", tone: "coral" },
        { label: "Sorted run", tone: "sage" },
        { label: "Not in this call", tone: "ghost" },
      ]}
    />
  );
};

// Dashed floor squares where the merged values will land.
const TraySlots = ({ tiles }) =>
  Object.keys(tiles).map((pos) => (
    <At key={pos} x={Number(pos) * STEP} y={0.3 + TRAY} instant>
      <Tile tone="slot" />
    </At>
  ));

export default MergeSort;
