import { ResetIcon, StepBackIcon, PlayIcon, PauseIcon, StepForwardIcon, ShuffleIcon } from "./icons";
import { highlight } from "./highlight";
import "./StepperPage.css";

// Generic page shell for step-through visualizers: header, a stage slot,
// highlighted code panel, playback controls and a stats row.

export const Chips = ({ label, items, active, onPick }) => (
  <div className="sp-chips">
    {label && <span className="sp-toolbar-label">{label}</span>}

    {items.map((item) => (
      <button
        key={item.id}
        className={`sp-chip ${active === item.id ? "sp-chip-active" : ""}`}
        onClick={() => onPick(item)}
        title={item.hint}
      >
        <b>{item.label ?? item.id}</b>
        {item.hint && <span>{item.hint}</span>}
      </button>
    ))}
  </div>
);

export const Segment = ({ label, options, value, onChange }) => (
  <div className="sp-segment-group">
    {label && <span className="sp-toolbar-label">{label}</span>}

    <div className="sp-segment">
      {options.map((o) => (
        <button
          key={o.id}
          className={`sp-segment-btn ${value === o.id ? "sp-segment-active" : ""}`}
          onClick={() => onChange(o.id)}
        >
          {o.label ?? o.id}
        </button>
      ))}
    </div>
  </div>
);

export const Variables = ({ items }) => (
  <div className="sp-vars">
    {items.map((v) => (
      <span key={v.label} className={v.tone ? `sp-var-${v.tone}` : ""}>
        {v.label} <b>{v.value}</b>
      </span>
    ))}
  </div>
);

const StepperPage = ({
  eyebrow,
  title,
  blurb,
  complexity,
  toolbar,
  stage,
  legend,
  status,
  filename,
  code,
  codeLine,
  playback,
  shuffleLabel,
  onShuffle,
  input,
  stats,
}) => {
  const { index, total, playing, speed, setSpeed } = playback;
  const canBack = playback.canBack ?? index > 0;
  const canForward = playback.canForward ?? index < total - 1;

  const submit = (e) => {
    e.preventDefault();
    input.onAction?.();
  };

  return (
    <div className="sp-wrapper">
      <div className="sp-page">
        <p className="sp-eyebrow">{eyebrow}</p>

        <h1 className="sp-title">{title}</h1>

        <div className="sp-header">
          <p className="sp-blurb">{blurb}</p>

          <div className="sp-complexity">
            {complexity.map((c) => (
              <div key={c.label}>
                <div className="sp-complexity-label">{c.label}</div>
                <div className={`sp-${c.tone}-value`}>{c.value}</div>
              </div>
            ))}
          </div>
        </div>

        {toolbar && <div className="sp-toolbar">{toolbar}</div>}

        <div className="sp-grid">
          <div className="sp-stage">
            {stage}

            {legend && legend.length > 0 && (
              <div className="sp-legend">
                {legend.map((item) => (
                  <span key={item.label}>
                    {item.mark ?? <i style={{ borderColor: item.stroke, background: item.fill }} />}
                    {item.label}
                  </span>
                ))}
              </div>
            )}

            <p className="sp-status">{status}</p>
          </div>

          <div className="sp-code-panel">
            <div className="sp-code-header">
              <div className="sp-dummy-btns">
                <span className="sp-red-btn"></span>
                <span className="sp-yellow-btn"></span>
                <span className="sp-green-btn"></span>
                <span className="sp-filename">{filename}</span>
              </div>

              <span className="sp-header-complexity">{complexity[0].value}</span>
            </div>

            <pre className="sp-code-block">
              {code.map((line, i) => (
                <div key={i} className={`sp-code-line ${codeLine === i + 1 ? "sp-code-line-active" : ""}`}>
                  <span className="sp-line-no">{i + 1}</span>
                  {highlight(line)}
                </div>
              ))}
            </pre>
          </div>
        </div>

        <div className="sp-controls">
          <button className="sp-icon-btn" onClick={playback.reset}>
            <ResetIcon />
          </button>

          <button className="sp-icon-btn" onClick={playback.stepBack} disabled={!canBack}>
            <StepBackIcon />
          </button>

          <button className="sp-play-btn" onClick={playback.togglePlay}>
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>

          <button className="sp-icon-btn" onClick={playback.stepForward} disabled={!canForward}>
            <StepForwardIcon />
          </button>

          {onShuffle && (
            <button className="sp-shuffle-btn" onClick={onShuffle}>
              <ShuffleIcon />
              {shuffleLabel}
            </button>
          )}

          {input && (
            <form className="sp-action" onSubmit={submit}>
              {input.label && <span className="sp-input-label">{input.label}</span>}
              <input
                className="sp-input"
                type="number"
                placeholder={input.placeholder}
                value={input.value}
                min={input.min}
                max={input.max}
                onChange={(e) => input.onChange(e.target.value)}
              />
              {input.actionLabel && (
                <button className="sp-action-btn" type="submit">
                  {input.actionLabel}
                </button>
              )}
            </form>
          )}

          <div className="sp-speed">
            <span>SPEED</span>
            <input type="range" min="1" max="10" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
          </div>

          <span className="sp-steps">
            {playback.prefix}
            {index + 1} / {total}
          </span>
        </div>

        <div className="sp-stats">
          {stats.map((s) => (
            <span key={s.label}>
              {s.label}: <b>{s.value}</b>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StepperPage;
