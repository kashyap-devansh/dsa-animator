// Step generators for the array-based searches that render through ArrayStage.
// Each step: { codeLine, description, roles, range, pointers, vars, comparisons, result }

function recorder() {
  const steps = [];
  let comparisons = 0;

  const save = (codeLine, description, view = {}) => {
    steps.push({
      codeLine,
      description,
      roles: view.roles ?? {},
      range: view.range ?? null,
      pointers: view.pointers ?? [],
      vars: view.vars ?? [],
      comparisons,
      result: view.result ?? null,
    });
  };

  return { steps, save, compare: () => comparisons++ };
}

/* ---------- jump search ---------- */

export const JUMP_CODE = [
  "int jumpSearch(int a[], int n, int x) {",
  "  int step = sqrt(n), prev = 0;",
  "  while (a[min(step, n) - 1] < x) {",
  "    prev = step;",
  "    step += sqrt(n);",
  "    if (prev >= n) return -1;",
  "  }",
  "  while (a[prev] < x) {",
  "    prev++;",
  "    if (prev == min(step, n)) return -1;",
  "  }",
  "  if (a[prev] == x) return prev;",
  "  return -1;",
  "}",
];

export function jumpSearchSteps(a, x) {
  const n = a.length;
  const jump = Math.floor(Math.sqrt(n));
  const { steps, save, compare } = recorder();
  let prev = 0;
  let step = jump;

  const vars = () => [
    { label: "jump", value: jump, tone: "cyan" },
    { label: "prev", value: prev, tone: "blue" },
    { label: "step", value: step, tone: "orange" },
  ];

  save(1, `jumpSearch(${x}) on ${n} sorted elements`, { vars: vars() });
  save(2, `Block size = ⌊√${n}⌋ = ${jump}`, { range: [0, n - 1], vars: vars() });

  while (true) {
    const i = Math.min(step, n) - 1;
    compare();

    const pointers = [{ label: "prev", index: prev, tone: "blue" }, { label: "end", index: i }];

    if (a[i] < x) {
      save(3, `a[${i}] = ${a[i]} < ${x} — the whole block is too small, jump`, { roles: { [i]: "probe" }, range: [prev, n - 1], pointers, vars: vars() });
      prev = step;
      step += jump;

      if (prev >= n) {
        save(6, `prev = ${prev} ≥ n — ${x} is not in the array`, { vars: vars(), range: [n, n], result: "miss" });
        return steps;
      }

      save(5, `Jump: prev = ${prev}, step = ${step}`, { range: [prev, n - 1], pointers: [{ label: "prev", index: prev, tone: "blue" }], vars: vars() });
    } else {
      const block = Object.fromEntries(Array.from({ length: i - prev + 1 }, (_, k) => [prev + k, "block"]));
      save(3, `a[${i}] = ${a[i]} ≥ ${x} — if ${x} exists it's in block [${prev}..${i}]`, { roles: { ...block, [i]: "probe" }, range: [prev, i], pointers, vars: vars() });
      break;
    }
  }

  const end = Math.min(step, n);

  while (true) {
    compare();

    if (a[prev] >= x) break;

    save(8, `a[${prev}] = ${a[prev]} < ${x} — scan forward`, { roles: { [prev]: "probe" }, range: [prev, end - 1], pointers: [{ label: "prev", index: prev, tone: "blue" }], vars: vars() });
    prev++;

    if (prev === end) {
      save(10, `Ran off the end of the block — ${x} is not in the array`, { range: [end, end - 1], vars: vars(), result: "miss" });
      return steps;
    }
  }

  if (a[prev] === x) {
    save(12, `a[${prev}] = ${x} — found at index ${prev}!`, { roles: { [prev]: "found" }, range: [prev, prev], pointers: [{ label: "prev", index: prev, tone: "lime" }], vars: vars(), result: prev });
  } else {
    save(13, `a[${prev}] = ${a[prev]} > ${x} — ${x} is not in the array`, { roles: { [prev]: "miss" }, range: [prev, prev], vars: vars(), result: "miss" });
  }

  return steps;
}

/* ---------- exponential search ---------- */

export const EXPONENTIAL_CODE = [
  "int exponentialSearch(int a[], int n, int x) {",
  "  if (a[0] == x) return 0;",
  "  int i = 1;",
  "  while (i < n && a[i] <= x)",
  "    i *= 2;",
  "  int lo = i / 2, hi = min(i, n - 1);",
  "  while (lo <= hi) {",
  "    int mid = lo + (hi - lo) / 2;",
  "    if (a[mid] == x) return mid;",
  "    if (a[mid] < x) lo = mid + 1;",
  "    else hi = mid - 1;",
  "  }",
  "  return -1;",
  "}",
];

export function exponentialSearchSteps(a, x) {
  const n = a.length;
  const { steps, save, compare } = recorder();

  save(1, `exponentialSearch(${x}) on ${n} sorted elements`);

  compare();
  if (a[0] === x) {
    save(2, `a[0] = ${x} — found at index 0!`, { roles: { 0: "found" }, range: [0, 0], result: 0 });
    return steps;
  }
  save(2, `a[0] = ${a[0]} ≠ ${x}`, { roles: { 0: "probe" } });

  let i = 1;
  save(3, "Start the bound at i = 1", { pointers: [{ label: "i", index: i }], vars: [{ label: "i", value: i, tone: "orange" }] });

  while (i < n) {
    compare();

    if (a[i] > x) {
      save(4, `a[${i}] = ${a[i]} > ${x} — the bound has passed the target`, { roles: { [i]: "probe" }, pointers: [{ label: "i", index: i }], vars: [{ label: "i", value: i, tone: "orange" }] });
      break;
    }

    save(4, `a[${i}] = ${a[i]} ≤ ${x} — double the bound`, { roles: { [i]: "probe" }, pointers: [{ label: "i", index: i }], vars: [{ label: "i", value: i, tone: "orange" }] });
    i *= 2;
    save(5, i < n ? `i = ${i}` : `i = ${i} — past the end of the array`, { pointers: i < n ? [{ label: "i", index: i }] : [], vars: [{ label: "i", value: i, tone: "orange" }] });
  }

  let lo = Math.floor(i / 2);
  let hi = Math.min(i, n - 1);

  const view = (extra = {}) => ({
    range: [lo, hi],
    pointers: [
      { label: "lo", index: lo, tone: "blue" },
      { label: "hi", index: hi, tone: "cyan" },
      ...(extra.mid !== undefined ? [{ label: "mid", index: extra.mid }] : []),
    ],
    vars: [
      { label: "lo", value: lo, tone: "blue" },
      { label: "hi", value: hi, tone: "cyan" },
      ...(extra.mid !== undefined ? [{ label: "mid", value: extra.mid, tone: "orange" }] : []),
    ],
    roles: extra.roles,
    result: extra.result,
  });

  save(6, `Binary search inside [${lo}..${hi}]`, view());

  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    save(8, `mid = ${lo} + (${hi} - ${lo}) / 2 = ${mid}`, view({ mid, roles: { [mid]: "probe" } }));
    compare();

    if (a[mid] === x) {
      save(9, `a[${mid}] = ${x} — found at index ${mid}!`, view({ mid, roles: { [mid]: "found" }, result: mid }));
      return steps;
    }

    if (a[mid] < x) {
      save(10, `a[${mid}] = ${a[mid]} < ${x} — go right`, view({ mid, roles: { [mid]: "probe" } }));
      lo = mid + 1;
    } else {
      save(11, `a[${mid}] = ${a[mid]} > ${x} — go left`, view({ mid, roles: { [mid]: "probe" } }));
      hi = mid - 1;
    }
  }

  save(13, `lo > hi — ${x} is not in the array`, { range: [lo, hi], vars: [{ label: "lo", value: lo, tone: "blue" }, { label: "hi", value: hi, tone: "cyan" }], result: "miss" });
  return steps;
}

/* ---------- fibonacci search ---------- */

export const FIBONACCI_CODE = [
  "int fibonacciSearch(int a[], int n, int x) {",
  "  int f2 = 0, f1 = 1, f = f2 + f1;",
  "  while (f < n) {",
  "    f2 = f1; f1 = f; f = f2 + f1;",
  "  }",
  "  int offset = -1;",
  "  while (f > 1) {",
  "    int i = min(offset + f2, n - 1);",
  "    if (a[i] < x) {",
  "      f = f1; f1 = f2; f2 = f - f1;",
  "      offset = i;",
  "    } else if (a[i] > x) {",
  "      f = f2; f1 = f1 - f2; f2 = f - f1;",
  "    } else return i;",
  "  }",
  "  if (f1 && offset + 1 < n && a[offset + 1] == x)",
  "    return offset + 1;",
  "  return -1;",
  "}",
];

export function fibonacciSearchSteps(a, x) {
  const n = a.length;
  const { steps, save, compare } = recorder();
  let f2 = 0;
  let f1 = 1;
  let f = 1;
  let offset = -1;
  let hi = n - 1;

  const vars = () => [
    { label: "f₂", value: f2, tone: "cyan" },
    { label: "f₁", value: f1, tone: "blue" },
    { label: "f", value: f, tone: "orange" },
    { label: "offset", value: offset },
  ];
  // Candidates still in play
  const live = () => [offset + 1, hi];
  const offsetPtr = () => (offset >= 0 ? [{ label: "offset", index: offset, tone: "gray" }] : []);

  save(1, `fibonacciSearch(${x}) on ${n} sorted elements`, { vars: vars() });
  save(2, "Start with the first Fibonacci numbers 0, 1, 1", { vars: vars() });

  while (f < n) {
    f2 = f1;
    f1 = f;
    f = f2 + f1;
    save(4, `f = ${f}${f < n ? ` < ${n}, keep growing` : ` ≥ n = ${n} — smallest Fibonacci number covering the array`}`, { vars: vars() });
  }

  save(6, `offset = -1 — nothing eliminated yet`, { range: live(), vars: vars() });

  while (f > 1) {
    const i = Math.min(offset + f2, n - 1);
    const pointers = [...offsetPtr(), { label: "i", index: i }];
    save(8, `i = min(${offset} + ${f2}, ${n - 1}) = ${i}`, { roles: { [i]: "probe" }, range: live(), pointers, vars: vars() });
    compare();

    if (a[i] < x) {
      save(9, `a[${i}] = ${a[i]} < ${x} — drop everything up to ${i}`, { roles: { [i]: "probe" }, range: live(), pointers, vars: vars() });
      f = f1;
      f1 = f2;
      f2 = f - f1;
      offset = i;
      save(11, `Shift down one Fibonacci number; offset = ${offset}`, { range: live(), pointers: offsetPtr(), vars: vars() });
    } else if (a[i] > x) {
      save(12, `a[${i}] = ${a[i]} > ${x} — keep only the part before ${i}`, { roles: { [i]: "probe" }, range: live(), pointers, vars: vars() });
      f = f2;
      f1 = f1 - f2;
      f2 = f - f1;
      hi = i - 1;
      save(13, "Shift down two Fibonacci numbers", { range: live(), pointers: offsetPtr(), vars: vars() });
    } else {
      save(14, `a[${i}] = ${x} — found at index ${i}!`, { roles: { [i]: "found" }, range: [i, i], pointers: [{ label: "i", index: i, tone: "lime" }], vars: vars(), result: i });
      return steps;
    }
  }

  const last = offset + 1;

  if (f1 && last < n) {
    compare();

    if (a[last] === x) {
      save(17, `One candidate left: a[${last}] = ${x} — found at index ${last}!`, { roles: { [last]: "found" }, range: [last, last], vars: vars(), result: last });
      return steps;
    }

    save(16, `One candidate left: a[${last}] = ${a[last]} ≠ ${x}`, { roles: { [last]: "miss" }, range: [last, last], vars: vars() });
  }

  save(18, `${x} is not in the array`, { range: [n, n - 1], vars: vars(), result: "miss" });
  return steps;
}
