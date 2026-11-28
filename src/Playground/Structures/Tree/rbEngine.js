// Red-black trees, on the same node model and stage as BST / AVL.
// Nodes carry `red` (true / false); empty children are black NIL leaves.
//
// The rules: the root is black, a red node never has a red child, and every
// path from a node down to a NIL passes the same number of black nodes.
// Insertion can only break the red–red rule; deletion can only break the
// black count. Each fix is a recolour, a rotation, or both, and each of those
// is its own step here.

import { newNode, snapshot, stagedRotate, replaceChild, rotateLeft, rotateRight, collectValues, randomValues } from "./treeEngine.js";

export const isRed = (n) => !!n && n.red;
const colourName = (n) => (isRed(n) ? "red" : "black");

export function rbClone(node, parent = null) {
  if (!node) return null;
  const copy = { id: node.id, value: node.value, red: node.red, left: null, right: null, parent };
  copy.left = rbClone(node.left, copy);
  copy.right = rbClone(node.right, copy);
  return copy;
}

// spec: [value, "r" | "b", leftSpec, rightSpec]
export function rbFromSpec(spec, parent = null) {
  if (!spec) return null;
  const [value, colour, left, right] = spec;
  const node = newNode(value, parent);
  node.red = colour === "r";
  node.left = rbFromSpec(left, node);
  node.right = rbFromSpec(right, node);
  return node;
}

// Black nodes on every path down from n (NIL counted as one), or -1 if the
// paths disagree or a red node has a red child.
export function blackHeight(n) {
  if (!n) return 1;
  if (n.red && (isRed(n.left) || isRed(n.right))) return -1;
  const l = blackHeight(n.left);
  const r = blackHeight(n.right);
  if (l < 0 || r < 0 || l !== r) return -1;
  return l + (n.red ? 0 : 1);
}

export const isValidRB = (root) => !isRed(root) && blackHeight(root) > 0;

/* ---------- building trees without steps ---------- */

function quietInsert(tree, value) {
  let node = tree.root;
  let parent = null;
  while (node) {
    if (value === node.value) return;
    parent = node;
    node = value < node.value ? node.left : node.right;
  }
  const z = newNode(value, parent);
  z.red = true;
  if (!parent) tree.root = z;
  else if (value < parent.value) parent.left = z;
  else parent.right = z;

  let x = z;
  while (x !== tree.root && x.parent.red) {
    const p = x.parent;
    const g = p.parent;
    const pLeft = p === g.left;
    const u = pLeft ? g.right : g.left;
    if (isRed(u)) {
      p.red = false;
      u.red = false;
      g.red = true;
      x = g;
      continue;
    }
    if (pLeft && x === p.right) {
      rotateLeft(tree, p);
      x = p;
    } else if (!pLeft && x === p.left) {
      rotateRight(tree, p);
      x = p;
    }
    x.parent.red = false;
    g.red = true;
    if (pLeft) rotateRight(tree, g);
    else rotateLeft(tree, g);
    break;
  }
  tree.root.red = false;
}

export function buildRB(values) {
  const tree = { root: null };
  values.forEach((v) => quietInsert(tree, v));
  return tree.root;
}

export const randomRB = (count) => buildRB(randomValues(count));

export const rbCount = (n) => (n ? 1 + rbCount(n.left) + rbCount(n.right) : 0);

/* ---------- step recording ---------- */

function recorder(tree, counters) {
  const steps = [];
  const save = (codeLine, description, marks = {}, badge = null, rot = null, extra = {}) => {
    const floating = extra.floating ?? [];
    const nodes = snapshot(tree.root, floating);
    const colour = {};
    const walk = (n) => {
      if (!n) return;
      colour[n.id] = !!n.red;
      walk(n.left);
      walk(n.right);
    };
    walk(tree.root);
    floating.forEach((f) => walk(f.node));
    nodes.forEach((n) => (n.red = colour[n.id]));
    steps.push({ nodes, labels: extra.labels ?? null, codeLine, description, marks, badge, rot, ...counters() });
  };
  return { steps, save };
}

const depthOf = (n) => {
  let d = 0;
  for (let k = n; k.parent; k = k.parent) d++;
  return d;
};

const trail = (path, extra = {}) => ({ ...Object.fromEntries(path.map((n) => [n.id, "path"])), ...extra });
const pick = (obj) => Object.fromEntries(Object.entries(obj).filter(([k]) => k !== "undefined" && k !== "null"));

/* ---------- code ---------- */

export const RB_INSERT_CODE = [
  "void insert(int key) {",
  "  Node* z = bstInsert(key);   // red",
  "  while (z != root && z->parent->red) {",
  "    Node *p = z->parent, *g = p->parent;",
  "    Node* u = uncle(z);",
  "    if (isRed(u)) {             // case 1",
  "      p->red = u->red = false;",
  "      g->red = true;  z = g;",
  "    } else {",
  "      if (isInner(z)) {         // case 2",
  "        z = p;  rotate(z, out);",
  "      }",
  "      z->parent->red = false;   // case 3",
  "      g->red = true;",
  "      rotate(g, away from z);",
  "    }",
  "  }",
  "  root->red = false;",
  "}",
];

export const RB_DELETE_CODE = [
  "void remove(int key) {",
  "  Node* z = find(key);",
  "  if (z->left && z->right) {",
  "    Node* s = minNode(z->right);",
  "    z->key = s->key;  z = s;",
  "  }",
  "  Node* x = z->left ? z->left : z->right;",
  "  replace(z, x);",
  "  if (z->red) return;",
  "  if (isRed(x)) { x->red = false; return; }",
  "  while (x != root && isBlack(x)) {",
  "    Node* s = sibling(x);",
  "    if (s->red) {               // case 1",
  "      swap(s, p);  rotate(p, to x);",
  "    } else if (blackKids(s)) {  // case 2",
  "      s->red = true;  x = p;",
  "    } else {",
  "      if (isBlack(far(s))) {    // case 3",
  "        swap(near, s);  rotate(s, from x);",
  "      }",
  "      s->red = p->red;          // case 4",
  "      p->red = far->red = false;",
  "      rotate(p, to x);  x = root;",
  "    }",
  "  }",
  "  if (x) x->red = false;",
  "}",
];

/* ---------- insertion ---------- */

export function rbInsertSteps(source, key) {
  const tree = { root: rbClone(source) };
  let comparisons = 0;
  let rotations = 0;
  let recolors = 0;
  const { steps, save } = recorder(tree, () => ({ comparisons, rotations, recolors }));
  const path = [];

  save(1, `insert(${key}) — first insert it exactly like a BST, then repair the colours on the way back up`);

  let node = tree.root;
  let parent = null;
  while (node) {
    comparisons++;
    if (key === node.value) {
      save(2, `${key} already exists — nothing to insert`, trail(path, { [node.id]: "active" }));
      return { steps, result: tree.root };
    }
    path.push(node);
    parent = node;
    if (key < node.value) {
      save(2, `${key} < ${node.value} — go left`, trail(path, { [node.id]: "active" }));
      node = node.left;
    } else {
      save(2, `${key} > ${node.value} — go right`, trail(path, { [node.id]: "active" }));
      node = node.right;
    }
  }

  const z0 = newNode(key, parent);
  z0.red = true;
  if (!parent) tree.root = z0;
  else if (key < parent.value) parent.left = z0;
  else parent.right = z0;

  save(
    2,
    parent
      ? `New red node ${key} — new nodes are always red: a red node adds no black to any path, so the black counts stay equal. Only the "no red child under red" rule can break.`
      : `Empty tree — ${key} becomes the root`,
    trail(path, { [z0.id]: "new" })
  );

  let z = z0;
  while (z !== tree.root) {
    const p = z.parent;
    if (!p.red) {
      save(3, `Parent ${p.value} is black — a red node under a black one is fine, so there is nothing to fix`, { [z.id]: "new", [p.id]: "found" });
      break;
    }

    const g = p.parent;
    const pLeft = p === g.left;
    const u = pLeft ? g.right : g.left;
    const labels = pick({ [z.id]: "z", [p.id]: "parent", [g.id]: "grandparent", [u?.id]: "uncle" });

    save(3, `Red–red conflict — ${z.value} and its parent ${p.value} are both red, which the rules forbid. What happens next depends on the uncle.`, { [z.id]: "conflict", [p.id]: "conflict" }, "red–red", null, { labels });
    save(
      5,
      u ? `The uncle is ${u.value}, and it is ${colourName(u)} — the uncle is the grandparent ${g.value}'s other child` : `There is no uncle — ${g.value}'s other child is an empty NIL leaf, and NIL leaves count as black`,
      pick({ [z.id]: "conflict", [p.id]: "conflict", [g.id]: "path", [u?.id]: "pivot" }),
      isRed(u) ? "case 1" : "case 2 / 3",
      null,
      { labels }
    );

    if (isRed(u)) {
      p.red = false;
      u.red = false;
      g.red = true;
      recolors += 3;
      save(7, `Case 1, red uncle: recolour — ${p.value} and ${u.value} turn black, ${g.value} turns red. Every path through ${g.value} still meets exactly one black node on this level, so the black counts are unchanged.`, { [p.id]: "new", [u.id]: "new", [g.id]: "new" }, "Case 1 · recolour");
      z = g;
      save(8, `Move up to ${g.value} — it just turned red, so it may now clash with its own parent. Check again from there.`, { [g.id]: "active" }, "Case 1 · move up");
      continue;
    }

    let top = p;
    let low = z;
    const zLeft = z === p.left;
    if (pLeft !== zLeft) {
      save(
        10,
        `Case 2, triangle — ${z.value} is ${pLeft ? "the right child of a left child" : "the left child of a right child"}: ${g.value}, ${p.value}, ${z.value} make a bend. Rotate at ${p.value} to straighten it into a line.`,
        { [z.id]: "conflict", [p.id]: "conflict", [g.id]: "path" },
        "Case 2 · triangle",
        null,
        { labels }
      );
      rotations++;
      top = stagedRotate(tree, p, pLeft ? "left" : "right", save, 11, { [g.id]: "path" }, "Case 2 · rotation");
      low = p;
      save(11, `Now it's a straight line — ${g.value} → ${top.value} → ${low.value}, still red under red. Case 3 finishes the job.`, { [top.id]: "conflict", [low.id]: "conflict", [g.id]: "path" }, "Case 2 → 3");
    }

    save(
      13,
      `Case 3, line — ${g.value}, ${top.value}, ${low.value} sit in a straight line. Recolour ${top.value} black and ${g.value} red, then rotate at ${g.value} so ${top.value} becomes the top of this subtree.`,
      { [low.id]: "conflict", [top.id]: "conflict", [g.id]: "pivot" },
      "Case 3 · line",
      null,
      { labels: { [low.id]: "z", [top.id]: "parent", [g.id]: "grandparent" } }
    );
    top.red = false;
    g.red = true;
    recolors += 2;
    save(14, `Recolour — ${top.value} turns black and ${g.value} turns red. For a moment the black counts are uneven; the rotation puts them right.`, { [top.id]: "new", [g.id]: "new" }, "Case 3 · recolour");
    rotations++;
    stagedRotate(tree, g, pLeft ? "right" : "left", save, 15, {}, "Case 3 · rotation");
    save(15, `${top.value} is now a black node with two red children, ${low.value} and ${g.value} — no red–red pair is left and every path still has the same number of black nodes`, { [top.id]: "found", [low.id]: "new", [g.id]: "new" }, "Case 3 · fixed");
    break;
  }

  if (tree.root.red) {
    tree.root.red = false;
    recolors++;
    save(18, `The root is red — paint it black. That adds one black node to every path at once, so the paths stay equal.`, { [tree.root.id]: "new" }, "root → black");
  }

  save(19, `Insert complete — the root is black, no red node has a red child, and every path down passes ${blackHeight(tree.root)} black nodes (counting the NIL leaf)`, {});

  return { steps, result: tree.root };
}

/* ---------- deletion ---------- */

export function rbDeleteSteps(source, key) {
  const tree = { root: rbClone(source) };
  let comparisons = 0;
  let rotations = 0;
  let recolors = 0;
  const { steps, save } = recorder(tree, () => ({ comparisons, rotations, recolors }));
  const path = [];

  save(1, `remove(${key}) — remove it like a BST, then, if a black node was lost, repair the black counts`);

  let node = tree.root;
  while (node && node.value !== key) {
    comparisons++;
    path.push(node);
    if (key < node.value) {
      save(2, `${key} < ${node.value} — go left`, trail(path, { [node.id]: "active" }));
      node = node.left;
    } else {
      save(2, `${key} > ${node.value} — go right`, trail(path, { [node.id]: "active" }));
      node = node.right;
    }
  }

  if (!node) {
    save(2, `Hit NIL — ${key} is not in the tree`, trail(path), "not found");
    return { steps, result: tree.root };
  }

  comparisons++;
  save(2, `Found ${key}`, trail(path, { [node.id]: "found" }));

  let z = node;
  if (z.left && z.right) {
    save(3, `${key} has two children — swap in its in-order successor, the smallest key in its right subtree, and remove that node instead`, { [z.id]: "found" });
    let s = z.right;
    const succPath = [];
    while (true) {
      comparisons++;
      save(4, s.left ? `minNode: ${s.value} has a left child — keep going left` : `minNode: ${s.value} is the smallest in the right subtree`, { [z.id]: "found", ...trail(succPath), [s.id]: s.left ? "active" : "successor" });
      if (!s.left) break;
      succPath.push(s);
      s = s.left;
    }
    const old = z.value;
    z.value = s.value;
    save(5, `${old} is overwritten with ${s.value} — colours stay where they are. Now remove the old ${s.value} node, which has at most one child.`, { [z.id]: "new", [s.id]: "remove" }, null, null, { labels: { [s.id]: "remove this" } });
    z = s;
  }

  const x0 = z.left || z.right;
  const p0 = z.parent;
  const zDepth = depthOf(z);
  const wasRed = z.red;
  save(
    7,
    x0 ? `${z.value} has one child, ${x0.value} — ${x0.value} will take its place` : `${z.value} has no children — it can simply be unlinked, leaving a NIL leaf in its place`,
    pick({ [z.id]: "remove", [x0?.id]: "rotate" }),
    `removing a ${colourName(z)} node`
  );

  let xLeft = p0 ? p0.left === z : false;
  replaceChild(tree, p0, z, x0);
  z.left = z.right = null;
  save(8, `Unlink ${z.value}${x0 ? ` — ${x0.value} moves up into its place` : ""}`, pick({ [z.id]: "remove", [x0?.id]: "rotate" }), null, null, { floating: [{ node: z, depth: zDepth }], labels: { [z.id]: `removed (${colourName(z)})` } });

  const finish = (line, text) => {
    save(line, text, {});
    if (tree.root) save(27, `Delete complete — the root is black, no red node has a red child, and every path down passes ${blackHeight(tree.root)} black nodes (counting the NIL leaf)`, {});
    else save(27, "Delete complete — the tree is empty", {});
    return { steps, result: tree.root };
  };

  if (wasRed) return finish(9, `${z.value} was red — removing a red node takes no black off any path, so every rule still holds. Nothing to fix.`);

  if (isRed(x0)) {
    x0.red = false;
    recolors++;
    save(10, `${z.value} was black, but its replacement ${x0.value} is red — paint ${x0.value} black. It makes up for the black that was lost.`, { [x0.id]: "new" }, "child → black");
    return finish(10, `The black counts are equal again`);
  }

  if (!tree.root) return finish(9, "The tree is now empty");

  let x = x0;
  let p = p0;
  const dbLabel = () => (x ? { [x.id]: "double black" } : { [p.id]: `${xLeft ? "left" : "right"} NIL: double black` });
  const dbMark = () => (x ? { [x.id]: "conflict" } : {});

  save(
    11,
    `Double black — ${z.value} was black and ${x ? `${x.value} is black too` : "its place is now an empty NIL"}, so every path through here is one black node short. Think of the spot as carrying an extra "debt" of one black; the cases below pay it off.`,
    { ...dbMark(), [p.id]: "path" },
    "double black",
    null,
    { labels: dbLabel() }
  );

  while (x !== tree.root && !isRed(x)) {
    let s = xLeft ? p.right : p.left;
    save(12, `Look at the sibling — ${s.value}, ${colourName(s)}${isRed(s) ? "" : `, with ${isRed(s.left) || isRed(s.right) ? "a red child" : "two black children"}`}`, { ...dbMark(), [p.id]: "path", [s.id]: "pivot" }, null, null, { labels: { ...dbLabel(), [s.id]: "sibling" } });

    if (isRed(s)) {
      s.red = false;
      p.red = true;
      recolors += 2;
      save(14, `Case 1, red sibling — swap the colours of ${s.value} and its parent ${p.value}: ${s.value} turns black, ${p.value} red. Then rotate at ${p.value} toward the double black.`, { ...dbMark(), [p.id]: "new", [s.id]: "new" }, "Case 1 · recolour", null, { labels: dbLabel() });
      rotations++;
      stagedRotate(tree, p, xLeft ? "left" : "right", save, 14, {}, "Case 1 · rotation");
      s = xLeft ? p.right : p.left;
      save(14, `The double black now has a black sibling, ${s.value} — nothing is fixed yet, but one of cases 2–4 now applies`, { ...dbMark(), [p.id]: "path", [s.id]: "pivot" }, "Case 1 → 2, 3, 4", null, { labels: { ...dbLabel(), [s.id]: "new sibling" } });
      continue;
    }

    const near = xLeft ? s.left : s.right;
    const far = xLeft ? s.right : s.left;

    if (!isRed(s.left) && !isRed(s.right)) {
      s.red = true;
      recolors++;
      save(16, `Case 2, black sibling with black children — paint ${s.value} red. That takes one black off the sibling's side too, so both sides of ${p.value} are short by the same amount: the debt moves up to ${p.value}.`, { [s.id]: "new", [p.id]: "conflict" }, "Case 2 · push up", null, { labels: { [p.id]: isRed(p) ? "red: absorbs it" : "double black" } });
      x = p;
      p = x.parent;
      if (p) xLeft = p.left === x;
      if (isRed(x)) {
        x.red = false;
        recolors++;
        save(26, `${x.value} is red — paint it black, and that one black pays off the debt. Done.`, { [x.id]: "new" }, "absorb");
        return finish(26, `The black counts are equal again`);
      }
      if (x === tree.root) return finish(11, `The double black reached the root — every path lost one black node equally, so the counts are equal again`);
      continue;
    }

    let farChild = far;
    if (!isRed(far)) {
      near.red = false;
      s.red = true;
      recolors += 2;
      save(19, `Case 3, the sibling's near child ${near.value} is red and its far child is black — swap the colours of ${near.value} and ${s.value}, then rotate at ${s.value} away from the double black, so the red ends up on the far side`, { ...dbMark(), [near.id]: "new", [s.id]: "new" }, "Case 3 · recolour", null, { labels: { ...dbLabel(), [near.id]: "near child" } });
      rotations++;
      stagedRotate(tree, s, xLeft ? "right" : "left", save, 19, {}, "Case 3 · rotation");
      s = xLeft ? p.right : p.left;
      farChild = xLeft ? s.right : s.left;
      save(19, `Now the sibling is ${s.value} and its far child ${farChild.value} is red — case 4`, { ...dbMark(), [s.id]: "pivot", [farChild.id]: "new" }, "Case 3 → 4", null, { labels: { ...dbLabel(), [s.id]: "sibling", [farChild.id]: "far child" } });
    }

    s.red = p.red;
    p.red = false;
    farChild.red = false;
    recolors += 3;
    save(22, `Case 4, red far child — ${s.value} takes ${p.value}'s colour (${colourName(s)}), and ${p.value} and ${farChild.value} turn black. Then rotate at ${p.value} toward the double black.`, { ...dbMark(), [s.id]: "new", [p.id]: "new", [farChild.id]: "new" }, "Case 4 · recolour", null, { labels: { ...dbLabel(), [farChild.id]: "far child" } });
    rotations++;
    stagedRotate(tree, p, xLeft ? "left" : "right", save, 23, {}, "Case 4 · rotation");
    save(23, `The rotation puts the black ${p.value} above the double black spot — that is the extra black it was missing. The other side keeps its count through the newly black ${farChild.value}. Fixed.`, { [p.id]: "found", [farChild.id]: "found" }, "Case 4 · fixed");
    x = tree.root;
    break;
  }

  if (tree.root.red) {
    tree.root.red = false;
    recolors++;
    save(26, `The root is red — paint it black`, { [tree.root.id]: "new" });
  }

  return finish(27, `Every path has the same number of black nodes again`);
}

export const randomExistingKey = (root) => {
  const values = collectValues(root);
  return values[Math.floor(Math.random() * values.length)];
};
