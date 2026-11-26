// Linear, binary and interpolation search, recorded in the same step shape
// as searchSteps.js: { codeLine, title, body, roles, range, pointers, vars,
// comparisons, result }, so one page can draw all of them.

function recorder() {
  const steps = [];
  let comparisons = 0;
  const save = (codeLine, title, body, view = {}) =>
    steps.push({
      codeLine,
      title,
      body,
      notice: view.notice ?? null,
      roles: view.roles ?? {},
      range: view.range ?? null,
      pointers: view.pointers ?? [],
      vars: view.vars ?? [],
      comparisons,
      result: view.result ?? null,
    });
  return { steps, save, compare: () => comparisons++ };
}

/* ---------- linear ---------- */

export const LINEAR_CODE = [
  "int linearSearch(int a[], int n, int x) {",
  "  for (int i = 0; i < n; i++) {",
  "    if (a[i] == x) return i;",
  "  }",
  "  return -1;",
  "}",
];

export function linearSearchSteps(a, x) {
  const { steps, save, compare } = recorder();
  const n = a.length;

  save(1, `Look for ${x}, one by one`, "Start at the left and check every value in turn. The row does not need to be sorted.", {
    range: [0, n - 1],
    notice: "Simple and always works, but in the worst case it looks at all n values.",
  });

  for (let i = 0; i < n; i++) {
    compare();
    const pointers = [{ label: "i", index: i }];
    if (a[i] === x) {
      save(3, `Found ${x} at index ${i}`, `a[${i}] is ${x}. Stop here and return ${i}. That took ${i + 1} comparison${i ? "s" : ""}.`, {
        roles: { [i]: "found" },
        range: [i, n - 1],
        pointers,
        result: i,
      });
      return steps;
    }
    save(3, `a[${i}] = ${a[i]}, not ${x}`, `Not a match. Move one step right.`, { roles: { [i]: "probe" }, range: [i, n - 1], pointers });
  }

  save(5, `${x} is not here`, `Every one of the ${n} values was checked and none matched, so return −1.`, { range: [n, n - 1], result: "miss" });
  return steps;
}

/* ---------- binary ---------- */

export const BINARY_CODE = [
  "int binarySearch(int a[], int n, int x) {",
  "  int lo = 0, hi = n - 1;",
  "  while (lo <= hi) {",
  "    int mid = lo + (hi - lo) / 2;",
  "    if (a[mid] == x) return mid;",
  "    if (a[mid] < x) lo = mid + 1;",
  "    else            hi = mid - 1;",
  "  }",
  "  return -1;",
  "}",
];

export function binarySearchSteps(a, x) {
  const { steps, save, compare } = recorder();
  let lo = 0;
  let hi = a.length - 1;
  const ptr = (mid) => [
    { label: "lo", index: lo, tone: "blue" },
    { label: "hi", index: hi, tone: "cyan" },
    ...(mid !== undefined ? [{ label: "mid", index: mid, tone: "orange" }] : []),
  ];
  const vars = (mid) => [
    { label: "lo", value: lo },
    { label: "hi", value: hi },
    { label: "mid", value: mid ?? null },
  ];

  save(2, `Look for ${x} in a sorted row`, "Because the row is sorted, one look at the middle tells you which half the target must be in. Throw the other half away.", {
    range: [lo, hi],
    pointers: ptr(),
    vars: vars(),
    notice: "Each look halves what is left, so even a million values take about 20 looks.",
  });

  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    compare();
    save(4, `Look at the middle: a[${mid}] = ${a[mid]}`, `The live range is ${lo}–${hi}. Its middle is index ${mid}.`, {
      roles: { [mid]: "probe" },
      range: [lo, hi],
      pointers: ptr(mid),
      vars: vars(mid),
    });

    if (a[mid] === x) {
      save(5, `Found ${x} at index ${mid}`, `a[${mid}] is the target. Return ${mid}.`, { roles: { [mid]: "found" }, range: [mid, mid], pointers: ptr(mid), vars: vars(mid), result: mid });
      return steps;
    }

    if (a[mid] < x) {
      const was = lo;
      lo = mid + 1;
      save(6, `${a[mid]} < ${x}: keep the right half`, `Everything from ${was} to ${mid} is ${a[mid]} or smaller, so ${x} cannot be there. lo moves to ${lo}.`, {
        roles: { [mid]: "miss" },
        range: [lo, hi],
        pointers: ptr(),
        vars: vars(),
      });
    } else {
      const was = hi;
      hi = mid - 1;
      save(7, `${a[mid]} > ${x}: keep the left half`, `Everything from ${mid} to ${was} is ${a[mid]} or bigger, so ${x} cannot be there. hi moves to ${hi}.`, {
        roles: { [mid]: "miss" },
        range: [lo, hi],
        pointers: ptr(),
        vars: vars(),
      });
    }
  }

  save(9, `${x} is not here`, `lo (${lo}) has passed hi (${hi}). The live range is empty, so return −1.`, { range: [lo, hi], vars: vars(), result: "miss" });
  return steps;
}

/* ---------- interpolation ---------- */

export const INTERPOLATION_CODE = [
  "int interpolationSearch(int a[], int n, int x) {",
  "  int lo = 0, hi = n - 1;",
  "  while (lo <= hi && x >= a[lo] && x <= a[hi]) {",
  "    int pos = lo + (long)(x - a[lo]) * (hi - lo)",
  "                 / (a[hi] - a[lo]);",
  "    if (a[pos] == x) return pos;",
  "    if (a[pos] < x) lo = pos + 1;",
  "    else            hi = pos - 1;",
  "  }",
  "  return -1;",
  "}",
];

export function interpolationSearchSteps(a, x) {
  const { steps, save, compare } = recorder();
  let lo = 0;
  let hi = a.length - 1;
  const ptr = (pos) => [
    { label: "lo", index: lo, tone: "blue" },
    { label: "hi", index: hi, tone: "cyan" },
    ...(pos !== undefined ? [{ label: "pos", index: pos, tone: "orange" }] : []),
  ];
  const vars = (pos) => [
    { label: "lo", value: lo },
    { label: "hi", value: hi },
    { label: "pos", value: pos ?? null },
  ];

  save(2, `Guess where ${x} should be`, "Looking up a word in a dictionary, you open near the front for “apple” and near the back for “zebra”. Interpolation search guesses the position from the value.", {
    range: [lo, hi],
    pointers: ptr(),
    vars: vars(),
    notice: "On evenly spread values the guess is usually very close, about O(log log n) looks.",
  });

  while (lo <= hi && x >= a[lo] && x <= a[hi]) {
    const pos = a[hi] === a[lo] ? lo : lo + Math.floor(((x - a[lo]) * (hi - lo)) / (a[hi] - a[lo]));
    compare();
    const frac = a[hi] === a[lo] ? 0 : (x - a[lo]) / (a[hi] - a[lo]);
    save(4, `Guess index ${pos}`, `${x} is ${Math.round(frac * 100)}% of the way from ${a[lo]} to ${a[hi]}, so look ${Math.round(frac * 100)}% of the way from index ${lo} to ${hi}: index ${pos}.`, {
      roles: { [pos]: "probe" },
      range: [lo, hi],
      pointers: ptr(pos),
      vars: vars(pos),
    });

    if (a[pos] === x) {
      save(6, `Found ${x} at index ${pos}`, `The guess was right on. Return ${pos}.`, { roles: { [pos]: "found" }, range: [pos, pos], pointers: ptr(pos), vars: vars(pos), result: pos });
      return steps;
    }
    if (a[pos] < x) {
      lo = pos + 1;
      save(7, `${a[pos]} < ${x}: look further right`, `The guess landed too low. lo moves to ${lo}.`, { roles: { [pos]: "miss" }, range: [lo, hi], pointers: ptr(), vars: vars() });
    } else {
      hi = pos - 1;
      save(8, `${a[pos]} > ${x}: look further left`, `The guess landed too high. hi moves to ${hi}.`, { roles: { [pos]: "miss" }, range: [lo, hi], pointers: ptr(), vars: vars() });
    }
  }

  save(10, `${x} is not here`, lo > hi ? "The live range is empty." : `${x} lies outside the values still in range, so it cannot be in the row.`, { range: [lo, hi], vars: vars(), result: "miss" });
  return steps;
}

// Evenly spaced sorted values, the case interpolation search is built for.
export function uniformArray(size = 12) {
  const arr = [];
  let value = Math.floor(Math.random() * 5) + 1;
  for (let i = 0; i < size; i++) {
    arr.push(value);
    value += Math.floor(Math.random() * 8) + 3;
  }
  return arr;
}
