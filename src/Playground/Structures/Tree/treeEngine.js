// Shared tree model + step generators for the BST and AVL pages.
// Nodes keep a stable id for their whole life so the stage can animate
// them gliding into place when the tree is rotated or relinked.

let idSeq = 0;

export const newNode = (value, parent = null) => ({
  id: ++idSeq,
  value,
  left: null,
  right: null,
  parent,
});

export const height = (n) => (n ? 1 + Math.max(height(n.left), height(n.right)) : 0);
export const balance = (n) => (n ? height(n.left) - height(n.right) : 0);
export const countNodes = (n) => (n ? 1 + countNodes(n.left) + countNodes(n.right) : 0);

export const formatBf = (bf) => (bf > 0 ? `+${bf}` : `${bf}`);

export function cloneTree(node, parent = null) {
  if (!node) return null;

  const copy = { id: node.id, value: node.value, left: null, right: null, parent };
  copy.left = cloneTree(node.left, copy);
  copy.right = cloneTree(node.right, copy);

  return copy;
}

// spec: [value, leftSpec, rightSpec] — missing children may be omitted or null
export function fromSpec(spec, parent = null) {
  if (!spec) return null;

  const [value, left, right] = spec;
  const node = newNode(value, parent);
  node.left = fromSpec(left, node);
  node.right = fromSpec(right, node);

  return node;
}

export function collectValues(root) {
  const values = [];

  (function walk(n) {
    if (!n) return;
    walk(n.left);
    values.push(n.value);
    walk(n.right);
  })(root);

  return values;
}

export function collectNodes(root) {
  const nodes = [];

  (function walk(n) {
    if (!n) return;
    walk(n.left);
    nodes.push(n);
    walk(n.right);
  })(root);

  return nodes;
}

// Flatten the tree for drawing. `floating` are detached pieces shown lifted
// off the tree mid-operation: { node, depth, asRankOf? } — a whole subtree
// hanging from `node`, drawn at `depth`, or (asRankOf) at another node's place.
// Ranks follow value order, which a rotation never changes, so during a
// rotation nodes only move up and down.
export function snapshot(root, floating = []) {
  const nodes = [];

  const walk = (n, depth, parentId, float) => {
    if (!n) return;
    walk(n.left, depth + 1, n.id, float);
    nodes.push({ id: n.id, value: n.value, parentId, depth, bf: balance(n), float });
    walk(n.right, depth + 1, n.id, float);
  };

  walk(root, 0, null, false);
  floating.forEach((f) => walk(f.node, f.depth, null, true));

  const order = [...nodes].sort((a, b) => a.value - b.value || a.id - b.id);
  order.forEach((n, i) => (n.rank = i));

  floating.forEach((f) => {
    if (f.asRankOf === undefined) return;
    const target = nodes.find((n) => n.id === f.asRankOf && !n.float);
    const self = nodes.find((n) => n.id === f.node.id && n.float);
    if (target && self) self.rank = target.rank;
  });

  return nodes;
}

export function randomValues(count, exclude = []) {
  const values = new Set();
  const taken = new Set(exclude);

  while (values.size < count) {
    const v = Math.floor(Math.random() * 90) + 10;
    if (!taken.has(v)) values.add(v);
  }

  return Array.from(values);
}

export function randomMissingValue(root) {
  return randomValues(1, collectValues(root))[0];
}

/* ---------- structural helpers (tree = { root }) ---------- */

function replaceChild(tree, parent, oldChild, newChild) {
  if (newChild) newChild.parent = parent;

  if (!parent) tree.root = newChild;
  else if (parent.left === oldChild) parent.left = newChild;
  else parent.right = newChild;
}

export function rotateRight(tree, y) {
  const x = y.left;
  const t2 = x.right;

  replaceChild(tree, y.parent, y, x);
  x.right = y;
  y.parent = x;
  y.left = t2;
  if (t2) t2.parent = y;

  return x;
}

export function rotateLeft(tree, x) {
  const y = x.right;
  const t2 = y.left;

  replaceChild(tree, x.parent, x, y);
  y.left = x;
  x.parent = y;
  x.right = t2;
  if (t2) t2.parent = x;

  return y;
}

function attach(tree, value) {
  let node = tree.root;
  let parent = null;

  while (node) {
    if (value === node.value) return null;
    parent = node;
    node = value < node.value ? node.left : node.right;
  }

  const fresh = newNode(value, parent);

  if (!parent) tree.root = fresh;
  else if (value < parent.value) parent.left = fresh;
  else parent.right = fresh;

  return fresh;
}

function rebalanceSilently(tree, node) {
  for (let n = node; n; n = n.parent) {
    const bf = balance(n);

    if (bf > 1) {
      if (balance(n.left) < 0) rotateLeft(tree, n.left);
      n = rotateRight(tree, n);
    } else if (bf < -1) {
      if (balance(n.right) > 0) rotateRight(tree, n.right);
      n = rotateLeft(tree, n);
    }
  }
}

export function buildBST(values) {
  const tree = { root: null };
  values.forEach((v) => attach(tree, v));
  return tree.root;
}

export function buildAVL(values) {
  const tree = { root: null };

  values.forEach((v) => {
    const fresh = attach(tree, v);
    if (fresh) rebalanceSilently(tree, fresh);
  });

  return tree.root;
}

/* ---------- staged rotations ---------- */

// Performs a rotation at `x` in four visible stages and returns the node
// that ends up on top. dir "right": x's left child y moves up, y's right
// subtree t2 is handed to x as its left subtree. "left" is the mirror.
function stagedRotate(tree, x, dir, save, line, marksAbove, badge) {
  const right = dir === "right";
  const y = right ? x.left : x.right;
  const t2 = right ? y.right : y.left;
  const side = right ? "right" : "left";
  const other = right ? "left" : "right";
  const depthOf = (n) => {
    let d = 0;
    for (let k = n; k.parent; k = k.parent) d++;
    return d;
  };
  const sub = (root) => {
    const ids = {};
    (function walk(n) {
      if (!n) return;
      ids[n.id] = "successor";
      walk(n.left);
      walk(n.right);
    })(root);
    return ids;
  };
  const labels = { [x.id]: "pivot", [y.id]: "moves up", ...(t2 ? { [t2.id]: "handed over" } : {}) };
  const marks = () => ({ ...marksAbove, ...(t2 ? sub(t2) : {}), [x.id]: "pivot", [y.id]: "rotate" });

  const intro = `${x.value} is the pivot. ${y.value} will move up into its place${t2 ? `, and ${t2.value}'s subtree will be handed over to ${x.value}` : ""}.`;
  save(line, `${right ? "Right" : "Left"} rotation at ${x.value} — ${intro}`, marks(), badge, { dir, at: x.id }, { labels });

  let t2Depth = 0;
  if (t2) {
    t2Depth = depthOf(t2);
    if (right) y.right = null;
    else y.left = null;
    t2.parent = null;
    save(line, `Cut ${t2.value}'s subtree loose from ${y.value} — ${y.value}'s ${side} side is about to hold ${x.value}, so this subtree needs a new parent.`, marks(), badge, { dir, at: x.id }, { labels, floating: [{ node: t2, depth: t2Depth }] });
  }

  replaceChild(tree, x.parent, x, y);
  if (right) {
    y.right = x;
    x.left = null;
  } else {
    y.left = x;
    x.right = null;
  }
  x.parent = y;
  save(
    line,
    `${y.value} moves up, ${x.value} drops to be its ${side} child — whatever pointed to ${x.value} now points to ${y.value}.`,
    marks(),
    badge,
    { dir, at: y.id, done: true },
    { labels, floating: t2 ? [{ node: t2, depth: t2Depth }] : [] }
  );

  if (t2) {
    if (right) x.left = t2;
    else x.right = t2;
    t2.parent = x;
    save(line, `${t2.value}'s subtree becomes ${x.value}'s ${other} child — every value in it lies between ${right ? y.value : x.value} and ${right ? x.value : y.value}, so it fits exactly here. Left-to-right order is unchanged.`, marks(), badge, { dir, at: y.id, done: true }, { labels });
  }

  return y;
}

/* ---------- step recording ---------- */

function recorder(tree, counters) {
  const steps = [];

  // rot: { dir: "left" | "right", at: node id, done: bool } for rotation steps:
  // the planned rotation before it happens, and where it pivoted after.
  // extra: { floating: [...], labels: { id: "X" } } for staged operations.
  const save = (codeLine, description, marks = {}, badge = null, rot = null, extra = {}) => {
    steps.push({
      nodes: snapshot(tree.root, extra.floating ?? []),
      labels: extra.labels ?? null,
      codeLine,
      description,
      marks,
      badge,
      rot,
      ...counters(),
    });
  };

  return { steps, save };
}

const trail = (path, extra = {}) => ({
  ...Object.fromEntries(path.map((n) => [n.id, "path"])),
  ...extra,
});

export const snapshotHeight = (nodes) =>
  nodes.length ? Math.max(...nodes.map((n) => n.depth)) + 1 : 0;

export const parseKey = (input) =>
  input === "" || isNaN(Number(input)) ? null : Number(input);

/* ---------- search ---------- */

export function searchSteps(source, key) {
  const tree = { root: cloneTree(source) };
  let comparisons = 0;
  const { steps, save } = recorder(tree, () => ({ comparisons, rotations: 0 }));
  const path = [];

  save(1, `search(${key})`);

  let node = tree.root;

  while (node) {
    comparisons++;
    save(2, `Visit ${node.value}`, trail(path, { [node.id]: "active" }));

    if (key === node.value) {
      save(3, `${key} == ${node.value} — found it!`, trail(path, { [node.id]: "found" }), "found");
      return { steps, result: tree.root };
    }

    path.push(node);

    if (key < node.value) {
      save(4, `${key} < ${node.value} — go left`, trail(path, { [node.id]: "active" }));
      node = node.left;
    } else {
      save(5, `${key} > ${node.value} — go right`, trail(path, { [node.id]: "active" }));
      node = node.right;
    }
  }

  save(7, `Hit nullptr — ${key} is not in the tree`, trail(path), "not found");

  return { steps, result: tree.root };
}

/* ---------- insertion (BST, optionally AVL-balanced) ---------- */

export function insertSteps(source, key, { balanced = false } = {}) {
  const tree = { root: cloneTree(source) };
  let comparisons = 0;
  let rotations = 0;
  const { steps, save } = recorder(tree, () => ({ comparisons, rotations }));
  const path = [];

  save(1, `insert(${key})`);

  let node = tree.root;
  let parent = null;

  while (node) {
    comparisons++;

    if (key === node.value) {
      save(7, `${key} already exists — nothing to insert`, trail(path, { [node.id]: "active" }));
      return { steps, result: tree.root };
    }

    path.push(node);
    parent = node;

    if (key < node.value) {
      save(3, `${key} < ${node.value} — go left`, trail(path, { [node.id]: "active" }));
      node = node.left;
    } else {
      save(5, `${key} > ${node.value} — go right`, trail(path, { [node.id]: "active" }));
      node = node.right;
    }
  }

  const fresh = newNode(key, parent);

  if (!parent) tree.root = fresh;
  else if (key < parent.value) parent.left = fresh;
  else parent.right = fresh;

  save(2, parent ? `Empty spot — new Node(${key})` : `Empty tree — ${key} becomes the root`, trail(path, { [fresh.id]: "new" }));

  if (!balanced) {
    save(7, "Return back up the recursion — insert complete", { [fresh.id]: "new" });
    return { steps, result: tree.root };
  }

  // Unwind the recursion: every ancestor updates its height and checks its balance.
  for (let i = path.length - 1; i >= 0; i--) {
    const n = path[i];
    const above = path.slice(0, i);
    const bf = balance(n);

    save(9, `update(${n.value}) → height ${height(n)}, balance ${formatBf(bf)}`, trail(above, { [n.id]: "active" }));

    if (bf > 1) {
      const child = n.left;

      if (key < child.value) {
        save(10, `balance ${formatBf(bf)} and ${key} < ${child.value} — LL case`, trail(above, { [n.id]: "pivot", [child.id]: "rotate" }), "LL case", { dir: "right", at: n.id });
        rotations++;
        stagedRotate(tree, n, "right", save, 11, trail(above), "LL · right rotation");
      } else {
        const grand = child.right;
        save(14, `balance ${formatBf(bf)} and ${key} > ${child.value} — LR case`, trail(above, { [n.id]: "pivot", [child.id]: "rotate", [grand.id]: "rotate" }), "LR case", { dir: "left", at: child.id });
        rotations++;
        stagedRotate(tree, child, "left", save, 15, trail(above, { [n.id]: "path" }), "LR · first, left rotation");
        rotations++;
        stagedRotate(tree, n, "right", save, 16, trail(above), "LR · then, right rotation");
      }
    } else if (bf < -1) {
      const child = n.right;

      if (key > child.value) {
        save(12, `balance ${formatBf(bf)} and ${key} > ${child.value} — RR case`, trail(above, { [n.id]: "pivot", [child.id]: "rotate" }), "RR case", { dir: "left", at: n.id });
        rotations++;
        stagedRotate(tree, n, "left", save, 13, trail(above), "RR · left rotation");
      } else {
        const grand = child.left;
        save(18, `balance ${formatBf(bf)} and ${key} < ${child.value} — RL case`, trail(above, { [n.id]: "pivot", [child.id]: "rotate", [grand.id]: "rotate" }), "RL case", { dir: "right", at: child.id });
        rotations++;
        stagedRotate(tree, child, "right", save, 19, trail(above, { [n.id]: "path" }), "RL · first, right rotation");
        rotations++;
        stagedRotate(tree, n, "left", save, 20, trail(above), "RL · then, left rotation");
      }
    }
  }

  save(22, rotations ? "Tree is balanced again" : "No rotation needed — tree is balanced", {});

  return { steps, result: tree.root };
}

/* ---------- deletion (BST, optionally AVL-balanced) ---------- */

export function deleteSteps(source, key, { balanced = false } = {}) {
  const tree = { root: cloneTree(source) };
  let comparisons = 0;
  let rotations = 0;
  const { steps, save } = recorder(tree, () => ({ comparisons, rotations }));
  const path = [];

  save(1, `remove(${key})`);

  let node = tree.root;

  while (node && node.value !== key) {
    comparisons++;
    path.push(node);

    if (key < node.value) {
      save(3, `${key} < ${node.value} — go left`, trail(path, { [node.id]: "active" }));
      node = node.left;
    } else {
      save(5, `${key} > ${node.value} — go right`, trail(path, { [node.id]: "active" }));
      node = node.right;
    }
  }

  if (!node) {
    save(2, `Hit nullptr — ${key} is not in the tree`, trail(path), "not found");
    return { steps, result: tree.root };
  }

  comparisons++;
  save(7, `Found ${key}`, trail(path, { [node.id]: "found" }));

  // Ancestors whose height may have changed, top-down.
  let unwind;

  if (!node.left || !node.right) {
    const child = node.left || node.right;
    const line = node.left ? 9 : 8;
    const what = !child
      ? `${key} is a leaf — just unlink it`
      : `${key} has one child — ${child.value} takes its place`;

    save(line, what, trail(path, { [node.id]: "remove", ...(child ? { [child.id]: "rotate" } : {}) }));
    const nodeDepth = path.length;
    replaceChild(tree, node.parent, node, child);
    node.left = node.right = null;
    save(
      line,
      child ? `Unlink ${key}: ${node.parent ? node.parent.value : "the root"} now points to ${child.value}` : `Unlink ${key} from ${node.parent ? node.parent.value : "the tree"}`,
      trail(path, { [node.id]: "remove", ...(child ? { [child.id]: "rotate" } : {}) }),
      null,
      null,
      { floating: [{ node, depth: nodeDepth }], labels: { [node.id]: "removed" } }
    );
    save(line, child ? `${child.value}'s subtree moves up into ${key}'s place` : `${key} is gone`, trail(path, child ? { [child.id]: "rotate" } : {}));

    unwind = path;
  } else {
    save(10, `${key} has two children — find inorder successor`, trail(path, { [node.id]: "found" }));

    const succPath = [];
    let succ = node.right;

    while (true) {
      comparisons++;
      save(10, succ.left ? `minNode: ${succ.value} has a left child — keep going left` : `minNode: ${succ.value} is the smallest in the right subtree`, trail(path, { [node.id]: "found", ...Object.fromEntries(succPath.map((n) => [n.id, "path"])), [succ.id]: succ.left ? "active" : "successor" }));
      if (!succ.left) break;
      succPath.push(succ);
      succ = succ.left;
    }

    // A copy of the successor's value travels up into the deleted node's slot.
    const oldValue = node.value;
    const nodeDepth = path.length;
    const succDepth = nodeDepth + 1 + succPath.length;
    const copy = newNode(succ.value);
    save(11, `Lift a copy of ${succ.value}`, trail(path, { [node.id]: "found", [succ.id]: "successor", [copy.id]: "successor" }), null, null, {
      floating: [{ node: copy, depth: succDepth, asRankOf: succ.id }],
      labels: { [copy.id]: `copy of ${succ.value}` },
    });
    save(11, `Carry ${succ.value} up to ${oldValue}'s place`, trail(path, { [node.id]: "found", [succ.id]: "successor", [copy.id]: "successor" }), null, null, {
      floating: [{ node: copy, depth: nodeDepth, asRankOf: node.id }],
      labels: { [copy.id]: `copy of ${succ.value}` },
    });
    node.value = succ.value;
    save(11, `${oldValue} is overwritten with ${succ.value}`, trail(path, { [node.id]: "new", [succ.id]: "successor" }));

    const child = succ.right;
    save(12, child ? `Remove the old ${succ.value} — its right child ${child.value} will move up` : `Remove the old ${succ.value} — it is a leaf`, trail(path, { [node.id]: "new", [succ.id]: "remove" }));
    replaceChild(tree, succ.parent, succ, child);
    succ.left = succ.right = null;
    save(12, child ? `Unlink the old ${succ.value}; ${child.value} moves up` : `Unlink the old ${succ.value}`, trail(path, { [node.id]: "new", ...(child ? { [child.id]: "rotate" } : {}) }), null, null, {
      floating: [{ node: succ, depth: succDepth }],
      labels: { [succ.id]: "removed" },
    });
    save(12, `Successor removed`, trail(path, { [node.id]: "new", ...(child ? { [child.id]: "rotate" } : {}) }));

    unwind = [...path, node, ...succPath];
  }

  if (!balanced) {
    save(14, "Return back up the recursion — delete complete", {});
    return { steps, result: tree.root };
  }

  for (let i = unwind.length - 1; i >= 0; i--) {
    const n = unwind[i];
    const above = unwind.slice(0, i);
    const bf = balance(n);

    save(15, `update(${n.value}) → height ${height(n)}, balance ${formatBf(bf)}`, trail(above, { [n.id]: "active" }));

    if (bf > 1) {
      const child = n.left;
      const cbf = balance(child);
      const name = `R${cbf}`;

      save(16, `balance ${formatBf(bf)}: deleted from right, left child ${child.value} has bf ${formatBf(cbf)} — ${name} case`, trail(above, { [n.id]: "pivot", [child.id]: "rotate" }), `${name} case`, { dir: "right", at: n.id });

      if (cbf < 0) {
        rotations++;
        stagedRotate(tree, child, "left", save, 18, trail(above, { [n.id]: "path" }), `${name} · first, left rotation`);
      }

      rotations++;
      stagedRotate(tree, n, "right", save, 19, trail(above), `${name} · right rotation`);
    } else if (bf < -1) {
      const child = n.right;
      const cbf = balance(child);
      const name = `L${cbf}`;

      save(21, `balance ${formatBf(bf)}: deleted from left, right child ${child.value} has bf ${formatBf(cbf)} — ${name} case`, trail(above, { [n.id]: "pivot", [child.id]: "rotate" }), `${name} case`, { dir: "left", at: n.id });

      if (cbf > 0) {
        rotations++;
        stagedRotate(tree, child, "right", save, 23, trail(above, { [n.id]: "path" }), `${name} · first, right rotation`);
      }

      rotations++;
      stagedRotate(tree, n, "left", save, 24, trail(above), `${name} · left rotation`);
    }
  }

  save(26, rotations ? "Tree is balanced again" : "No rotation needed — tree is balanced", {});

  return { steps, result: tree.root };
}
