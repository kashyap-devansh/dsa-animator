import { useMemo, useState } from "react";
import { usePlayback } from "../../../shared/usePlayback";
import Lesson from "../../../../lesson/Lesson";
import BucketScene from "../bucketScene";

const SIZE = 9;
const B = 5;
const randomInput = () => Array.from({ length: SIZE }, () => Math.floor(Math.random() * 100));
const LABELS = Array.from({ length: B }, (_, b) => `${b * 20}–${b * 20 + 19}`);

const CODE = [
  "void bucketSort(vector<int>& arr) {",
  "  int b = 5;",
  "  vector<vector<int>> bucket(b);",
  "  for (int x : arr)",
  "    bucket[x * b / 100].push_back(x);",
  "  for (auto& bk : bucket)",
  "    sort(bk.begin(), bk.end());",
  "  int k = 0;",
  "  for (auto& bk : bucket)",
  "    for (int x : bk) arr[k++] = x;",
  "}",
];

// Spread values into buckets by range, sort each small bucket, then read
// the buckets back in order.
function bucketSteps(input) {
  let row = input.map((value, id) => ({ id, value }));
  const buckets = Array.from({ length: B }, () => []);
  const steps = [];
  let ops = 0;

  const placed = () => {
    const m = new Map();
    buckets.forEach((bk, b) => bk.forEach((c, level) => m.set(c.id, { bucket: b, level })));
    return m;
  };
  const save = (s) => steps.push({ row: row.map((c) => ({ ...c })), placed: placed(), active: null, bucket: null, ops, ...s });

  save({
    phase: "idea",
    line: 1,
    title: "Spread out, sort small, join up",
    body: `The values are between 0 and 99. Split that range into ${B} buckets of 20. Each bucket ends up small, so sorting it is cheap.`,
    notice: "Bucket sort shines when values are spread evenly. If they all land in one bucket, it is no better than the inner sort.",
  });

  input.forEach((value, id) => {
    const b = Math.min(B - 1, Math.floor((value * B) / 100));
    buckets[b].push({ id, value });
    ops++;
    save({
      phase: "drop",
      line: 5,
      active: id,
      bucket: b,
      title: `${value} → bucket ${LABELS[b]}`,
      body: `${value} × ${B} ÷ 100 = ${b}, so it goes in bucket ${b}.`,
    });
  });

  buckets.forEach((bk, b) => {
    if (bk.length < 2) return;
    const before = bk.map((c) => c.value).join(", ");
    bk.sort((a, c) => a.value - c.value);
    ops += bk.length;
    save({
      phase: "sort",
      line: 7,
      bucket: b,
      title: `Sort bucket ${LABELS[b]}`,
      body: `[${before}] becomes [${bk.map((c) => c.value).join(", ")}]. With so few values, insertion sort is quick.`,
    });
  });

  row = buckets.flat();
  buckets.forEach((bk) => (bk.length = 0));
  ops += row.length;
  save({
    phase: "gather",
    line: 10,
    title: "Read the buckets back in order",
    body: `Every value in bucket 0 is smaller than every value in bucket 1, and so on. So reading them in order gives ${row.map((c) => c.value).join(", ")}.`,
  });

  save({ phase: "done", line: 11, title: "Sorted", body: `${ops} operations in total.`, notice: "With evenly spread input, the average cost is O(n + k)." });

  return steps;
}

const TAGS = { idea: "Idea", drop: "Distribute", sort: "Sort bucket", gather: "Gather", done: "Sorted" };

const BucketSort = () => {
  const [seed, setSeed] = useState(randomInput);
  const steps = useMemo(() => bucketSteps(seed), [seed]);
  const playback = usePlayback(steps.length);
  const { index, reset } = playback;
  const s = steps[index];

  const cells = s.row.map((c, k) => {
    const where = s.placed.get(c.id);
    return {
      id: c.id,
      value: c.value,
      pos: k,
      bucket: where?.bucket ?? null,
      level: where?.level ?? 0,
      tone: s.phase === "done" || s.phase === "gather" ? "sage" : c.id === s.active ? "coral" : where && where.bucket === s.bucket && s.phase === "sort" ? "amber" : where ? "soft" : "idle",
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
        { label: "average", value: "O(n + k)" },
        { label: "worst", value: "O(n²)" },
        { label: "space", value: "O(n + k)" },
      ]}
      stage={<BucketScene label="Bucket sort" cells={cells} slots={SIZE} buckets={B} bucketLabels={LABELS} maxStack={5} bucketHighlight={s.bucket !== null ? [s.bucket] : []} />}
      narration={{ tag: TAGS[s.phase], title: s.title, body: <p>{s.body}</p>, notice: s.notice }}
      code={{ lines: CODE, active: s.line, file: "bucket_sort.cpp" }}
      panels={[
        {
          title: "Buckets",
          rows: LABELS.map((lab, b) => ({
            label: lab,
            value: [...s.placed.entries()].filter(([, w]) => w.bucket === b).sort((a, c) => a[1].level - c[1].level).map(([id]) => s.row.find((c) => c.id === id).value),
            tone: b === s.bucket ? "coral" : undefined,
          })),
        },
        { title: "Work done", rows: [{ label: "Operations", value: s.ops }] },
      ]}
      legend={[
        { label: "Being placed", tone: "coral" },
        { label: "In a bucket", tone: "soft" },
        { label: "Bucket being sorted", tone: "amber" },
        { label: "Sorted", tone: "sage" },
      ]}
    />
  );
};

export default BucketSort;
