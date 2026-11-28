// Step generators for the six singly linked list operations, one line of
// code per step. Pure, so playback can chain operations and step back.
//
// A list is [{ id, value }] in linked order. Each step is a snapshot:
//   nodes [{ id, value, slot, lift, tone, label }]  where each cube sits;
//                                                   label names the variable
//                                                   holding it (node, old…)
//   ptrs  [{ from, to, tone, label, dashed }]       next pointers (to may be null)
//   pins  [{ at, text, tone }]                      head / cur under a node
// Nothing moves in memory in a real list; the drawing opens a gap before a
// splice and closes it afterwards only so every arrow has room to be seen.

export const CODES = {
  "insert-head": [
    "void insertAtHead(Node*& head, int x) {",
    "  Node* node = new Node(x);",
    "  node->next = head;",
    "  head = node;",
    "}",
  ],
  "insert-tail": [
    "void insertAtTail(Node*& head, int x) {",
    "  Node* node = new Node(x);",
    "  if (!head) { head = node; return; }",
    "  Node* cur = head;",
    "  while (cur->next) cur = cur->next;",
    "  cur->next = node;",
    "}",
  ],
  "insert-pos": [
    "void insertAt(Node*& head, int pos, int x) {",
    "  Node* node = new Node(x);",
    "  if (pos == 0) { node->next = head; head = node; return; }",
    "  Node* cur = head;",
    "  for (int i = 0; i < pos - 1; i++) cur = cur->next;",
    "  node->next = cur->next;",
    "  cur->next = node;",
    "}",
  ],
  "delete-head": [
    "void deleteHead(Node*& head) {",
    "  if (!head) return;",
    "  Node* old = head;",
    "  head = head->next;",
    "  delete old;",
    "}",
  ],
  "delete-tail": [
    "void deleteTail(Node*& head) {",
    "  if (!head) return;",
    "  if (!head->next) { delete head; head = nullptr; return; }",
    "  Node* cur = head;",
    "  while (cur->next->next) cur = cur->next;",
    "  delete cur->next;",
    "  cur->next = nullptr;",
    "}",
  ],
  "delete-pos": [
    "void deleteAt(Node*& head, int pos) {",
    "  if (pos == 0) { Node* old = head; head = head->next; delete old; return; }",
    "  Node* cur = head;",
    "  for (int i = 0; i < pos - 1; i++) cur = cur->next;",
    "  Node* gone = cur->next;",
    "  cur->next = gone->next;",
    "  delete gone;",
    "}",
  ],
};

// How high a node waits above the list (world units), and how many slots
// the list opens for a splice, so every arrow around it has clear space.
const FLOAT = 2.3;
const GAP = 2;

// The drawing state an operation works on, and a recorder for its steps.
function scene(list) {
  const nodes = new Map(list.map((c, i) => [c.id, { id: c.id, value: c.value, slot: i, lift: 0, ghost: false }]));
  const next = new Map(list.map((c, i) => [c.id, list[i + 1]?.id ?? null]));
  const s = { nodes, next, head: list[0]?.id ?? null, steps: [] };

  // tone: { id: tone }  label: { id: text }  style: { fromId: { tone, label, dashed } }
  s.save = ({ tone = {}, label = {}, style = {}, cur = null, ...info }) => {
    const nodeList = [...nodes.values()].map((n) => ({
      id: n.id,
      value: n.value,
      slot: n.slot,
      lift: n.lift,
      tone: n.ghost ? "ghost" : tone[n.id] ?? "idle",
      label: label[n.id] ?? null,
    }));
    const ptrs = [...next.entries()].filter(([from]) => nodes.has(from)).map(([from, to]) => ({ from, to, ...(style[from] ?? {}) }));
    const pins = [];
    if (s.head !== null && nodes.has(s.head)) pins.push({ at: s.head, text: "head", tone: "coral" });
    if (cur !== null) pins.push({ at: cur, text: "cur", tone: "ink" });
    s.steps.push({ nodes: nodeList, ptrs, pins, ...info });
  };

  s.order = () => {
    const out = [];
    const seen = new Set();
    for (let id = s.head; id !== null && !seen.has(id); id = next.get(id) ?? null) {
      seen.add(id);
      out.push(nodes.get(id));
    }
    return out;
  };

  // Lay the linked order out on slots 0, 1, 2… (the "redraw" at the end).
  s.settle = () => {
    s.order().forEach((n, i) => {
      n.slot = i;
      n.lift = 0;
    });
  };

  s.remove = (id) => {
    nodes.delete(id);
    next.delete(id);
  };

  s.result = () => s.order().map(({ id, value }) => ({ id, value }));
  return s;
}

const valueOf = (s, id) => s.nodes.get(id)?.value;
const reads = (s) => s.order().map((n) => n.value).join(" → ") + " → null";
const REDRAW = "Nothing moved in memory: only pointers changed. Drawn in order again, the list reads";

/* ---------- insertion ---------- */

function insertHead(s, key, code = "insert-head") {
  const { id, value } = key;
  const oldHead = s.head;
  const lines = code === "insert-pos" ? { create: 2, link: 3, move: 3, end: 8 } : { create: 2, link: 3, move: 4, end: 5 };

  s.save({ line: 1, phase: "idea", title: `Put ${value} at the front`, body: "A linked list only knows where its first node is. A new first node never touches the rest of the list.", notice: "No shifting at all, unlike an array: O(1)." });
  s.nodes.set(id, { id, value, slot: -1.2, lift: FLOAT, ghost: false });
  s.next.set(id, null);
  s.save({ line: lines.create, phase: "create", label: { [id]: "node" }, tone: { [id]: "coral" }, title: `node = new Node(${value})`, body: "A brand-new node appears beside the list. The variable node points at it, and its next is still null." });
  s.next.set(id, oldHead);
  s.save({ line: lines.link, phase: "link", label: { [id]: "node" }, tone: { [id]: "coral" }, style: { [id]: { tone: "coral", label: "node->next" } }, title: "node->next = head", body: oldHead === null ? "The list is empty, so the new node's next stays null." : `The new node's arrow reaches down to ${valueOf(s, oldHead)}, the current first node. The list itself hasn't changed yet.` });
  s.head = id;
  s.save({ line: lines.move, phase: "move", label: { [id]: "node" }, tone: { [id]: "coral" }, title: "head = node", body: `Watch the head marker move over to ${value}. The list now starts at the new node.` });
  s.settle();
  s.save({ line: lines.end, phase: "done", tone: { [id]: "sage" }, title: "Redraw in order", body: `${REDRAW} ${reads(s)}.` });
}

function insertTail(s, key) {
  const { id, value } = key;
  const list = s.order();
  const n = list.length;
  s.save({ line: 1, phase: "idea", title: `Put ${value} at the end`, body: "The list only knows its head, so reaching the last node means walking the whole chain.", notice: "Walking n nodes makes this O(n). Keeping a tail pointer would make it O(1)." });
  s.nodes.set(id, { id, value, slot: n + 0.2, lift: FLOAT, ghost: false });
  s.next.set(id, null);
  s.save({ line: 2, phase: "create", label: { [id]: "node" }, tone: { [id]: "coral" }, title: `node = new Node(${value})`, body: "A brand-new node appears past the end. Its next is null, which is right for a last node." });

  if (!n) {
    s.head = id;
    s.save({ line: 3, phase: "move", label: { [id]: "node" }, tone: { [id]: "coral" }, title: "head = node", body: "The list was empty, so the new node simply becomes the head." });
    s.settle();
    s.save({ line: 7, phase: "done", tone: { [id]: "sage" }, title: "Redraw in order", body: `${REDRAW} ${reads(s)}.` });
    return;
  }

  list.forEach((c, i) => {
    const last = i === n - 1;
    s.save({ line: i === 0 ? 4 : 5, phase: "walk", cur: c.id, label: { [id]: "node" }, tone: { [id]: "coral", [c.id]: "soft" }, title: last ? `${c.value} has no next: it's the last` : `cur at ${c.value}, keep going`, body: last ? "cur->next is null. Stop here." : "cur->next is not null, so cur = cur->next." });
  });
  const last = list[n - 1].id;
  s.next.set(last, id);
  s.save({ line: 6, phase: "link", cur: last, label: { [id]: "node" }, tone: { [id]: "coral", [last]: "soft" }, style: { [last]: { tone: "coral", label: "cur->next" } }, title: "cur->next = node", body: `${valueOf(s, last)}'s next was null. Now an arrow reaches out from it to the new node.` });
  s.settle();
  s.save({ line: 7, phase: "done", tone: { [id]: "sage" }, title: "Redraw in order", body: `${REDRAW} ${reads(s)}.` });
}

function insertAt(s, key) {
  const { id, value } = key;
  const list = s.order();
  const n = list.length;
  const p = Math.max(0, Math.min(key.pos ?? 0, n));
  if (p === 0) return insertHead(s, key, "insert-pos");

  s.save({ line: 1, phase: "idea", title: `Insert ${value} at position ${p}`, body: `Walk to the node just before position ${p}, then splice the new node in by changing two pointers, in the right order.`, notice: "The splice itself is O(1). Finding the spot is what costs O(n)." });
  s.nodes.set(id, { id, value, slot: p - 0.5, lift: FLOAT, ghost: false });
  s.next.set(id, null);
  s.save({ line: 2, phase: "create", label: { [id]: "node" }, tone: { [id]: "coral" }, title: `node = new Node(${value})`, body: "A brand-new node appears above the list, linked to nothing yet. The variable node points at it." });

  const before = list[p - 1];
  const after = list[p];
  for (let i = 0; i < p; i++) {
    const stop = i === p - 1;
    if (stop) {
      // Open a gap after cur so the splice has room to be seen.
      list.slice(p).forEach((c) => (s.nodes.get(c.id).slot += GAP));
      s.nodes.get(id).slot = p - 0.5 + GAP / 2;
    }
    s.save({ line: i === 0 ? 4 : 5, phase: "walk", cur: list[i].id, label: { [id]: "node" }, tone: { [id]: "coral", [list[i].id]: "soft" }, title: stop ? `Stop at ${list[i].value}` : `cur at ${list[i].value}`, body: stop ? `This is node ${p - 1}, the one before position ${p}. (The nodes after it are drawn further right to make room; nothing moves in memory.)` : "Not there yet: cur = cur->next." });
  }

  s.next.set(id, after?.id ?? null);
  s.save({ line: 6, phase: "link", cur: before.id, label: { [id]: "node" }, tone: { [id]: "coral", [before.id]: "soft" }, style: { [id]: { tone: "coral", label: "node->next" } }, title: "node->next = cur->next", body: after ? `First, the new node's arrow reaches ${after.value}, the node after cur. Doing this first means nothing gets lost.` : "cur->next is null, so the new node's next stays null: it will be the last node." });
  s.next.set(before.id, id);
  s.save({ line: 7, phase: "point", cur: before.id, label: { [id]: "node" }, tone: { [id]: "coral", [before.id]: "soft" }, style: { [before.id]: { tone: "coral", label: "cur->next" } }, title: "cur->next = node", body: `Now watch ${before.value}'s arrow swing off ${after ? after.value : "null"} and onto the new node. ${value} is linked in.`, notice: "Swap these two lines and the rest of the list is lost: cur->next would be overwritten before node could copy it." });
  s.settle();
  s.save({ line: 8, phase: "done", tone: { [id]: "sage" }, title: "Redraw in order", body: `${REDRAW} ${reads(s)}. ${value} is at position ${p}.` });
}

/* ---------- deletion ---------- */

function deleteHead(s, code = "delete-head") {
  const list = s.order();
  const old = list[0];
  const lines = code === "delete-pos" ? { mark: 2, move: 2, free: 2, end: 8 } : { mark: 3, move: 4, free: 5, end: 6 };
  s.save({ line: 1, phase: "idea", title: "Remove the first node", body: "Move head one node along, then free the old first node.", notice: "Just one pointer change: O(1)." });
  s.save({ line: lines.mark, phase: "mark", label: { [old.id]: "old" }, tone: { [old.id]: "coral" }, title: "old = head", body: `A temporary pointer, old, holds on to ${old.value} so it can be freed after head moves.` });
  s.head = s.next.get(old.id);
  s.save({ line: lines.move, phase: "move", label: { [old.id]: "old" }, tone: { [old.id]: "coral" }, title: "head = head->next", body: s.head === null ? "There is no next node, so head becomes null: the list is empty." : `Watch the head marker step over to ${valueOf(s, s.head)}. Only old still knows where ${old.value} is.` });
  const gone = s.nodes.get(old.id);
  gone.lift = FLOAT;
  gone.ghost = true;
  s.next.set(old.id, null);
  s.save({ line: lines.free, phase: "free", label: { [old.id]: "deleted" }, title: "delete old", body: `${old.value} lifts out and its memory is given back.` });
  s.remove(old.id);
  s.settle();
  s.save({ line: lines.end, phase: "done", title: "Redraw in order", body: s.head === null ? "The list is empty." : `${list.length - 1} nodes left: ${reads(s)}.` });
}

function deleteTail(s) {
  const list = s.order();
  const n = list.length;
  s.save({ line: 1, phase: "idea", title: "Remove the last node", body: "You need the second-to-last node, because its next pointer has to become null. Walking there costs O(n).", notice: "A singly linked list can't step backwards, so there's no shortcut from the end." });
  if (n === 1) {
    const only = s.nodes.get(list[0].id);
    only.lift = FLOAT;
    only.ghost = true;
    s.head = null;
    s.save({ line: 3, phase: "free", label: { [only.id]: "deleted" }, title: "delete head; head = nullptr", body: `${only.value} was the only node. Freeing it leaves an empty list.` });
    s.remove(only.id);
    s.save({ line: 8, phase: "done", title: "Empty list", body: "head is null." });
    return;
  }
  for (let i = 0; i < n - 1; i++) {
    const stop = i === n - 2;
    s.save({ line: i === 0 ? 4 : 5, phase: "walk", cur: list[i].id, tone: { [list[i].id]: "soft" }, title: stop ? `Stop at ${list[i].value}` : `cur at ${list[i].value}`, body: stop ? "cur->next->next is null, so cur->next is the last node." : "cur->next->next is not null yet: cur = cur->next." });
  }
  const prev = list[n - 2];
  const last = s.nodes.get(list[n - 1].id);
  last.lift = FLOAT;
  last.ghost = true;
  s.save({ line: 6, phase: "free", cur: prev.id, label: { [last.id]: "deleted" }, tone: { [prev.id]: "soft" }, style: { [prev.id]: { tone: "coral", dashed: true, label: "dangling!" } }, title: "delete cur->next", body: `${last.value} is freed, but ${prev.value}'s next still points at where it was: a dangling pointer.` });
  s.next.set(prev.id, null);
  s.remove(last.id);
  s.save({ line: 7, phase: "point", cur: prev.id, tone: { [prev.id]: "soft" }, title: "cur->next = nullptr", body: `${prev.value}'s arrow is pulled back. It is the new last node.` });
  s.save({ line: 8, phase: "done", title: "Done", body: `${n - 1} nodes left: ${reads(s)}.` });
}

function deleteAt(s, key) {
  const list = s.order();
  const n = list.length;
  const p = Math.max(0, Math.min(key.pos ?? 0, n - 1));
  if (p === 0) return deleteHead(s, "delete-pos");

  s.save({ line: 1, phase: "idea", title: `Remove position ${p}`, body: "Walk to the node before it, then make that node skip over the one being removed.", notice: "Once you're there, unlinking is O(1). Getting there is O(n)." });
  for (let i = 0; i < p; i++) {
    const stop = i === p - 1;
    s.save({ line: i === 0 ? 3 : 4, phase: "walk", cur: list[i].id, tone: { [list[i].id]: "soft" }, title: stop ? `Stop at ${list[i].value}` : `cur at ${list[i].value}`, body: stop ? `Its next is the node at position ${p}.` : "Step forward: cur = cur->next." });
  }
  const prev = list[p - 1];
  const gone = s.nodes.get(list[p].id);
  const after = list[p + 1];
  // Lift it, and spread its neighbours, so the bypass arrow has room underneath.
  gone.lift = FLOAT;
  list.slice(p + 1).forEach((c) => (s.nodes.get(c.id).slot += 1));
  gone.slot += 0.5;
  s.save({ line: 5, phase: "mark", cur: prev.id, label: { [gone.id]: "gone" }, tone: { [prev.id]: "soft", [gone.id]: "coral" }, title: "gone = cur->next", body: `A temporary pointer, gone, holds on to ${gone.value}. It is lifted here only so the arrows around it are easy to see.` });
  s.next.set(prev.id, after?.id ?? null);
  s.save({ line: 6, phase: "bypass", cur: prev.id, label: { [gone.id]: "gone" }, tone: { [prev.id]: "soft", [gone.id]: "coral" }, style: { [prev.id]: { tone: "coral", label: "cur->next" }, [gone.id]: { tone: "ghost", dashed: true } }, title: "cur->next = gone->next", body: `Watch ${prev.value}'s arrow swing past ${gone.value} straight to ${after ? after.value : "null"}. The list no longer includes ${gone.value}.` });
  gone.ghost = true;
  gone.lift = FLOAT + 0.5;
  s.next.set(gone.id, null);
  s.save({ line: 7, phase: "free", cur: prev.id, label: { [gone.id]: "deleted" }, tone: { [prev.id]: "soft" }, title: "delete gone", body: `${gone.value}'s memory is given back.` });
  s.remove(gone.id);
  s.settle();
  s.save({ line: 8, phase: "done", title: "Redraw in order", body: `${REDRAW} ${reads(s)}.` });
}

const RUN = { "insert-head": insertHead, "insert-tail": insertTail, "insert-pos": insertAt, "delete-head": (s) => deleteHead(s), "delete-tail": deleteTail, "delete-pos": deleteAt };

// One operation on a list: its steps and the list it leaves behind.
export function runOp(kind, list, key) {
  const s = scene(list);
  if (!list.length && kind.startsWith("delete")) {
    s.save({ line: 2, phase: "done", title: "The list is empty", body: "There is nothing to remove." });
    return { steps: s.steps, result: list };
  }
  RUN[kind](s, key);
  return { steps: s.steps, result: s.result() };
}

/* ---------- sessions ---------- */

let seq = 0;
const freshId = () => `n${++seq}`;
const rand = (taken = []) => {
  for (;;) {
    const v = Math.floor(Math.random() * 90) + 10;
    if (!taken.includes(v)) return v;
  }
};

export const randomList = (length) => {
  const values = [];
  while (values.length < length) values.push(rand(values));
  return values.map((value) => ({ id: freshId(), value }));
};

export const MAX_NODES = 7;

// The next operation in a chained session.
export function nextKeyFor(kind, list) {
  const n = list.length;
  if (kind.startsWith("insert")) {
    // Middle positions show the full splice; the ends have their own lessons.
    const pos = kind === "insert-pos" ? (n >= 2 ? 1 + Math.floor(Math.random() * (n - 1)) : n) : 0;
    return { id: freshId(), value: rand(list.map((c) => c.value)), pos };
  }
  return { pos: kind === "delete-pos" && n >= 3 ? 1 + Math.floor(Math.random() * (n - 2)) : n - 1 };
}

export const keyFor = (kind, list, value, pos) => (kind.startsWith("insert") ? { id: freshId(), value, pos } : { pos });

export const sessionDone = (kind, list) => (kind.startsWith("insert") ? list.length >= MAX_NODES : list.length <= 1);

export const startList = (kind) => randomList(kind.startsWith("insert") ? 3 : 6);
