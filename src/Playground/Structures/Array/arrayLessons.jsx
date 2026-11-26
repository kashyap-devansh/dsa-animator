import { useMemo, useState } from "react";
import Lesson from "../../../lesson/Lesson";
import IsoArray from "../../../iso/IsoArray";
import { usePlayback } from "../../shared/usePlayback";

// Insert, delete and traverse on a fixed-capacity array. Every value keeps
// its id, so a shift is drawn as the cube sliding one cell over.

const CAPACITY = 8;
const randomRow = () => Array.from({ length: 6 }, (_, id) => ({ id, value: Math.floor(Math.random() * 90) + 10 }));
const snap = (row) => row.map((c) => (c ? { ...c } : null));

/* ---------- insert ---------- */

const INSERT_CODE = [
  "void insert(int arr[], int& n, int cap, int pos, int x) {",
  "  if (n == cap || pos < 0 || pos > n) return;",
  "  for (int i = n - 1; i >= pos; i--) {",
  "    arr[i + 1] = arr[i];",
  "  }",
  "  arr[pos] = x;",
  "  n++;",
  "}",
];

function insertSteps(base, pos, value) {
  const row = [...snap(base), ...Array(CAPACITY - base.length).fill(null)];
  let n = base.length;
  const steps = [];
  let shifts = 0;
  const fresh = { id: "new", value };
  const save = (s) => steps.push({ row: snap(row), n, shifts, hot: null, incoming: null, ...s });

  save({
    phase: "idea",
    line: 1,
    incoming: { ...fresh, pos },
    title: `Insert ${value} at index ${pos}`,
    body: `An array's values sit side by side with no gaps. To fit ${value} in at index ${pos}, everything from index ${pos} onwards has to move one cell right first.`,
    notice: "Shifting is what makes insertion O(n). Adding at the very end needs no shifts at all.",
  });

  save({ phase: "check", line: 2, incoming: { ...fresh, pos }, title: "Is there room?", body: `${n} of ${CAPACITY} cells are used, and ${pos} is between 0 and ${n}, so the insert can go ahead.` });

  for (let i = n - 1; i >= pos; i--) {
    row[i + 1] = row[i];
    row[i] = null;
    shifts++;
    save({ phase: "shift", line: 4, hot: i + 1, incoming: { ...fresh, pos }, title: `Move ${row[i + 1].value} to index ${i + 1}`, body: `Start from the end so nothing is overwritten. Index ${i} is now free.` });
  }

  row[pos] = fresh;
  save({ phase: "place", line: 6, hot: pos, title: `Write ${value} into index ${pos}`, body: "The gap is exactly where it needs to be." });

  n++;
  save({ phase: "done", line: 7, hot: pos, title: `Length is now ${n}`, body: `Insert finished with ${shifts} shift${shifts === 1 ? "" : "s"}.`, notice: shifts ? null : "Inserting at the end moved nothing, which is why appending is O(1)." });

  return steps;
}

/* ---------- delete ---------- */

const DELETE_CODE = [
  "void remove(int arr[], int& n, int pos) {",
  "  if (pos < 0 || pos >= n) return;",
  "  for (int i = pos; i < n - 1; i++) {",
  "    arr[i] = arr[i + 1];",
  "  }",
  "  n--;",
  "}",
];

function deleteSteps(base, pos) {
  const row = [...snap(base), ...Array(CAPACITY - base.length).fill(null)];
  let n = base.length;
  const steps = [];
  let shifts = 0;
  const gone = row[pos];
  const save = (s) => steps.push({ row: snap(row), n, shifts, hot: null, leaving: null, ...s });

  save({
    phase: "idea",
    line: 1,
    hot: pos,
    title: `Delete index ${pos} (${gone.value})`,
    body: `Removing ${gone.value} leaves a hole. Arrays can't have holes in the middle, so every value after it moves one cell left to close the gap.`,
    notice: "Deleting near the front means moving almost everything: O(n). Deleting the last value moves nothing.",
  });

  row[pos] = null;
  save({ phase: "remove", line: 2, leaving: gone, title: `Take ${gone.value} out`, body: `Index ${pos} is now empty.` });

  for (let i = pos; i < n - 1; i++) {
    row[i] = row[i + 1];
    row[i + 1] = null;
    shifts++;
    save({ phase: "shift", line: 4, hot: i, title: `Move ${row[i].value} to index ${i}`, body: `Work left to right, pulling each value back one cell.` });
  }

  n--;
  save({ phase: "done", line: 6, title: `Length is now ${n}`, body: `Delete finished with ${shifts} shift${shifts === 1 ? "" : "s"}.` });
  return steps;
}

/* ---------- traverse ---------- */

const TRAVERSE_CODE = [
  "int sum(int arr[], int n) {",
  "  int total = 0;",
  "  for (int i = 0; i < n; i++) {",
  "    total += arr[i];",
  "  }",
  "  return total;",
  "}",
];

function traverseSteps(base) {
  const row = [...snap(base), ...Array(CAPACITY - base.length).fill(null)];
  const steps = [];
  let total = 0;
  const save = (s) => steps.push({ row: snap(row), n: base.length, total, hot: null, seen: 0, ...s });

  save({
    phase: "idea",
    line: 1,
    title: "Visit every value once",
    body: "Traversal walks the array from index 0 to n − 1. Here each visit adds the value to a running total.",
    notice: "Reading arr[i] takes the same time for any i, because the address is just start + i × size.",
  });
  save({ phase: "init", line: 2, title: "Start the total at 0", body: "Nothing has been added yet." });

  base.forEach((c, i) => {
    total += c.value;
    save({ phase: "visit", line: 4, hot: i, seen: i + 1, title: `Add arr[${i}] = ${c.value}`, body: `Running total: ${total}.` });
  });

  save({ phase: "done", line: 6, seen: base.length, title: `Total = ${total}`, body: `${base.length} values, ${base.length} visits: O(n).` });
  return steps;
}

/* ---------- shared page ---------- */

const TAGS = { idea: "Idea", check: "Check", shift: "Shift", place: "Write", done: "Done", remove: "Remove", init: "Setup", visit: "Visit" };

function cellsFor(s, kind) {
  const cells = [];
  s.row.forEach((c, k) => {
    if (!c) return;
    let tone = k < (s.n ?? 0) || kind !== "traverse" ? "idle" : "idle";
    if (kind === "traverse" && k < s.seen) tone = "sage";
    if (k === s.hot) tone = s.phase === "shift" ? "amber" : s.phase === "visit" ? "coral" : s.phase === "idea" ? "soft" : "coral";
    if (c.id === "new" && s.phase !== "shift") tone = "coral";
    cells.push({ id: c.id, value: c.value, pos: k, tone, lift: k === s.hot && s.phase === "shift" ? 0.3 : 0 });
  });
  if (s.incoming) cells.push({ id: s.incoming.id, value: s.incoming.value, pos: s.incoming.pos, lift: 1.9, tone: "coral" });
  if (s.leaving) cells.push({ id: s.leaving.id, value: s.leaving.value, pos: s.row.findIndex((c) => c === null), lift: 1.9, tone: "ghost" });
  return cells;
}

function tilesFor(s) {
  const tiles = {};
  for (let k = 0; k < CAPACITY; k++) if (!s.row[k]) tiles[k] = "slot";
  return tiles;
}

const ArrayLesson = ({ kind }) => {
  const [base, setBase] = useState(randomRow);
  const [value, setValue] = useState(() => Math.floor(Math.random() * 90) + 10);
  const [pos, setPos] = useState(2);
  const [draftV, setDraftV] = useState(String(value));
  const [draftP, setDraftP] = useState("2");

  const steps = useMemo(() => {
    if (kind === "insert") return insertSteps(base, pos, value);
    if (kind === "delete") return deleteSteps(base, Math.min(pos, base.length - 1));
    return traverseSteps(base);
  }, [kind, base, pos, value]);

  const playback = usePlayback(steps.length);
  const s = steps[Math.min(playback.index, steps.length - 1)];
  const code = kind === "insert" ? INSERT_CODE : kind === "delete" ? DELETE_CODE : TRAVERSE_CODE;

  const apply = (e) => {
    e.preventDefault();
    const p = Math.max(0, Math.min(Number(draftP) || 0, kind === "insert" ? base.length : base.length - 1));
    setPos(p);
    setDraftP(String(p));
    if (kind === "insert") setValue(Number(draftV) || 0);
    playback.reset();
  };

  const controls =
    kind === "traverse" ? null : (
      <form className="lx-field" onSubmit={apply}>
        {kind === "insert" && (
          <>
            <label htmlFor="arr-v">value</label>
            <input id="arr-v" type="number" value={draftV} onChange={(e) => setDraftV(e.target.value)} />
          </>
        )}
        <label htmlFor="arr-p">index</label>
        <input id="arr-p" type="number" min="0" value={draftP} onChange={(e) => setDraftP(e.target.value)} style={{ width: 48 }} />
        <button type="submit">{kind === "insert" ? "Insert" : "Delete"}</button>
      </form>
    );

  const callouts = [];
  if (s.incoming) callouts.push({ id: "new", text: `insert at ${s.incoming.pos}`, small: true });
  if (s.leaving) callouts.push({ id: s.leaving.id, text: "removed", tone: "ink", small: true });
  if (kind === "traverse" && s.hot !== null) callouts.push({ index: s.hot, text: `total = ${s.total}` });

  const pointers = s.hot !== null && kind === "traverse" ? [{ index: s.hot, text: "i" }] : [];
  const lengthPin = [{ index: Math.min(s.n, CAPACITY - 1), text: s.n < CAPACITY ? "n" : "full", tone: "coral" }];

  return (
    <Lesson
      steps={steps}
      playback={playback}
      timeline={(st) => st.title}
      onShuffle={() => {
        setBase(randomRow());
        playback.reset();
      }}
      shuffleLabel="New array"
      controls={controls}
      complexity={kind === "traverse" ? [{ label: "time", value: "O(n)" }, { label: "access", value: "O(1)" }] : [{ label: "time", value: "O(n)" }, { label: "at the end", value: "O(1)" }]}
      stage={
        <IsoArray
          cells={cellsFor(s, kind)}
          slots={CAPACITY}
          tiles={tilesFor(s)}
          pointers={[...pointers, ...(kind === "traverse" ? [] : lengthPin)]}
          callouts={callouts}
          extraTop={3.2}
          label="Array"
        />
      }
      narration={{ tag: TAGS[s.phase], title: s.title, body: <p>{s.body}</p>, notice: s.notice }}
      code={{ lines: code, active: s.line, file: `array_${kind}.cpp` }}
      panels={[
        {
          title: "The array",
          rows: [
            { label: "Length n", value: s.n },
            { label: "Capacity", value: CAPACITY },
            ...(kind === "traverse" ? [{ label: "Running total", value: s.total, tone: "coral" }] : [{ label: "Shifts so far", value: s.shifts }]),
          ],
        },
      ]}
      legend={
        kind === "traverse"
          ? [
              { label: "Visiting", tone: "coral" },
              { label: "Visited", tone: "sage" },
            ]
          : [
              { label: kind === "insert" ? "New value" : "Target", tone: "coral" },
              { label: "Shifting", tone: "amber" },
              { label: "Free cell", tone: "slot" },
            ]
      }
    />
  );
};

export const ArrayInsert = () => <ArrayLesson kind="insert" />;
export const ArrayDelete = () => <ArrayLesson kind="delete" />;
export const ArrayTraverse = () => <ArrayLesson kind="traverse" />;
