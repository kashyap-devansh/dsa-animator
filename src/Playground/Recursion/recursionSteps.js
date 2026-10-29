// Step generators for the recursion pages. Kept free of React so they can be
// tested on their own.

/* ---------- call-tree helper (fibonacci, subset sum) ---------- */

// Records a binary call tree as it is explored, then lays every step out
// against the final tree so nodes keep their position as calls appear.
function callTree() {
  const nodes = new Map();
  const state = new Map();
  const raw = [];
  let seq = 0;

  const add = (parentId, side, label) => {
    const id = ++seq;
    nodes.set(id, { id, parentId, label, left: null, right: null });
    if (parentId) nodes.get(parentId)[side] = id;
    state.set(id, { role: "active", note: null });
    return id;
  };

  const set = (id, role, note) => {
    const prev = state.get(id);
    state.set(id, { role: role === undefined ? prev.role : role, note: note === undefined ? prev.note : note });
  };

  const save = (info) => {
    raw.push({ ...info, state: new Map(state) });
  };

  const finish = () => {
    const layout = new Map();
    let rank = 0;

    (function walk(id, depth) {
      if (!id) return;
      const node = nodes.get(id);
      walk(node.left, depth + 1);
      layout.set(id, { rank: rank++, depth });
      walk(node.right, depth + 1);
    })(nodes.size ? 1 : null, 0);

    return raw.map(({ state: snap, ...info }) => {
      const marks = {};
      const visible = [];

      snap.forEach((s, id) => {
        const node = nodes.get(id);
        visible.push({ id, value: node.label, parentId: node.parentId, ...layout.get(id), bf: 0, note: s.note });
        if (s.role) marks[id] = s.role;
      });

      return { ...info, nodes: visible, marks, span: nodes.size, badge: info.badge ?? null };
    });
  };

  return { add, set, save, finish };
}

/* ---------- factorial ---------- */

export const FACTORIAL_CODE = [
  "long factorial(int n) {",
  "  if (n <= 1) return 1;",
  "  return n * factorial(n - 1);",
  "}",
];

export function factorialSteps(n) {
  const steps = [];
  const frames = [];
  let calls = 0;

  const save = (codeLine, description, active) => {
    steps.push({
      codeLine,
      description,
      frames: frames.map((f) => ({ ...f })),
      active,
      calls,
      depth: frames.length,
    });
  };

  // descend
  for (let k = n; ; k--) {
    calls++;
    frames.push({ n: k, status: "running", value: null });
    save(1, `Call factorial(${k}) — push a new stack frame`, k);

    if (k <= 1) {
      frames.at(-1).status = "base";
      frames.at(-1).value = 1;
      save(2, `Base case: ${k} ≤ 1, return 1`, k);
      break;
    }

    frames.at(-1).status = "waiting";
    save(3, `${k} > 1 — needs factorial(${k - 1}) first, so this frame waits`, k);
  }

  // unwind
  let value = 1;
  frames.pop();

  while (frames.length) {
    const frame = frames.at(-1);
    const result = frame.n * value;
    frame.status = "returning";
    frame.value = result;
    save(3, `factorial(${frame.n}) = ${frame.n} × ${value} = ${result}`, frame.n);
    value = result;
    frames.pop();
  }

  steps.push({ codeLine: 3, description: `Stack empty — factorial(${n}) = ${value}`, frames: [], active: null, calls, depth: 0, result: value });

  return steps;
}

/* ---------- fibonacci ---------- */

export const FIB_CODE = [
  "int fib(int n) {",
  "  if (n <= 1) return n;",
  "  return fib(n - 1) + fib(n - 2);",
  "}",
];

export const FIB_MEMO_CODE = [
  "int fib(int n, vector<int>& memo) {",
  "  if (n <= 1) return n;",
  "  if (memo[n] != -1) return memo[n];",
  "  int a = fib(n - 1, memo);",
  "  int b = fib(n - 2, memo);",
  "  return memo[n] = a + b;",
  "}",
];

export function fibonacciSteps(n, memoize) {
  const tree = callTree();
  const memo = new Map();
  let calls = 0;
  let hits = 0;
  const L = memoize
    ? { call: 1, base: 2, hit: 3, left: 4, right: 5, ret: 6 }
    : { call: 1, base: 2, hit: 3, left: 3, right: 3, ret: 3 };

  const save = (codeLine, description) => tree.save({ codeLine, description, calls, hits });

  function fib(k, parentId, side) {
    calls++;
    const id = tree.add(parentId, side, `f(${k})`);
    if (parentId) tree.set(parentId, "path");
    save(L.call, `Call fib(${k})`);

    if (k <= 1) {
      tree.set(id, "found", `=${k}`);
      save(L.base, `Base case: fib(${k}) = ${k}`);
      if (parentId) tree.set(parentId, "active");
      return k;
    }

    if (memoize && memo.has(k)) {
      hits++;
      tree.set(id, "successor", `=${memo.get(k)}`);
      save(L.hit, `Memo hit: fib(${k}) = ${memo.get(k)} already computed — no recursion`);
      if (parentId) tree.set(parentId, "active");
      return memo.get(k);
    }

    save(L.left, `fib(${k}) needs fib(${k - 1}) first`);
    const a = fib(k - 1, id, "left");
    tree.set(id, "active", `${a}+?`);
    save(L.right, `fib(${k - 1}) returned ${a}; now fib(${k}) needs fib(${k - 2})`);
    const b = fib(k - 2, id, "right");

    const value = a + b;
    if (memoize) memo.set(k, value);
    tree.set(id, "found", `=${value}`);
    save(L.ret, `fib(${k}) = ${a} + ${b} = ${value}${memoize ? " — stored in memo" : ""}`);
    if (parentId) tree.set(parentId, "active");
    return value;
  }

  const result = fib(n, null, null);
  tree.save({ codeLine: L.ret, description: `fib(${n}) = ${result} using ${calls} calls${memoize ? `, ${hits} memo hits` : ""}`, calls, hits, result });

  return tree.finish();
}

/* ---------- subset sum ---------- */

export const SUBSET_CODE = [
  "bool solve(int i, int sum) {",
  "  if (sum == target) return true;",
  "  if (i == n || sum > target) return false;",
  "  if (solve(i + 1, sum + a[i]))   // take",
  "    return true;",
  "  return solve(i + 1, sum);       // skip",
  "}",
];

export function subsetSumSteps(a, target) {
  const tree = callTree();
  const n = a.length;
  const taken = [];
  const stack = [];
  let calls = 0;
  let found = false;

  const save = (codeLine, description, current) =>
    tree.save({ codeLine, description, calls, taken: [...taken], current, sum: taken.reduce((s, i) => s + a[i], 0) });

  function solve(i, sum, parentId, side) {
    calls++;
    const id = tree.add(parentId, side, `${sum}`);
    if (parentId) tree.set(parentId, "path");
    stack.push(id);
    save(1, `solve(i = ${i}, sum = ${sum})`, i);

    if (sum === target) {
      found = true;
      stack.forEach((s) => tree.set(s, "found"));
      tree.set(id, "found", "✓");
      save(2, `sum = ${target} — found a subset: {${taken.map((t) => a[t]).join(", ")}}`, i);
      stack.pop();
      return true;
    }

    if (i === n || sum > target) {
      tree.set(id, "remove", "✗");
      save(3, sum > target ? `sum ${sum} > ${target} — overshoot, backtrack` : `No items left and sum ${sum} ≠ ${target} — backtrack`, i);
      stack.pop();
      if (parentId) tree.set(parentId, "active");
      return false;
    }

    taken.push(i);
    save(4, `Take a[${i}] = ${a[i]} → sum ${sum + a[i]}`, i);
    if (solve(i + 1, sum + a[i], id, "left")) {
      save(5, `Success bubbles up through solve(${i}, ${sum})`, i);
      stack.pop();
      return true;
    }
    taken.pop();

    tree.set(id, "active");
    save(6, `Taking ${a[i]} failed — skip it instead`, i);
    const ok = solve(i + 1, sum, id, "right");

    stack.pop();
    if (!ok) {
      tree.set(id, null, "✗");
      if (parentId) tree.set(parentId, "active");
    }
    return ok;
  }

  solve(0, 0, null, null);

  if (!found) {
    tree.save({ codeLine: 6, description: `Every branch failed — no subset sums to ${target}`, calls, taken: [], current: null, sum: 0, result: false });
  }

  return tree.finish();
}

/* ---------- permutations ---------- */

export const PERMUTATION_CODE = [
  "void permute(string& s, int l) {",
  "  if (l == s.size() - 1) { print(s); return; }",
  "  for (int i = l; i < s.size(); i++) {",
  "    swap(s[l], s[i]);",
  "    permute(s, l + 1);",
  "    swap(s[l], s[i]);   // backtrack",
  "  }",
  "}",
];

export function permutationSteps(letters) {
  const s = [...letters];
  const n = s.length;
  const steps = [];
  const output = [];
  const stack = [];
  let swaps = 0;

  const save = (codeLine, description, view = {}) => {
    steps.push({
      codeLine,
      description,
      items: [...s],
      l: view.l ?? null,
      i: view.i ?? null,
      swapping: view.swapping ?? [],
      stack: [...stack],
      output: [...output],
      latest: view.latest ?? null,
      swaps,
    });
  };

  function permute(l) {
    stack.push(l);
    save(1, `permute(l = ${l}) — positions before ${l} are fixed`, { l });

    if (l === n - 1) {
      output.push(s.join(""));
      save(2, `l is the last index — print "${s.join("")}"`, { l, latest: output.length - 1 });
      stack.pop();
      return;
    }

    for (let i = l; i < n; i++) {
      save(3, `i = ${i}: put s[${i}] = ${s[i]} at position ${l}`, { l, i });
      [s[l], s[i]] = [s[i], s[l]];
      if (i !== l) swaps++;
      save(4, i === l ? `swap(s[${l}], s[${i}]) — same slot, nothing moves` : `swap(s[${l}], s[${i}]) → ${s.join("")}`, { l, i, swapping: [l, i] });
      save(5, `Recurse to fix position ${l + 1}`, { l, i });
      permute(l + 1);
      [s[l], s[i]] = [s[i], s[l]];
      if (i !== l) swaps++;
      save(6, i === l ? `Backtrack — swap(s[${l}], s[${i}]) is a no-op` : `Backtrack — swap back → ${s.join("")}`, { l, i, swapping: [l, i] });
    }

    stack.pop();
  }

  permute(0);
  save(8, `Done — ${output.length} permutations of "${letters.join("")}"`);

  return steps;
}

/* ---------- n-queens ---------- */

export const QUEENS_CODE = [
  "bool solve(int row) {",
  "  if (row == n) return true;",
  "  for (int col = 0; col < n; col++) {",
  "    if (isSafe(row, col)) {",
  "      queen[row] = col;",
  "      if (solve(row + 1)) return true;",
  "      queen[row] = -1;          // backtrack",
  "    }",
  "  }",
  "  return false;",
  "}",
];

export function nQueensSteps(n) {
  const queen = new Array(n).fill(-1);
  const steps = [];
  let checks = 0;
  let placements = 0;
  let backtracks = 0;

  const save = (codeLine, description, view = {}) => {
    steps.push({
      codeLine,
      description,
      queens: [...queen],
      trying: view.trying ?? null,
      attacker: view.attacker ?? null,
      solved: view.solved ?? false,
      row: view.row ?? null,
      checks,
      placements,
      backtracks,
    });
  };

  const attackerOf = (row, col) => {
    for (let r = 0; r < row; r++) {
      const c = queen[r];
      if (c === col || Math.abs(c - col) === row - r) return [r, c];
    }
    return null;
  };

  function solve(row) {
    if (row === n) {
      save(2, `All ${n} queens placed — solved!`, { solved: true });
      return true;
    }

    for (let col = 0; col < n; col++) {
      checks++;
      const attacker = attackerOf(row, col);

      if (attacker) {
        const [r, c] = attacker;
        const why = c === col ? "same column" : "same diagonal";
        save(4, `(${row}, ${col}) is attacked by the queen at (${r}, ${c}) — ${why}`, { trying: [row, col], attacker, row });
        continue;
      }

      save(4, `(${row}, ${col}) is safe`, { trying: [row, col], row });
      queen[row] = col;
      placements++;
      save(5, `Place a queen at (${row}, ${col})`, { row });

      if (solve(row + 1)) return true;

      queen[row] = -1;
      backtracks++;
      save(7, `Row ${row + 1} has no safe column — remove the queen from (${row}, ${col})`, { trying: [row, col], row });
    }

    save(10, `No column works in row ${row} — backtrack to row ${row - 1}`, { row });
    return false;
  }

  save(1, `solve(0) on a ${n}×${n} board`, { row: 0 });
  solve(0);

  return steps;
}
