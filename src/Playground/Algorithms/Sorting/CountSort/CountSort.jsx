import { useMemo, useState } from "react";
import { usePlayback } from "../../../shared/usePlayback";
import Lesson from "../../../../lesson/Lesson";
import { IsoRows, SLAB_D, ROW_GAP } from "../../../../iso/IsoArray";

const SIZE = 9;
const randomSmall = () => Array.from({ length: SIZE }, () => Math.floor(Math.random() * 9) + 1);

const CODE = [
  "void countSort(vector<int>& arr) {",
  "  int mx = *max_element(arr.begin(), arr.end());",
  "  int mn = *min_element(arr.begin(), arr.end());",
  "  vector<int> count(mx - mn + 1, 0);",
  "  for (int x : arr) count[x - mn]++;",
  "  for (int i = 1; i < count.size(); i++)",
  "    count[i] += count[i - 1];",
  "  vector<int> out(arr.size());",
  "  for (int i = arr.size() - 1; i >= 0; i--) {",
  "    out[--count[arr[i] - mn]] = arr[i];",
  "  }",
  "  arr = out;",
  "}",
];

function countSortSteps(arr) {
  const n = arr.length;
  const mn = Math.min(...arr);
  const mx = Math.max(...arr);
  const range = mx - mn + 1;
  const count = new Array(range).fill(0);
  const out = new Array(n).fill(null);
  const steps = [];
  let ops = 0;

  const save = (s) => steps.push({ count: [...count], out: [...out], active: null, slot: null, outAt: null, prefix: false, ops, ...s });

  save({
    phase: "idea",
    line: 1,
    title: "Count instead of compare",
    body: `The values are small whole numbers between ${mn} and ${mx}. Instead of comparing them, count how many of each there are, then write them out in order.`,
    notice: "Count sort never compares two values. That is how it beats the O(n log n) limit for comparison sorts.",
  });

  save({
    phase: "range",
    line: 4,
    title: `Make ${range} counters`,
    body: `One counter for every value from ${mn} to ${mx}, all starting at zero.`,
  });

  arr.forEach((v, i) => {
    count[v - mn]++;
    ops++;
    save({
      phase: "count",
      line: 5,
      active: i,
      slot: v - mn,
      title: `Count a ${v}`,
      body: `Counter ${v} goes up to ${count[v - mn]}.`,
    });
  });

  for (let i = 1; i < range; i++) {
    count[i] += count[i - 1];
    ops++;
    save({
      phase: "prefix",
      line: 7,
      slot: i,
      prefix: true,
      title: `Running total at ${i + mn}: ${count[i]}`,
      body: `Add the counter on the left. Now counter ${i + mn} says how many values are ${i + mn} or smaller, which is exactly where the last ${i + mn} has to go.`,
    });
  }

  for (let i = n - 1; i >= 0; i--) {
    const v = arr[i];
    const pos = --count[v - mn];
    out[pos] = { id: i, value: v };
    ops++;
    save({
      phase: "place",
      line: 10,
      active: i,
      slot: v - mn,
      outAt: pos,
      title: `Place ${v} at output ${pos}`,
      body: `Counter ${v} drops by one to ${pos}, and that is the slot ${v} goes in. Walking the input from the right keeps equal values in their original order.`,
    });
  }

  save({
    phase: "done",
    line: 12,
    title: "Sorted",
    body: `${ops} simple operations for ${n} values and ${range} counters.`,
    notice: "The cost is O(n + k), where k is the range of values. A huge range would make the counter row huge too.",
  });

  return { steps, mn, range };
}

const TAGS = { idea: "Idea", range: "Setup", count: "Count", prefix: "Running total", place: "Place", done: "Sorted" };

const CountSort = () => {
  const [seed, setSeed] = useState(randomSmall);
  const { steps, mn, range } = useMemo(() => countSortSteps(seed), [seed]);
  const playback = usePlayback(steps.length);
  const { index, reset } = playback;
  const s = steps[index];

  const inputCells = seed.map((value, k) => ({
    id: `in${k}`,
    value,
    tone: k === s.active ? "coral" : s.phase === "place" && k > s.active ? "ghost" : s.phase === "done" ? "ghost" : "idle",
    lift: k === s.active ? 0.4 : 0,
  }));

  const countCells = s.count.map((c, k) => ({
    id: `c${k}`,
    value: c,
    tone: k === s.slot ? "coral" : c ? (s.prefix || s.phase === "place" || s.phase === "done" ? "amber" : "soft") : "idle",
  }));

  const outCells = s.out.flatMap((c, k) => (c ? [{ id: `o${c.id}`, value: c.value, pos: k, tone: s.phase === "done" ? "sage" : k === s.outAt ? "coral" : "sage" }] : []));

  const y1 = SLAB_D + ROW_GAP;
  const y2 = y1 * 2;

  return (
    <Lesson
      steps={steps}
      playback={playback}
      timeline={(st) => st.title}
      onShuffle={() => {
        setSeed(randomSmall());
        reset();
      }}
      complexity={[
        { label: "time", value: "O(n + k)" },
        { label: "space", value: "O(n + k)" },
      ]}
      stage={
        <IsoRows
          label="Count sort"
          extraTop={1.2}
          rows={[
            { key: "in", y: 0, cells: inputCells, slots: SIZE, name: "input", callouts: s.active !== null && s.phase !== "done" ? [{ index: s.active, text: `${seed[s.active]}`, small: true }] : [] },
            { key: "count", y: y1, cells: countCells, slots: SIZE, name: "count", indexLabels: Array.from({ length: range }, (_, i) => i + mn), indexHighlight: s.slot !== null ? [s.slot] : [] },
            { key: "out", y: y2, cells: outCells, slots: SIZE, name: "output", indexHighlight: s.outAt !== null ? [s.outAt] : [] },
          ]}
        />
      }
      narration={{ tag: TAGS[s.phase], title: s.title, body: <p>{s.body}</p>, notice: s.notice }}
      code={{ lines: CODE, active: s.line, file: "count_sort.cpp" }}
      panels={[
        {
          title: "Counters",
          rows: [
            { label: "Value range", value: `${mn}–${mn + range - 1}` },
            { label: s.prefix || s.phase === "place" ? "Running totals" : "Counts", value: s.count },
          ],
        },
        { title: "Work done", rows: [{ label: "Operations", value: s.ops }] },
      ]}
      legend={[
        { label: "Current value / counter", tone: "coral" },
        { label: "Counted", tone: "soft" },
        { label: "Running total", tone: "amber" },
        { label: "Placed in output", tone: "sage" },
      ]}
    />
  );
};

export default CountSort;
