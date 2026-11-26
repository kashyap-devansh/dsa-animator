import Lesson from "../../lesson/Lesson";

// Adapter: pages written against the older StepperPage props render through
// the new three-pane Lesson. `status` becomes the step's narration, `stats`
// a panel, `input` a toolbar field.

export const Chips = ({ label, items, active, onPick }) => (
  <div className="lx-segment" role="group" aria-label={label}>
    {items.map((item) => (
      <button key={item.id} className={active === item.id ? "lx-segment-on" : ""} onClick={() => onPick(item)} title={item.hint}>
        {item.label ?? item.id}
      </button>
    ))}
  </div>
);

export const Segment = ({ label, options, value, onChange }) => (
  <div className="lx-segment" role="group" aria-label={label}>
    {options.map((o) => (
      <button key={o.id} className={value === o.id ? "lx-segment-on" : ""} onClick={() => onChange(o.id)}>
        {o.label ?? o.id}
      </button>
    ))}
  </div>
);

// Kept for older stages that list variables inline; rendered as plain chips.
export const Variables = ({ items }) => (
  <div className="lx-vars">
    {items.map((v) => (
      <span key={v.label}>
        {v.label} <b>{v.value}</b>
      </span>
    ))}
  </div>
);

const textOf = (node) => {
  if (node === null || node === undefined || node === false) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (node.props) return textOf(node.props.children);
  return "";
};

const split = (text) => {
  const [head, ...rest] = String(text).split(" — ");
  return { title: head, body: rest.join(" — ") };
};

const StepperPage = ({
  title,
  blurb,
  complexity = [],
  toolbar,
  stage,
  status,
  filename,
  code,
  codeLine,
  playback,
  shuffleLabel,
  onShuffle,
  input,
  stats = [],
  steps,
  tag,
  notice,
}) => {
  const total = playback.total ?? steps?.length ?? 1;
  const list = steps ?? Array.from({ length: total }, (_, i) => ({ description: `Step ${i + 1}` }));
  const { title: head, body } = split(textOf(status));
  const first = playback.index === 0;

  const controls = (
    <>
      {toolbar}
      {input && (
        <form
          className="lx-field"
          onSubmit={(e) => {
            e.preventDefault();
            input.onAction?.();
          }}
        >
          {input.label && <label htmlFor="sp-input">{input.label}</label>}
          <input
            id="sp-input"
            type="number"
            placeholder={input.placeholder}
            value={input.value}
            min={input.min}
            max={input.max}
            onChange={(e) => input.onChange(e.target.value)}
          />
          {input.actionLabel && <button type="submit">{input.actionLabel}</button>}
        </form>
      )}
    </>
  );

  return (
    <Lesson
      title={title}
      steps={list}
      playback={playback}
      timeline={(st) => split(textOf(st.description)).title}
      onShuffle={onShuffle}
      shuffleLabel={shuffleLabel}
      controls={controls}
      complexity={complexity.map((c) => ({ label: c.label, value: c.value }))}
      stage={stage}
      narration={{
        tag: tag ?? (playback.index >= total - 1 ? "Done" : first ? "Idea" : "Step"),
        title: first && !body && blurb ? head : head,
        body: (
          <>
            {body && <p>{body}</p>}
            {first && blurb && <p>{blurb}</p>}
          </>
        ),
        notice,
      }}
      code={code ? { lines: code, active: codeLine, file: filename } : null}
      panels={stats.length ? [{ title: "Work done", rows: stats.map((s) => ({ label: s.label.charAt(0).toUpperCase() + s.label.slice(1), value: s.value })) }] : []}
    />
  );
};

export default StepperPage;
