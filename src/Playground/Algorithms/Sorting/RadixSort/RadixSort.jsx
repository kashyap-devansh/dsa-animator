import { useMemo, useState } from "react";
import { usePlayback } from "../../../shared/usePlayback";
import Lesson from "../../../../lesson/Lesson";
import BucketScene from "../bucketScene";

const SIZE = 8;
const randomInput = () => Array.from({ length: SIZE }, () => Math.floor(Math.random() * 990) + 10);
const PLACE = ["ones", "tens", "hundreds"];

const CODE = [
  "void radixSort(vector<int>& arr) {",
  "  int mx = *max_element(arr.begin(), arr.end());",
  "  for (int exp = 1; mx / exp > 0; exp *= 10) {",
  "    vector<vector<int>> bucket(10);",
  "    for (int x : arr)",
  "      bucket[(x / exp) % 10].push_back(x);",
  "    int k = 0;",
  "    for (int d = 0; d < 10; d++)",
  "      for (int x : bucket[d]) arr[k++] = x;",
  "  }",
  "}",
];

// LSD radix sort, base 10: drop every value into the bucket for its current
// digit, then gather the buckets back in order. Repeat for each digit.
function radixSteps(input) {
  let row = input.map((value, id) => ({ id, value }));
  const steps = [];
  const mx = Math.max(...input);
  const digits = String(mx).length;
  let moves = 0;

  const save = (s) => steps.push({ row: row.map((c) => ({ ...c })), placed: new Map(), active: null, digit: null, pass: null, moves, ...s });

  save({
    phase: "idea",
    line: 1,
    title: "Sort by one digit at a time",
    body: `Sort by the ones digit, then by the tens, then by the hundreds. ${mx} has ${digits} digits, so that is ${digits} passes.`,
    notice: "Each pass must keep equal digits in their current order. That stability is what makes the earlier passes count.",
  });

  for (let p = 0, exp = 1; p < digits; p++, exp *= 10) {
    const buckets = Array.from({ length: 10 }, () => []);
    const placed = new Map();

    save({ phase: "pass", line: 3, pass: p, title: `Pass ${p + 1}: the ${PLACE[p]} digit`, body: `Look only at the ${PLACE[p]} digit of each value. Everything else is ignored for this pass.` });

    row.forEach((c) => {
      const d = Math.floor(c.value / exp) % 10;
      placed.set(c.id, { bucket: d, level: buckets[d].length });
      buckets[d].push(c);
      moves++;
      save({
        phase: "drop",
        line: 6,
        pass: p,
        active: c.id,
        digit: d,
        placed: new Map(placed),
        title: `${c.value} → bucket ${d}`,
        body: `The ${PLACE[p]} digit of ${c.value} is ${d}, so it goes on top of bucket ${d}.`,
      });
    });

    row = buckets.flat();
    moves += row.length;
    save({
      phase: "gather",
      line: 9,
      pass: p,
      title: `Gather buckets 0 to 9`,
      body: `Read the buckets from 0 to 9, bottom to top: ${row.map((c) => c.value).join(", ")}. The row is now sorted by the last ${p + 1} digit${p ? "s" : ""}.`,
    });
  }

  save({
    phase: "done",
    line: 11,
    title: "Sorted",
    body: `${digits} passes, each one walking all ${input.length} values once.`,
    notice: "The cost is O(d · (n + b)) for d digits in base b. With few digits that is close to linear.",
  });

  return { steps, exps: digits };
}

const TAGS = { idea: "Idea", pass: "New pass", drop: "Distribute", gather: "Gather", done: "Sorted" };

const RadixSort = () => {
  const [seed, setSeed] = useState(randomInput);
  const { steps } = useMemo(() => radixSteps(seed), [seed]);
  const playback = usePlayback(steps.length);
  const { index, reset } = playback;
  const s = steps[index];
  const exp = s.pass !== null ? 10 ** s.pass : null;

  const cells = s.row.map((c, k) => {
    const where = s.placed.get(c.id);
    const digit = exp ? Math.floor(c.value / exp) % 10 : null;
    return {
      id: c.id,
      value: c.value,
      pos: k,
      bucket: where?.bucket ?? null,
      level: where?.level ?? 0,
      topLabel: digit,
      labelSize: 15,
      tone: s.phase === "done" ? "sage" : c.id === s.active ? "coral" : where ? "soft" : "idle",
    };
  });

  return (
    <Lesson
      steps={steps}
      playback={playback}
      timeline={(st) => st.title}
      onShuffle={() => {
        setSeed(randomInput());
        reset();
      }}
      complexity={[
        { label: "time", value: "O(d(n + b))" },
        { label: "space", value: "O(n + b)" },
      ]}
      stage={
        <BucketScene
          label="Radix sort"
          cells={cells}
          slots={SIZE}
          buckets={10}
          maxStack={4}
          bucketHighlight={s.digit !== null ? [s.digit] : []}
        />
      }
      narration={{ tag: TAGS[s.phase], title: s.title, body: <p>{s.body}</p>, notice: s.notice }}
      code={{ lines: CODE, active: s.line, file: "radix_sort.cpp" }}
      panels={[
        {
          title: "This pass",
          rows: [
            { label: "Digit", value: s.pass !== null ? PLACE[s.pass] : null, tone: s.pass !== null ? "coral" : undefined },
            { label: "Row order", value: s.row.map((c) => c.value) },
          ],
          foot: "The number on top of each cube is the digit this pass looks at.",
        },
        { title: "Work done", rows: [{ label: "Moves", value: s.moves }] },
      ]}
      legend={[
        { label: "Being placed", tone: "coral" },
        { label: "In a bucket", tone: "soft" },
        { label: "Sorted", tone: "sage" },
      ]}
    />
  );
};

export default RadixSort;
