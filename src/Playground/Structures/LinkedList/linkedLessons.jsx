import { useMemo, useState } from "react";
import Lesson from "../../../lesson/Lesson";
import IsoArray from "../../../iso/IsoArray";
import { usePlayback } from "../../shared/usePlayback";

// Six singly linked list operations. Each node is a cube on the floor; its
// next pointer is an arrow to the following cube. A new node floats above the
// list until it is linked in, and a removed node lifts away before it goes.

const STEP = 2.6;
const rand = () => Math.floor(Math.random() * 90) + 10;
const randomList = () => Array.from({ length: 4 }, (_, i) => ({ id: i, value: rand() }));

const CODES = {
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

// Builds snapshots. `list` is the linked order; extra nodes (new or leaving)
// are drawn separately with their own position and arrow.
function recorder() {
  const steps = [];
  const save = ({ list, extra = [], arrows, pointers = [], hot = {}, ...rest }) => {
    const nodes = list.map((c, k) => ({ id: c.id, value: c.value, pos: k, tone: hot[c.id] ?? "idle" }));
    extra.forEach((e) => nodes.push({ id: e.id, value: e.value, pos: e.pos, lift: e.lift ?? 0, tone: e.tone ?? "coral" }));
    const chain = arrows ?? list.map((c, k) => ({ from: c.id, to: list[k + 1]?.id ?? null }));
    steps.push({ nodes, arrows: chain, pointers, ...rest });
  };
  return { steps, save };
}

const chainOf = (list, overrides = {}) => list.map((c, k) => ({ from: c.id, to: k + 1 < list.length ? list[k + 1].id : null, ...(overrides[c.id] ?? {}) }));

function build(kind, base, value, pos) {
  const { steps, save } = recorder();
  let list = base.map((c) => ({ ...c }));
  const node = { id: "new", value };
  const n = list.length;
  const headPin = (at = 0) => ({ index: at, text: "head", tone: "coral" });

  if (kind === "insert-head") {
    save({ list, pointers: [headPin()], line: 1, phase: "idea", title: `Put ${value} at the front`, body: "A linked list only knows where its first node is. Adding a new first node never touches the rest of the list.", notice: "No shifting at all, unlike an array: O(1)." });
    save({ list, extra: [{ ...node, pos: -0.6, lift: 1.6 }], pointers: [headPin()], line: 2, phase: "create", title: `Make a node holding ${value}`, body: "The new node exists on its own. Its next pointer is empty for now." });
    save({ list, extra: [{ ...node, pos: -0.6, lift: 1.6 }], arrows: [...chainOf(list), { from: "new", to: list[0]?.id ?? null, tone: "coral" }], pointers: [headPin()], line: 3, phase: "link", title: "Point it at the old head", body: `The new node's next now points at ${list[0]?.value ?? "nothing"}.` });
    list = [node, ...list];
    save({ list, hot: { new: "coral" }, arrows: chainOf(list, { new: { tone: "coral" } }), pointers: [headPin()], line: 4, phase: "done", title: `head = the new node`, body: `The list now starts at ${value} and has ${list.length} nodes.` });
  }

  if (kind === "insert-tail") {
    save({ list, pointers: [headPin()], line: 1, phase: "idea", title: `Put ${value} at the end`, body: "The list only knows its head, so to reach the last node you have to walk the whole chain.", notice: "Walking n nodes makes this O(n). Keeping a tail pointer would make it O(1)." });
    save({ list, extra: [{ ...node, pos: n, lift: 1.6 }], pointers: [headPin()], line: 2, phase: "create", title: `Make a node holding ${value}`, body: "Its next pointer is null: it will be the new last node." });
    for (let i = 0; i < n; i++) {
      save({ list, extra: [{ ...node, pos: n, lift: 1.6 }], hot: { [list[i].id]: "soft" }, pointers: [headPin(), { index: i, text: "cur" }], line: i === 0 ? 4 : 5, phase: "walk", title: i === n - 1 ? `${list[i].value} has no next: it's the last` : `cur at ${list[i].value}, keep going`, body: i === n - 1 ? "Stop here." : "cur->next is not null, so step forward." });
    }
    list = [...list, node];
    save({ list, hot: { new: "coral" }, arrows: chainOf(list, { [list[n - 1].id]: { tone: "coral" } }), pointers: [headPin(), { index: n - 1, text: "cur" }], line: 6, phase: "done", title: `Link ${list[n - 1].value} → ${value}`, body: `The old last node now points at the new one. ${list.length} nodes.` });
  }

  if (kind === "insert-pos") {
    const p = Math.max(0, Math.min(pos, n));
    save({ list, pointers: [headPin()], line: 1, phase: "idea", title: `Insert ${value} at position ${p}`, body: `Walk to the node just before position ${p}, then splice the new node in by changing two pointers.`, notice: "The splice itself is O(1). Finding the spot is what costs O(n)." });
    save({ list, extra: [{ ...node, pos: p - 0.5, lift: 1.7 }], pointers: [headPin()], line: 2, phase: "create", title: `Make a node holding ${value}`, body: "It floats above the list until it is linked in." });
    if (p === 0) return build("insert-head", base, value, 0);
    for (let i = 0; i < p; i++) {
      save({ list, extra: [{ ...node, pos: p - 0.5, lift: 1.7 }], hot: { [list[i].id]: "soft" }, pointers: [headPin(), { index: i, text: "cur" }], line: i === 0 ? 4 : 5, phase: "walk", title: i === p - 1 ? `Stop at ${list[i].value}` : `cur at ${list[i].value}`, body: i === p - 1 ? `This is node ${p - 1}, the one before position ${p}.` : "Not there yet, step forward." });
    }
    const before = list[p - 1];
    const after = list[p];
    save({ list, extra: [{ ...node, pos: p - 0.5, lift: 1.7 }], hot: { [before.id]: "soft" }, arrows: [...chainOf(list), { from: "new", to: after?.id ?? null, tone: "coral" }], pointers: [headPin(), { index: p - 1, text: "cur" }], line: 6, phase: "link", title: `New node → ${after ? after.value : "null"}`, body: "First point the new node at cur's next, so nothing gets lost." });
    list = [...list.slice(0, p), node, ...list.slice(p)];
    save({ list, hot: { new: "coral" }, arrows: chainOf(list, { [before.id]: { tone: "coral" }, new: { tone: "coral" } }), pointers: [headPin(), { index: p - 1, text: "cur" }], line: 7, phase: "done", title: `${before.value} → ${value}`, body: `Then point cur at the new node. ${value} is now at position ${p}.` });
  }

  if (kind === "delete-head") {
    const old = list[0];
    save({ list, pointers: [headPin()], line: 1, phase: "idea", title: "Remove the first node", body: "Move head one node along, then free the old first node.", notice: "Just one pointer change: O(1)." });
    save({ list, hot: { [old.id]: "coral" }, pointers: [headPin(), { index: 0, text: "old" }], line: 3, phase: "mark", title: `Remember ${old.value}`, body: "Keep a pointer to it so it can be freed after head moves." });
    save({ list, hot: { [old.id]: "coral" }, arrows: chainOf(list, { [old.id]: { tone: "ghost", dashed: true } }), pointers: [headPin(1), { index: 0, text: "old" }], line: 4, phase: "move", title: `head = ${list[1]?.value ?? "null"}`, body: "The list now starts at the second node." });
    const rest = list.slice(1);
    save({ list: rest, extra: [{ ...old, pos: -1, lift: 1.4, tone: "ghost" }], arrows: chainOf(rest), pointers: [headPin()], line: 5, phase: "done", title: `Free ${old.value}`, body: `${rest.length} nodes left.` });
  }

  if (kind === "delete-tail") {
    save({ list, pointers: [headPin()], line: 1, phase: "idea", title: "Remove the last node", body: "You need the second-to-last node, because its next pointer has to become null. Walking there costs O(n).", notice: "A singly linked list can't step backwards, so there's no shortcut from the end." });
    for (let i = 0; i < n - 1; i++) {
      save({ list, hot: { [list[i].id]: "soft" }, pointers: [headPin(), { index: i, text: "cur" }], line: i === 0 ? 4 : 5, phase: "walk", title: i === n - 2 ? `Stop at ${list[i].value}` : `cur at ${list[i].value}`, body: i === n - 2 ? "Two nodes ahead is null, so the next node is the last one." : "cur->next->next is not null yet, step forward." });
    }
    const last = list[n - 1];
    const prev = list[n - 2];
    const rest = list.slice(0, -1);
    save({ list: rest, extra: [{ ...last, pos: n - 1, lift: 1.4, tone: "ghost" }], hot: { [prev.id]: "soft" }, arrows: chainOf(rest, { [prev.id]: { tone: "coral" } }), pointers: [headPin(), { index: n - 2, text: "cur" }], line: 7, phase: "done", title: `${prev.value} → null`, body: `${last.value} is freed and ${prev.value} is the new last node.` });
  }

  if (kind === "delete-pos") {
    const p = Math.max(0, Math.min(pos, n - 1));
    if (p === 0) return build("delete-head", base);
    save({ list, pointers: [headPin()], line: 1, phase: "idea", title: `Remove position ${p}`, body: "Walk to the node before it, then make that node skip over the one being removed.", notice: "Once you're there, unlinking is O(1). Getting there is O(n)." });
    for (let i = 0; i < p; i++) {
      save({ list, hot: { [list[i].id]: "soft" }, pointers: [headPin(), { index: i, text: "cur" }], line: i === 0 ? 3 : 4, phase: "walk", title: i === p - 1 ? `Stop at ${list[i].value}` : `cur at ${list[i].value}`, body: i === p - 1 ? `Its next is the node at position ${p}.` : "Step forward." });
    }
    const prev = list[p - 1];
    const gone = list[p];
    const after = list[p + 1];
    save({ list, hot: { [prev.id]: "soft", [gone.id]: "coral" }, pointers: [headPin(), { index: p - 1, text: "cur" }, { index: p, text: "gone" }], line: 5, phase: "mark", title: `Mark ${gone.value}`, body: "Hold on to it so it can be freed." });
    save({
      list,
      hot: { [prev.id]: "soft", [gone.id]: "coral" },
      arrows: [...chainOf(list, { [prev.id]: { to: after?.id ?? null, tone: "coral" }, [gone.id]: { tone: "ghost", dashed: true } })],
      pointers: [headPin(), { index: p - 1, text: "cur" }],
      line: 6,
      phase: "bypass",
      title: `${prev.value} → ${after ? after.value : "null"}`,
      body: `cur now skips straight past ${gone.value}.`,
    });
    const rest = list.filter((c) => c.id !== gone.id);
    save({ list: rest, extra: [{ ...gone, pos: p - 0.5, lift: 1.5, tone: "ghost" }], arrows: chainOf(rest, { [prev.id]: { tone: "coral" } }), pointers: [headPin()], line: 7, phase: "done", title: `Free ${gone.value}`, body: `${rest.length} nodes left.` });
  }

  return steps;
}

const TAGS = { idea: "Idea", create: "New node", link: "Link", done: "Done", walk: "Walk", mark: "Mark", move: "Move head", bypass: "Unlink" };
const COMPLEXITY = {
  "insert-head": "O(1)",
  "insert-tail": "O(n)",
  "insert-pos": "O(n)",
  "delete-head": "O(1)",
  "delete-tail": "O(n)",
  "delete-pos": "O(n)",
};

const LinkedLesson = ({ kind }) => {
  const [base, setBase] = useState(randomList);
  const [value, setValue] = useState(rand);
  const [pos, setPos] = useState(2);
  const [draftV, setDraftV] = useState(String(value));
  const [draftP, setDraftP] = useState("2");
  const inserting = kind.startsWith("insert");
  const needsPos = kind.endsWith("pos");

  const steps = useMemo(() => build(kind, base, value, pos), [kind, base, value, pos]);
  const playback = usePlayback(steps.length);
  const s = steps[Math.min(playback.index, steps.length - 1)];
  const minPos = Math.min(0, ...s.nodes.map((c) => c.pos));
  const shift = -minPos;

  const nulls = new Set(s.arrows.filter((a) => a.to === null).map((a) => a.from));
  const cells = s.nodes.map((c) => ({ ...c, pos: c.pos + shift, nextNull: nulls.has(c.id) }));
  const pointers = s.pointers.map((p) => ({ ...p, index: p.index + shift }));
  const slots = Math.max(6, ...cells.map((c) => Math.ceil(c.pos) + 1));
  const length = s.nodes.filter((c) => !c.lift).length;

  const apply = (e) => {
    e.preventDefault();
    if (inserting) setValue(Number(draftV) || 0);
    if (needsPos) {
      const p = Math.max(0, Number(draftP) || 0);
      setPos(p);
      setDraftP(String(p));
    }
    playback.reset();
  };

  const controls =
    inserting || needsPos ? (
      <form className="lx-field" onSubmit={apply}>
        {inserting && (
          <>
            <label htmlFor="ll-v">value</label>
            <input id="ll-v" type="number" value={draftV} onChange={(e) => setDraftV(e.target.value)} />
          </>
        )}
        {needsPos && (
          <>
            <label htmlFor="ll-p">position</label>
            <input id="ll-p" type="number" min="0" value={draftP} onChange={(e) => setDraftP(e.target.value)} style={{ width: 44 }} />
          </>
        )}
        <button type="submit">Run</button>
      </form>
    ) : null;

  return (
    <Lesson
      steps={steps}
      playback={playback}
      timeline={(st) => st.title}
      onShuffle={() => {
        setBase(randomList());
        playback.reset();
      }}
      shuffleLabel="New list"
      controls={controls}
      complexity={[
        { label: "time", value: COMPLEXITY[kind] },
        { label: "space", value: "O(1)" },
      ]}
      stage={<IsoArray cells={cells} slots={slots} slab={false} shape="node" step={STEP} arrows={s.arrows.filter((a) => a.to !== null)} pointers={pointers} extraTop={2.4} label="Linked list" />}
      narration={{ tag: TAGS[s.phase], title: s.title, body: <p>{s.body}</p>, notice: s.notice }}
      code={{ lines: CODES[kind], active: s.line, file: "linked_list.cpp" }}
      panels={[
        {
          title: "The list",
          rows: [
            { label: "Nodes", value: length },
            { label: "Head", value: s.nodes.find((c) => c.pos === 0 && !c.lift)?.value ?? null, tone: "coral" },
            { label: "In order", value: s.nodes.filter((c) => !c.lift).sort((a, b) => a.pos - b.pos).map((c) => c.value) },
          ],
        },
      ]}
    />
  );
};

export const InsertAtHead = () => <LinkedLesson kind="insert-head" />;
export const InsertAtTail = () => <LinkedLesson kind="insert-tail" />;
export const InsertAtPosition = () => <LinkedLesson kind="insert-pos" />;
export const DeleteFromHead = () => <LinkedLesson kind="delete-head" />;
export const DeleteFromTail = () => <LinkedLesson kind="delete-tail" />;
export const DeleteFromPosition = () => <LinkedLesson kind="delete-pos" />;
