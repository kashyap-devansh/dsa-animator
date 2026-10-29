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

export function snapshot(root) {
  const nodes = [];
  let rank = 0;

  (function walk(n, depth) {
    if (!n) return;

    walk(n.left, depth + 1);
    nodes.push({
      id: n.id,
      value: n.value,
      parentId: n.parent ? n.parent.id : null,
      rank: rank++,
      depth,
      bf: balance(n),
    });
    walk(n.right, depth + 1);
  })(root, 0);

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

/* ---------- step recording ---------- */

function recorder(tree, counters) {
  const steps = [];

  const save = (codeLine, description, marks = {}, badge = null) => {
    steps.push({
      nodes: snapshot(tree.root),
      codeLine,
      description,
      marks,
      badge,
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
        save(10, `balance ${formatBf(bf)} and ${key} < ${child.value} — LL case`, trail(above, { [n.id]: "pivot", [child.id]: "rotate" }), "LL case");
        rotations++;
        rotateRight(tree, n);
        save(11, `rotateRight(${n.value}) — ${child.value} moves up`, trail(above, { [child.id]: "rotate", [n.id]: "settled" }), "LL · right rotation");
      } else {
        const grand = child.right;
        save(14, `balance ${formatBf(bf)} and ${key} > ${child.value} — LR case`, trail(above, { [n.id]: "pivot", [child.id]: "rotate", [grand.id]: "rotate" }), "LR case");
        rotations++;
        rotateLeft(tree, child);
        save(15, `rotateLeft(${child.value}) — turns it into an LL shape`, trail(above, { [n.id]: "pivot", [grand.id]: "rotate", [child.id]: "rotate" }), "LR · left rotation");
        rotations++;
        rotateRight(tree, n);
        save(16, `rotateRight(${n.value}) — ${grand.value} becomes subtree root`, trail(above, { [grand.id]: "rotate", [child.id]: "settled", [n.id]: "settled" }), "LR · right rotation");
      }
    } else if (bf < -1) {
      const child = n.right;

      if (key > child.value) {
        save(12, `balance ${formatBf(bf)} and ${key} > ${child.value} — RR case`, trail(above, { [n.id]: "pivot", [child.id]: "rotate" }), "RR case");
        rotations++;
        rotateLeft(tree, n);
        save(13, `rotateLeft(${n.value}) — ${child.value} moves up`, trail(above, { [child.id]: "rotate", [n.id]: "settled" }), "RR · left rotation");
      } else {
        const grand = child.left;
        save(18, `balance ${formatBf(bf)} and ${key} < ${child.value} — RL case`, trail(above, { [n.id]: "pivot", [child.id]: "rotate", [grand.id]: "rotate" }), "RL case");
        rotations++;
        rotateRight(tree, child);
        save(19, `rotateRight(${child.value}) — turns it into an RR shape`, trail(above, { [n.id]: "pivot", [grand.id]: "rotate", [child.id]: "rotate" }), "RL · right rotation");
        rotations++;
        rotateLeft(tree, n);
        save(20, `rotateLeft(${n.value}) — ${grand.value} becomes subtree root`, trail(above, { [grand.id]: "rotate", [child.id]: "settled", [n.id]: "settled" }), "RL · left rotation");
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
    replaceChild(tree, node.parent, node, child);
    save(line, child ? `${child.value}'s subtree moves up` : `${key} removed`, trail(path, child ? { [child.id]: "rotate" } : {}));

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

    const oldValue = node.value;
    node.value = succ.value;
    save(11, `Copy successor: ${oldValue} becomes ${succ.value}`, trail(path, { [node.id]: "new", [succ.id]: "successor" }));

    const child = succ.right;
    save(12, child ? `Remove old ${succ.value} — its right child ${child.value} moves up` : `Remove old ${succ.value} — it is a leaf`, trail(path, { [node.id]: "new", [succ.id]: "remove" }));
    replaceChild(tree, succ.parent, succ, child);
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

      save(16, `balance ${formatBf(bf)}: deleted from right, left child ${child.value} has bf ${formatBf(cbf)} — ${name} case`, trail(above, { [n.id]: "pivot", [child.id]: "rotate" }), `${name} case`);

      if (cbf < 0) {
        const grand = child.right;
        save(18, `${name}: rotateLeft(${child.value}) first`, trail(above, { [n.id]: "pivot", [child.id]: "rotate", [grand.id]: "rotate" }), `${name} · left rotation`);
        rotations++;
        rotateLeft(tree, child);
        save(18, `${grand.value} lifted above ${child.value}`, trail(above, { [n.id]: "pivot", [grand.id]: "rotate", [child.id]: "rotate" }), `${name} · left rotation`);
      }

      const pivot = n.left;
      rotations++;
      rotateRight(tree, n);
      save(19, `${name}: rotateRight(${n.value}) — ${pivot.value} moves up`, trail(above, { [pivot.id]: "rotate", [n.id]: "settled" }), `${name} · right rotation`);
    } else if (bf < -1) {
      const child = n.right;
      const cbf = balance(child);
      const name = `L${cbf}`;

      save(21, `balance ${formatBf(bf)}: deleted from left, right child ${child.value} has bf ${formatBf(cbf)} — ${name} case`, trail(above, { [n.id]: "pivot", [child.id]: "rotate" }), `${name} case`);

      if (cbf > 0) {
        const grand = child.left;
        save(23, `${name}: rotateRight(${child.value}) first`, trail(above, { [n.id]: "pivot", [child.id]: "rotate", [grand.id]: "rotate" }), `${name} · right rotation`);
        rotations++;
        rotateRight(tree, child);
        save(23, `${grand.value} lifted above ${child.value}`, trail(above, { [n.id]: "pivot", [grand.id]: "rotate", [child.id]: "rotate" }), `${name} · right rotation`);
      }

      const pivot = n.right;
      rotations++;
      rotateLeft(tree, n);
      save(24, `${name}: rotateLeft(${n.value}) — ${pivot.value} moves up`, trail(above, { [pivot.id]: "rotate", [n.id]: "settled" }), `${name} · left rotation`);
    }
  }

  save(26, rotations ? "Tree is balanced again" : "No rotation needed — tree is balanced", {});

  return { steps, result: tree.root };
}
