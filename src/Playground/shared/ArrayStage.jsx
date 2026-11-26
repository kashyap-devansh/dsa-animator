import IsoArray from "../../iso/IsoArray";
import { Variables } from "./StepperPage";

// Adapter: the older ArrayStage API (values, roles, range, pointers, vars)
// drawn as an isometric row. Pass `keys` to make cubes glide when values move.

const ROLE_TONE = {
  probe: "coral",
  active: "coral",
  compare: "soft",
  found: "sage",
  done: "sage",
  include: "sage",
  miss: "dark",
  exclude: "dark",
  block: "soft",
  swap: "amber",
  fixed: "sage",
};

const PIN_TONE = { orange: "coral", lime: "sage" };

const ArrayStage = ({ values, keys, roles = {}, range, pointers = [], vars, caption }) => {
  const cells = values.map((value, i) => {
    const role = roles[i];
    const dim = range && (i < range[0] || i > range[1]);
    return {
      id: keys ? keys[i] : i,
      value,
      tone: role ? ROLE_TONE[role] ?? "soft" : dim ? "ghost" : "idle",
      lift: role === "probe" || role === "active" || role === "swap" ? 0.35 : 0,
    };
  });

  return (
    <div className="lx-stage-wrap">
      {caption && <p className="lx-stage-caption">{caption}</p>}
      <IsoArray
        cells={cells}
        slots={values.length}
        pointers={pointers.filter((p) => p.index >= 0 && p.index < values.length).map((p) => ({ index: p.index, text: p.label, tone: PIN_TONE[p.tone] }))}
        label={caption || "Array"}
      />
      {vars?.length > 0 && <Variables items={vars} />}
    </div>
  );
};

export default ArrayStage;
