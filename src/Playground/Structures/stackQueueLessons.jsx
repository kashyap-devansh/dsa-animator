import { useMemo, useState } from "react";
import Lesson from "../../lesson/Lesson";
import IsoArray from "../../iso/IsoArray";
import { IsoScene, At, Slab, Callout, Note, Cylinder } from "../../iso/IsoParts";
import { bounds, boxCorners } from "../../iso/projection";
import { usePlayback } from "../shared/usePlayback";

// Stack push/pop as a tower of cubes, queue enqueue/dequeue as a line on a slab.

const rand = () => Math.floor(Math.random() * 90) + 10;
const CAP = 6;
const PLATE = 0.55;

/* ---------- stack ---------- */

const PUSH_CODE = [
  "void push(int x) {",
  "  if (top == CAP - 1) throw overflow_error(\"full\");",
  "  top++;",
  "  data[top] = x;",
  "}",
];

const POP_CODE = [
  "int pop() {",
  "  if (top == -1) throw underflow_error(\"empty\");",
  "  int x = data[top];",
  "  top--;",
  "  return x;",
  "}",
];

function pushSteps(base, value) {
  const steps = [];
  const items = base.map((c) => ({ ...c }));
  const save = (s) => steps.push({ items: items.map((c) => ({ ...c })), ...s });
  const top = items.length - 1;
  save({ phase: "idea", line: 1, title: `Push ${value}`, body: "A stack is a pile: you can only add to the top and only take from the top. The last thing pushed is the first thing popped.", notice: "Last in, first out. Think of a stack of plates." });
  if (items.length >= CAP) {
    save({ phase: "full", line: 2, title: "The stack is full", body: `All ${CAP} places are taken, so this push would overflow.` });
    return steps;
  }
  save({ phase: "check", line: 2, floating: { id: "new", value }, title: "Is there room?", body: `top is ${top}, below the limit of ${CAP - 1}. There's room.` });
  save({ phase: "top", line: 3, floating: { id: "new", value }, topAt: top + 1, title: `top moves up to ${top + 1}`, body: "Reserve the next place on the pile." });
  items.push({ id: "new", value });
  save({ phase: "done", line: 4, hot: "new", topAt: top + 1, title: `${value} lands on top`, body: `The stack holds ${items.length} values. Only ${value} can be reached now.` });
  return steps;
}

function popSteps(base) {
  const steps = [];
  const items = base.map((c) => ({ ...c }));
  const save = (s) => steps.push({ items: items.map((c) => ({ ...c })), ...s });
  save({ phase: "idea", line: 1, title: "Pop the top value", body: "Only the top of the pile can be taken. Everything underneath stays exactly where it is.", notice: "Push and pop never look past the top, so both are O(1)." });
  if (!items.length) {
    save({ phase: "empty", line: 2, title: "The stack is empty", body: "There's nothing to pop: this would underflow." });
    return steps;
  }
  const top = items[items.length - 1];
  save({ phase: "check", line: 2, hot: top.id, title: "Is there anything to pop?", body: `top is ${items.length - 1}, so yes.` });
  save({ phase: "read", line: 3, hot: top.id, title: `Read ${top.value}`, body: "Copy the top value out before moving top." });
  items.pop();
  save({ phase: "done", line: 4, leaving: top, title: `Return ${top.value}`, body: items.length ? `top drops to ${items.length - 1}. ${items[items.length - 1].value} is the new top.` : "The stack is empty again." });
  return steps;
}

const StackScene = ({ s }) => {
  const items = s.items;
  const view = bounds([...boxCorners(-0.6, -0.6, -0.8, 2.2, 2.2, 0.8), ...boxCorners(0, 0, 0, 1, 1, CAP * PLATE + 2.6)], 18);
  const topIdx = s.topAt ?? items.length - 1;
  return (
    <IsoScene view={view} label="Stack">
      <Slab x={-0.6} y={-0.6} w={2.2} d={2.2} />
      {Array.from({ length: CAP }, (_, k) => (
        <Note key={k} at={[-0.7, 1.6, k * PLATE + PLATE / 2]} text={k} anchor="end" size={12} tone={k === topIdx ? "coral" : "ink-3"} />
      ))}
      {/* Plates: each value is a flat disk on the pile. */}
      {items.map((c, k) => (
        <At key={c.id} x={-0.15} y={-0.15} z={k * PLATE}>
          <Cylinder r={0.65} h={PLATE} tone={c.id === s.hot ? "coral" : "idle"} label={c.value} labelSize={15} />
        </At>
      ))}
      {s.floating && (
        <At key={s.floating.id} x={-0.15} y={-0.15} z={items.length * PLATE + 1.5}>
          <Cylinder r={0.65} h={PLATE} tone="coral" label={s.floating.value} labelSize={15} shadow={1.5} />
        </At>
      )}
      {s.leaving && (
        <At key={s.leaving.id} x={1.8} y={-1.2} z={items.length * PLATE + 1.2}>
          <Cylinder r={0.65} h={PLATE} tone="ghost" label={s.leaving.value} labelSize={15} />
        </At>
      )}
      {items.length > 0 && !s.floating && <Callout at={[0.5, 0.5, items.length * PLATE]} text={`top = ${items.length - 1}`} tone="ink" small rise={0.6} />}
    </IsoScene>
  );
};

/* ---------- queue ---------- */

const ENQ_CODE = [
  "void enqueue(int x) {",
  "  if (size == CAP) throw overflow_error(\"full\");",
  "  data[rear] = x;",
  "  rear = (rear + 1) % CAP;",
  "  size++;",
  "}",
];

const DEQ_CODE = [
  "int dequeue() {",
  "  if (size == 0) throw underflow_error(\"empty\");",
  "  int x = data[front];",
  "  front = (front + 1) % CAP;",
  "  size--;",
  "  return x;",
  "}",
];

function enqueueSteps(base, value) {
  const steps = [];
  const items = base.map((c) => ({ ...c }));
  const save = (s) => steps.push({ items: items.map((c) => ({ ...c })), ...s });
  save({ phase: "idea", line: 1, title: `Enqueue ${value}`, body: "A queue is a line: new arrivals join at the back, and the front is served first.", notice: "First in, first out, like people waiting at a counter." });
  if (items.length >= CAP) {
    save({ phase: "full", line: 2, title: "The queue is full", body: "There's no room at the back." });
    return steps;
  }
  save({ phase: "check", line: 2, incoming: { id: "new", value }, title: "Is there room?", body: `${items.length} of ${CAP} places are used.` });
  items.push({ id: "new", value });
  save({ phase: "write", line: 3, hot: "new", title: `${value} joins the back`, body: `It goes into the slot rear points at, index ${items.length - 1}.` });
  save({ phase: "done", line: 4, hot: "new", title: "rear moves along one", body: `The queue now holds ${items.length} values. ${items[0].value} is still first in line.` });
  return steps;
}

function dequeueSteps(base) {
  const steps = [];
  const items = base.map((c) => ({ ...c }));
  const save = (s) => steps.push({ items: items.map((c) => ({ ...c })), ...s });
  save({ phase: "idea", line: 1, title: "Serve the front", body: "Dequeue takes whoever has waited longest: the value at the front.", notice: "A real queue moves the front index instead of sliding everyone along, so it stays O(1)." });
  if (!items.length) {
    save({ phase: "empty", line: 2, title: "The queue is empty", body: "Nobody is waiting." });
    return steps;
  }
  const first = items[0];
  save({ phase: "read", line: 3, hot: first.id, title: `Read ${first.value}`, body: "Copy out the front value." });
  items.shift();
  save({ phase: "done", line: 4, leaving: first, title: `front moves along: return ${first.value}`, body: items.length ? `${items[0].value} is next in line.` : "The queue is empty again." });
  return steps;
}

/* ---------- page ---------- */

const TAGS = { idea: "Idea", check: "Check", top: "Move top", done: "Done", read: "Read", write: "Write", full: "Overflow", empty: "Underflow" };

const StackQueueLesson = ({ kind }) => {
  const [base, setBase] = useState(() => Array.from({ length: 3 }, (_, id) => ({ id, value: rand() })));
  const [value, setValue] = useState(rand);
  const [draft, setDraft] = useState(String(value));
  const adding = kind === "push" || kind === "enqueue";

  const steps = useMemo(() => {
    if (kind === "push") return pushSteps(base, value);
    if (kind === "pop") return popSteps(base);
    if (kind === "enqueue") return enqueueSteps(base, value);
    return dequeueSteps(base);
  }, [kind, base, value]);

  const playback = usePlayback(steps.length);
  const s = steps[Math.min(playback.index, steps.length - 1)];
  const last = playback.index >= steps.length - 1;

  // Running the operation again keeps the result, so learners can build up
  // a stack or queue one push or pop at a time.
  const again = () => {
    const final = steps[steps.length - 1].items.map((c, i) => ({ ...c, id: `${Date.now()}-${i}` }));
    setBase(final);
    playback.reset();
  };

  const isStack = kind === "push" || kind === "pop";
  const code = { push: PUSH_CODE, pop: POP_CODE, enqueue: ENQ_CODE, dequeue: DEQ_CODE }[kind];

  let stage;
  if (isStack) stage = <StackScene s={s} />;
  else {
    const cells = s.items.map((c, k) => ({ id: c.id, value: c.value, pos: k, tone: c.id === s.hot ? "coral" : "idle" }));
    if (s.incoming) cells.push({ id: s.incoming.id, value: s.incoming.value, pos: s.items.length, lift: 1.7, tone: "coral" });
    if (s.leaving) cells.push({ id: s.leaving.id, value: s.leaving.value, pos: -1.2, lift: 0.9, tone: "ghost" });
    const tiles = {};
    for (let k = s.items.length; k < CAP; k++) tiles[k] = "slot";
    const pointers = s.items.length ? [{ index: 0, text: "front", tone: "coral" }, { index: s.items.length - 1, text: "rear" }] : [];
    stage = <IsoArray cells={cells} slots={CAP} tiles={tiles} pointers={pointers} extraTop={2.6} label="Queue" />;
  }

  return (
    <Lesson
      steps={steps}
      playback={playback}
      timeline={(st) => st.title}
      onShuffle={() => {
        setBase(Array.from({ length: 3 }, (_, id) => ({ id: `${Date.now()}-${id}`, value: rand() })));
        playback.reset();
      }}
      shuffleLabel="Start over"
      controls={
        <>
          {adding && (
            <form
              className="lx-field"
              onSubmit={(e) => {
                e.preventDefault();
                setValue(Number(draft) || 0);
                playback.reset();
              }}
            >
              <label htmlFor="sq-v">value</label>
              <input id="sq-v" type="number" value={draft} onChange={(e) => setDraft(e.target.value)} />
              <button type="submit">Set</button>
            </form>
          )}
          {last && (
            <button className="lx-tool" onClick={again}>
              {kind === "push" ? "Push another" : kind === "pop" ? "Pop again" : kind === "enqueue" ? "Enqueue another" : "Dequeue again"}
            </button>
          )}
        </>
      }
      complexity={[
        { label: kind, value: "O(1)" },
        { label: "space", value: "O(n)" },
      ]}
      stage={stage}
      narration={{ tag: TAGS[s.phase], title: s.title, body: <p>{s.body}</p>, notice: s.notice }}
      code={{ lines: code, active: s.line, file: isStack ? "stack.cpp" : "queue.cpp" }}
      panels={[
        {
          title: isStack ? "The stack" : "The queue",
          rows: [
            { label: "Size", value: `${s.items.length} / ${CAP}` },
            isStack
              ? { label: "Top", value: s.items[s.items.length - 1]?.value ?? null, tone: "coral" }
              : { label: "Front", value: s.items[0]?.value ?? null, tone: "coral" },
            { label: isStack ? "Bottom to top" : "Front to back", value: s.items.map((c) => c.value) },
          ],
        },
      ]}
    />
  );
};

export const Push = () => <StackQueueLesson kind="push" />;
export const Pop = () => <StackQueueLesson kind="pop" />;
export const Enqueue = () => <StackQueueLesson kind="enqueue" />;
export const Dequeue = () => <StackQueueLesson kind="dequeue" />;
