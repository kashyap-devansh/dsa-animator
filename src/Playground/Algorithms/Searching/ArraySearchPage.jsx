import { useMemo, useState } from "react";
import Lesson from "../../../lesson/Lesson";
import IsoArray from "../../../iso/IsoArray";
import { usePlayback } from "../../shared/usePlayback";
import { sortedUniqueArray, randomTarget } from "../../shared/randomArray";

// One page for every search over a row. Steps carry roles (probe, found,
// miss, block), the live range and pointers; this draws them as cubes, with
// the target riding in front of the row under whatever is being probed.

const PIN_TONE = { orange: "coral", lime: "sage", blue: undefined, cyan: undefined, gray: undefined };
const TARGET_DY = 2.9;

// Older generators write "headline — detail"; split that into title and body.
function narrate(step) {
  if (step.title) return { title: step.title, body: step.body };
  const [head, ...rest] = step.description.split(" — ");
  return { title: head, body: rest.join(" — ") || null };
}

function tagFor(step) {
  if (step.result === "miss") return "Not found";
  if (step.result !== null && step.result !== undefined) return "Found";
  const roles = Object.values(step.roles);
  if (roles.includes("probe")) return "Probe";
  if (roles.includes("miss")) return "Narrow";
  if (roles.includes("block")) return "Block";
  return "Setup";
}

const ArraySearchPage = ({
  generate,
  size = 12,
  code,
  filename,
  complexity,
  makeArray = sortedUniqueArray,
  shuffleLabel = "New row",
  idea,
}) => {
  const [seed, setSeed] = useState(() => makeArray(size));
  const [target, setTarget] = useState(() => randomTarget(seed));
  const [draft, setDraft] = useState(String(target));

  const steps = useMemo(() => {
    const raw = generate(seed, target);
    if (!idea) return raw;
    // A first step that sets the scene, for generators that start mid-action.
    return [{ ...raw[0], title: idea.title, body: idea.body, notice: idea.notice, roles: {}, pointers: [], codeLine: 1 }, ...raw];
  }, [generate, seed, target, idea]);

  const playback = usePlayback(steps.length);
  const s = steps[Math.min(playback.index, steps.length - 1)];
  const { title, body } = narrate(s);
  const [lo, hi] = s.range ?? [0, seed.length - 1];

  const probeAt = Object.entries(s.roles).find(([, r]) => r === "probe" || r === "found")?.[0];
  const probe = probeAt !== undefined ? Number(probeAt) : null;
  const done = s.result !== null && s.result !== undefined;

  const cells = seed.map((value, k) => {
    const role = s.roles[k];
    let tone = "idle";
    let lift = 0;
    if (role === "found") {
      tone = "sage";
      lift = 0.5;
    } else if (role === "probe") {
      tone = "coral";
      lift = 0.4;
    } else if (role === "miss") tone = "dark";
    else if (role === "block") tone = "soft";
    else if (s.range && (k < lo || k > hi)) tone = "ghost";
    if (s.result === "miss") tone = "ghost";
    return { id: k, value, tone, lift };
  });

  // The target cube slides along in front of the row.
  const targetPos = probe ?? (s.result === "miss" ? Math.min(Math.max(lo, 0), seed.length - 1) : Math.min(Math.max(lo, 0), seed.length - 1));
  cells.push({ id: "target", value: target, pos: targetPos, dy: TARGET_DY, tone: s.result === "miss" ? "ghost" : "dark" });

  const pointers = s.pointers.filter((p) => p.index >= 0 && p.index < seed.length).map((p) => ({ index: p.index, text: p.label, tone: PIN_TONE[p.tone] }));

  const callouts = [];
  if (probe !== null) {
    const v = seed[probe];
    callouts.push({ index: probe, text: v === target ? `${v} = ${target}` : v < target ? `${v} < ${target}` : `${v} > ${target}`, tone: v === target ? "sage" : "coral" });
  }
  callouts.push({ id: "target", text: "target", tone: "ink", small: true, rise: 0.5 });

  const resultText = s.result === null || s.result === undefined ? null : s.result === "miss" ? "not found" : `index ${s.result}`;

  const newRow = () => {
    const next = makeArray(size);
    const t = randomTarget(next);
    setSeed(next);
    setTarget(t);
    setDraft(String(t));
    playback.reset();
  };

  const submitTarget = (e) => {
    e.preventDefault();
    const v = Number(draft);
    if (draft === "" || Number.isNaN(v)) return;
    setTarget(v);
    playback.reset();
  };

  return (
    <Lesson
      steps={steps}
      playback={playback}
      timeline={(st) => narrate(st).title}
      onShuffle={newRow}
      shuffleLabel={shuffleLabel}
      controls={
        <form className="lx-field" onSubmit={submitTarget}>
          <label htmlFor="search-target">target</label>
          <input id="search-target" type="number" value={draft} onChange={(e) => setDraft(e.target.value)} />
          <button type="submit">Search</button>
        </form>
      }
      complexity={complexity}
      stage={<IsoArray cells={cells} slots={seed.length} pointers={pointers} callouts={callouts} front={TARGET_DY} label="Search row" />}
      narration={{ tag: tagFor(s), title, body: body ? <p>{body}</p> : null, notice: s.notice }}
      code={{ lines: code, active: s.codeLine, file: filename }}
      panels={[
        {
          title: "Search state",
          rows: [
            { label: "Target", value: target, tone: "coral" },
            ...s.vars.filter((v) => v.label).map((v) => ({ label: v.label, value: v.value })),
            { label: "Still possible", value: s.range && hi >= lo ? `${hi - lo + 1} of ${seed.length}` : done ? null : `${seed.length} of ${seed.length}` },
          ],
        },
        {
          title: "Work done",
          rows: [
            { label: "Comparisons", value: s.comparisons },
            { label: "Result", value: resultText, tone: done && s.result !== "miss" ? "coral" : undefined },
          ],
        },
      ]}
      legend={[
        { label: "Probing", tone: "coral" },
        { label: "Ruled out by this probe", tone: "dark" },
        { label: "Out of range", tone: "ghost" },
        { label: "Found", tone: "sage" },
      ]}
    />
  );
};

export default ArraySearchPage;
