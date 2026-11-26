import { useMemo, useState } from "react";
import Lesson from "../../../lesson/Lesson";
import { IsoScene, At, Box, Slab, Note, Callout, Cylinder } from "../../../iso/IsoParts";
import { bounds, boxCorners } from "../../../iso/projection";
import { usePlayback } from "../../shared/usePlayback";

// Tower of Hanoi on three pegs. Every disk keeps its size as its id, so a
// move is drawn as the disk lifting off one peg and settling on another.

const PEGS = ["A", "B", "C"];
const GAP = 4.2;
const DISK_H = 0.42;

const CODE = [
  "void hanoi(int n, char from, char to, char via) {",
  "  if (n == 0) return;",
  "  hanoi(n - 1, from, via, to);",
  "  move(from, to);",
  "  hanoi(n - 1, via, to, from);",
  "}",
];

function hanoiSteps(count) {
  const pegs = { A: [], B: [], C: [] };
  for (let d = count; d >= 1; d--) pegs.A.push(d);
  const steps = [];
  let moves = 0;
  const total = 2 ** count - 1;
  const snap = () => ({ A: [...pegs.A], B: [...pegs.B], C: [...pegs.C] });
  const save = (s) => steps.push({ pegs: snap(), moves, total, lifted: null, depth: 0, ...s });

  save({
    phase: "idea",
    line: 1,
    title: `Move ${count} disks from A to C`,
    body: "Only one disk moves at a time, and a bigger disk may never sit on a smaller one. The trick: to move n disks, first move the n − 1 on top out of the way.",
    notice: `It always takes 2ⁿ − 1 moves: ${total} for ${count} disks.`,
  });

  const solve = (n, from, to, via, depth) => {
    if (n === 0) return;
    save({ phase: "plan", line: 3, depth, title: n > 1 ? `Clear ${n - 1} disk${n > 2 ? "s" : ""} off disk ${n}` : `Disk 1 is free to move`, body: n > 1 ? `To move disk ${n} from ${from} to ${to}, the ${n - 1} smaller disk${n > 2 ? "s" : ""} above it must go to ${via} first.` : `Nothing sits on disk 1, so it can move straight away.` });
    solve(n - 1, from, via, to, depth + 1);
    const disk = pegs[from].pop();
    pegs[to].push(disk);
    moves++;
    save({ phase: "move", line: 4, depth, lifted: { disk, from, to }, title: `Disk ${disk}: ${from} → ${to}`, body: `Move ${moves} of ${total}. Disk ${disk} lands on ${pegs[to].length > 1 ? `disk ${pegs[to][pegs[to].length - 2]}, which is bigger` : "an empty peg"}.` });
    if (n > 1) save({ phase: "plan", line: 5, depth, title: `Stack the ${n - 1} back on top`, body: `Disk ${n} is in place on ${to}. Now move the ${n - 1} smaller disk${n > 2 ? "s" : ""} from ${via} onto it.` });
    solve(n - 1, via, to, from, depth + 1);
  };

  solve(count, "A", "C", "B", 1);
  save({ phase: "done", line: 6, title: "Solved", body: `All ${count} disks are on C, in ${moves} moves, the fewest possible.` });
  return steps;
}

const HanoiScene = ({ s, count }) => {
  const maxW = 0.9 + count * 0.42;
  const view = bounds([...boxCorners(-maxW / 2 - 0.5, -maxW / 2 - 0.5, -0.75, GAP * 2 + maxW + 1, maxW + 1, 0.75), ...boxCorners(0, 0, 0, GAP * 2, 1, count * DISK_H + 2.2)], 16);
  const disks = [];
  PEGS.forEach((p, pi) => {
    s.pegs[p].forEach((d, level) => {
      const r = 0.45 + d * 0.21;
      disks.push({ d, r, z: level * DISK_H, pi, level });
    });
  });
  disks.sort((a, b) => a.pi - b.pi || a.level - b.level);

  return (
    <IsoScene view={view} label="Tower of Hanoi">
      <Slab x={-maxW / 2 - 0.5} y={-maxW / 2 - 0.5} w={GAP * 2 + maxW + 1} d={maxW + 1} indexAt={[0, GAP, GAP * 2]} indexLabels={PEGS} />
      {PEGS.flatMap((p, pi) => {
        const stack = disks.filter((k) => k.pi === pi);
        const topZ = stack.length * DISK_H;
        const poleH = count * DISK_H + 0.9;
        return [
          // Disks first, bottom up; then the part of the pole that rises out
          // of the top disk's hole, so the pole reads as running through them.
          ...stack.map((k) => (
            <At key={`d${k.d}`} x={pi * GAP - k.r} y={-k.r} z={k.z}>
              <Cylinder r={k.r} h={DISK_H} hole={0.13} tone={s.lifted?.disk === k.d ? "coral" : s.phase === "done" ? "sage" : "idle"} label={k.d} labelSize={13} />
            </At>
          )),
          <At key={`pole${p}`} x={pi * GAP - 0.1} y={-0.1} z={topZ} instant>
            <Box w={0.2} d={0.2} h={poleH - topZ} tone="dark" />
          </At>,
        ];
      })}
      {PEGS.map((p, pi) => (
        <Note key={`n${p}`} at={[pi * GAP, maxW / 2 + 1.4, -0.75]} text={p === "A" ? "from" : p === "C" ? "to" : "spare"} size={12} weight={600} />
      ))}
      {s.lifted && <Callout at={[PEGS.indexOf(s.lifted.to) * GAP, 0, s.pegs[s.lifted.to].length * DISK_H]} text={`${s.lifted.from} → ${s.lifted.to}`} rise={1.2} small />}
    </IsoScene>
  );
};

const TAGS = { idea: "Idea", plan: "Recurse", move: "Move", done: "Solved" };

const TowerOfHanoi = () => {
  const [count, setCount] = useState(3);
  const steps = useMemo(() => hanoiSteps(count), [count]);
  const playback = usePlayback(steps.length);
  const s = steps[Math.min(playback.index, steps.length - 1)];

  return (
    <Lesson
      steps={steps}
      playback={playback}
      timeline={(st) => st.title}
      controls={
        <div className="lx-segment" role="group" aria-label="Disks">
          {[3, 4, 5].map((n) => (
            <button
              key={n}
              className={count === n ? "lx-segment-on" : ""}
              onClick={() => {
                setCount(n);
                playback.reset();
              }}
            >
              {n} disks
            </button>
          ))}
        </div>
      }
      complexity={[
        { label: "time", value: "O(2ⁿ)" },
        { label: "space", value: "O(n)" },
      ]}
      stage={<HanoiScene s={s} count={count} />}
      narration={{ tag: TAGS[s.phase], title: s.title, body: <p>{s.body}</p>, notice: s.notice }}
      code={{ lines: CODE, active: s.line, file: "hanoi.cpp" }}
      panels={[
        {
          title: "Progress",
          rows: [
            { label: "Moves", value: `${s.moves} / ${s.total}`, tone: "coral" },
            { label: "A", value: s.pegs.A },
            { label: "B", value: s.pegs.B },
            { label: "C", value: s.pegs.C },
          ],
        },
      ]}
    />
  );
};

export default TowerOfHanoi;
