import { useMemo, useState } from "react";
import Lesson from "../../../lesson/Lesson";
import { lessonPlayback, useRunChain } from "../../shared/useRunChain";
import LinkedStage from "./LinkedStage";
import { CODES, MAX_NODES, keyFor, nextKeyFor, runOp, sessionDone, startList } from "./linkedEngine";

// Six singly linked list operations. Each operation is one line of code per
// step (see linkedEngine); when one finishes, the next starts on the list it
// left behind, so playback keeps going: inserts until the list is full,
// deletes until one node is left. Then Play starts a fresh list.

const TAGS = { idea: "Idea", create: "New node", link: "Link", point: "Repoint", done: "Done", walk: "Walk", mark: "Temp pointer", move: "Move head", bypass: "Unlink", free: "Free" };
// Pointer changes stay on screen longer so the arrow can be followed.
const HOLD = { create: 1.4, link: 2, point: 2, move: 1.8, bypass: 2, mark: 1.5, free: 1.6 };

const COMPLEXITY = {
  "insert-head": "O(1)",
  "insert-tail": "O(n)",
  "insert-pos": "O(n)",
  "delete-head": "O(1)",
  "delete-tail": "O(n)",
  "delete-pos": "O(n)",
};

// The list read by following next pointers from head.
function linkedOrder(step) {
  const head = step.pins.find((p) => p.text === "head")?.at ?? null;
  const next = new Map(step.ptrs.map((p) => [p.from, p.to]));
  const byId = new Map(step.nodes.map((n) => [n.id, n]));
  const out = [];
  const seen = new Set();
  for (let id = head; id != null && byId.has(id) && !seen.has(id); id = next.get(id)) {
    seen.add(id);
    out.push(byId.get(id).value);
  }
  return out;
}

const LinkedLesson = ({ kind }) => {
  const inserting = kind.startsWith("insert");
  const needsPos = kind.endsWith("pos");
  const [draftV, setDraftV] = useState("");
  const [draftP, setDraftP] = useState("");

  const first = () => {
    const list = startList(kind);
    return { tree: list, key: nextKeyFor(kind, list) };
  };
  const chain = useRunChain((list, key) => runOp(kind, list, key), first, {
    nextKey: (list) => nextKeyFor(kind, list),
    shouldStop: (list) => sessionDone(kind, list),
    restart: first,
    holdFor: (step) => HOLD[step?.phase] ?? 1,
  });
  const { current: s, steps } = chain;

  // One frame for the whole operation, so the camera only moves between them.
  const frame = useMemo(() => {
    const all = steps.flatMap((st) => st.nodes);
    return {
      min: Math.min(0, ...all.map((n) => n.slot)),
      max: Math.max(4, ...all.map((n) => n.slot)),
      lift: Math.max(2.3, ...all.map((n) => n.lift)),
    };
  }, [steps]);

  const order = linkedOrder(s);
  const length = chain.result.length;

  const run = (e) => {
    e.preventDefault();
    const list = chain.result;
    const value = draftV.trim() === "" ? null : Number(draftV);
    const pos = draftP.trim() === "" ? null : Math.max(0, Number(draftP) || 0);
    const auto = nextKeyFor(kind, list);
    chain.continueWith(keyFor(kind, list, value ?? auto.value, pos ?? auto.pos));
    setDraftV("");
  };

  const controls = (
    <form className="lx-field" onSubmit={run}>
      {inserting && (
        <>
          <label htmlFor="ll-v">value</label>
          <input id="ll-v" type="number" value={draftV} placeholder="any" onChange={(e) => setDraftV(e.target.value)} />
        </>
      )}
      {needsPos && (
        <>
          <label htmlFor="ll-p">position</label>
          <input id="ll-p" type="number" min="0" value={draftP} placeholder="any" onChange={(e) => setDraftP(e.target.value)} style={{ width: 52 }} />
        </>
      )}
      <button type="submit" disabled={!inserting && length === 0}>
        {inserting ? "Insert" : "Delete"}
      </button>
    </form>
  );

  const doneNote = inserting ? `The list reached ${MAX_NODES} nodes. Press Play for a new list.` : "Only one node is left. Press Play for a new list.";

  return (
    <Lesson
      steps={steps}
      playback={lessonPlayback(chain)}
      timeline={(st) => st.title}
      onShuffle={() => chain.load(first())}
      shuffleLabel="New list"
      controls={controls}
      complexity={[
        { label: "time", value: COMPLEXITY[kind] },
        { label: "space", value: "O(1)" },
      ]}
      stage={<LinkedStage step={s} frame={frame} />}
      narration={{
        tag: chain.finished ? "Done" : TAGS[s.phase],
        title: s.title,
        body: <p>{s.body}</p>,
        notice: chain.finished ? doneNote : s.notice ?? (chain.opNumber > 1 && chain.index === 0 ? `Operation ${chain.opNumber} starts on the list the last one left behind.` : null),
        noticeLabel: chain.finished ? "Session over" : chain.opNumber > 1 && chain.index === 0 && !s.notice ? "Chained" : undefined,
      }}
      code={{ lines: CODES[kind], active: s.line, file: "linked_list.cpp" }}
      panels={[
        {
          title: "The list",
          rows: [
            { label: "Operation", value: `#${chain.opNumber}` },
            { label: "Nodes", value: order.length },
            { label: "Head", value: order[0] ?? null, tone: "coral" },
            { label: "Following next", value: order },
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
