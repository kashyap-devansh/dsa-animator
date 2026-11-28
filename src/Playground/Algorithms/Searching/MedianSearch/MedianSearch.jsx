import { useMemo, useState } from "react";
import { randomArray } from "../../../shared/randomArray";
import { usePlayback } from "../../../shared/usePlayback";
import Lesson from "../../../../lesson/Lesson";
import IsoArray from "../../../../iso/IsoArray";
import { trackIds } from "../../../../iso/trackIds";

function quickSelectSteps(input) {
  const arr = [...input];
  const n = arr.length;
  const k = Math.floor((n - 1) / 2);
  const steps = [];

  let comparisons = 0;
  let swaps = 0;

  function save(line, description, opts = {}) {
    steps.push({
      array: [...arr],
      codeLine: line,
      description,
      range: opts.range || [0, n - 1],
      pivot: opts.pivot ?? -1,
      compare: opts.compare ?? -1,
      swap: opts.swap || [],
      foundIdx: opts.foundIdx ?? -1,
      k,
      comparisons,
      swaps,
    });
  }

  function swapArr(a, b) {
    const t = arr[a];
    arr[a] = arr[b];
    arr[b] = t;
  }

  function partition(l, r) {
    const pivot = arr[r];
    save(10, `Pivot = ${pivot} (index ${r})`, { range: [l, r], pivot: r });

    let i = l - 1;
    save(11, `i starts at ${i}`, { range: [l, r], pivot: r });

    for (let j = l; j < r; j++) {
      comparisons++;

      if (arr[j] <= pivot) {
        i++;
        swapArr(i, j);
        swaps++;
        save(13, `${arr[i]} ≤ ${pivot} — swap into index ${i}`, { range: [l, r], pivot: r, compare: j, swap: [i, j] });
      } else {
        save(13, `${arr[j]} > ${pivot} — leave it, continue`, { range: [l, r], pivot: r, compare: j });
      }
    }

    swapArr(i + 1, r);
    swaps++;
    save(14, `Place pivot at index ${i + 1}`, { range: [l, r], pivot: i + 1, swap: [i + 1, r] });

    save(15, `Return partition index ${i + 1}`, { range: [l, r], pivot: i + 1 });

    return i + 1;
  }

  function quickSelect(l, r) {
    save(1, `quickSelect(${l}, ${r}) — looking for rank k = ${k}`, { range: [l, r] });

    if (l === r) {
      save(2, `Single element left — index ${l} is the answer`, { range: [l, r], foundIdx: l });
      return l;
    }

    const p = partition(l, r);

    save(3, `Partition index p = ${p}`, { range: [l, r], pivot: p });

    if (k === p) {
      save(4, `k == p — median found at index ${p}`, { range: [l, r], pivot: p, foundIdx: p });
      return p;
    }

    if (k < p) {
      save(5, `k < p — recurse into the left half [${l}, ${p - 1}]`, { range: [l, p - 1], pivot: p });
      return quickSelect(l, p - 1);
    }

    save(6, `k > p — recurse into the right half [${p + 1}, ${r}]`, { range: [p + 1, r], pivot: p });
    return quickSelect(p + 1, r);
  }

  quickSelect(0, n - 1);

  return steps;
}

const CODE = [
  "int quickSelect(vector<int>& a, int l, int r, int k) {",
  "  if (l == r) return l;",
  "  int p = partition(a, l, r);",
  "  if (k == p) return p;",
  "  if (k < p) return quickSelect(a, l, p - 1, k);",
  "  return quickSelect(a, p + 1, r, k);",
  "}",
  "",
  "int partition(vector<int>& a, int l, int r) {",
  "  int pivot = a[r];",
  "  int i = l - 1;",
  "  for (int j = l; j < r; j++)",
  "    if (a[j] <= pivot) swap(a[++i], a[j]);",
  "  swap(a[i + 1], a[r]);",
  "  return i + 1;",
  "}",
];

const SIZE = 9;

function tagOf(s) {
  if (s.foundIdx >= 0) return "Found";
  if (s.codeLine === 1) return "Recurse";
  if (s.codeLine >= 10 && s.codeLine <= 15) return "Partition";
  return "Narrow";
}

const MedianSearch = () => {
  const [seed, setSeed] = useState(() => randomArray(SIZE));
  const steps = useMemo(() => {
    const raw = quickSelectSteps(seed);
    const k = raw[0].k;
    return [
      {
        ...raw[0],
        codeLine: 1,
        description: "Find the middle value without sorting",
        body: `The median of ${seed.length} values is the one that would sit at index ${k} if the row were sorted. Quickselect partitions like quick sort, but only follows the side that contains index ${k}.`,
        notice: "Quick sort recurses into both sides. Quickselect throws one away each time, so on average it does O(n) work instead of O(n log n).",
        range: [0, seed.length - 1],
        pivot: -1,
        compare: -1,
        swap: [],
      },
      ...raw,
    ];
  }, [seed]);
  const ids = useMemo(() => trackIds(steps.map((s) => s.array)), [steps]);
  // Swaps stay on screen longer so the exchange can be followed.
  const playback = usePlayback(steps.length, (i) => (steps[i]?.swap.length === 2 && steps[i].swap[0] !== steps[i].swap[1] ? 1.8 : 1));
  const { index, reset } = playback;
  const s = steps[index];
  const [l, r] = s.range;
  const [head, ...rest] = s.description.split(" — ");

  const cells = s.array.map((value, i) => {
    let tone = "idle";
    let lift = 0;
    if (i === s.foundIdx) {
      tone = "sage";
      lift = 0.5;
    } else if (s.swap.includes(i)) {
      tone = "amber";
      lift = 0.5;
    } else if (i === s.pivot) tone = "coral";
    else if (i === s.compare) {
      tone = "soft";
      lift = 0.35;
    } else if (i < l || i > r) tone = "ghost";
    return { id: ids[index][i], value, tone, lift };
  });

  const pointers = [{ index: s.k, text: "k", tone: "coral" }];
  if (s.compare >= 0) pointers.push({ index: s.compare, text: "j" });

  const callouts =
    s.foundIdx >= 0
      ? [{ index: s.foundIdx, text: `median = ${s.array[s.foundIdx]}`, tone: "sage" }]
      : s.pivot >= 0 && s.compare < 0
        ? [{ index: s.pivot, text: "pivot", small: true }]
        : [];

  return (
    <Lesson
      steps={steps}
      playback={playback}
      timeline={(st) => st.description.split(" — ")[0]}
      onShuffle={() => {
        setSeed(randomArray(SIZE));
        reset();
      }}
      complexity={[
        { label: "average", value: "O(n)" },
        { label: "worst", value: "O(n²)" },
        { label: "space", value: "O(log n)" },
      ]}
      stage={<IsoArray cells={cells} slots={SIZE} pointers={pointers} callouts={callouts} swaps={s.swap.length === 2 ? [s.swap] : []} label="Quickselect" />}
      narration={{
        tag: tagOf(s),
        title: head,
        body: <p>{s.body ?? (rest.length ? rest.join(" — ") : `Working on indices ${l}–${r}. The median belongs at index ${s.k}.`)}</p>,
        notice: s.notice,
      }}
      code={{ lines: CODE, active: s.codeLine, file: "quick_select.cpp" }}
      panels={[
        {
          title: "Looking for",
          rows: [
            { label: "Median index k", value: s.k, tone: "coral" },
            { label: "Live range", value: `${l}–${r}` },
            { label: "Pivot", value: s.pivot >= 0 ? s.array[s.pivot] : null },
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
        { label: "Pivot", tone: "coral" },
        { label: "Comparing", tone: "soft" },
        { label: "Swapping", tone: "amber" },
        { label: "Median", tone: "sage" },
        { label: "Thrown away", tone: "ghost" },
      ]}
    />
  );
};

export default MedianSearch;
