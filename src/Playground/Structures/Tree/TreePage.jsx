import StepperPage, { Chips, Segment } from "../../shared/StepperPage";
import TreeStage from "./TreeStage";
import { ROLE_STYLE } from "./roleStyle";

const LEGEND_LABELS = {
  active: "comparing",
  path: "visited",
  new: "new / updated",
  found: "found",
  remove: "removing",
  pivot: "unbalanced",
  rotate: "rotating",
  successor: "successor",
};

const START_MODES = [
  { id: "empty", label: "empty" },
  { id: "small", label: "small tree" },
];

const TreePage = ({
  eyebrow,
  title,
  blurb,
  complexity,
  filename,
  code,
  run,
  showBalance = false,
  legend,
  scenarios,
  activeScenario,
  onScenario,
  scenarioLabel,
  shuffleLabel,
  onShuffle,
  inputValue,
  onInputChange,
  actionLabel,
  onAction,
  stats,
  doneMessage,
  startMode,
  onStartMode,
}) => {
  const { current, steps, index, playing, speed, setSpeed, bounds } = run;

  const toolbar = (scenarios || onStartMode) && (
    <>
      {scenarios && <Chips label={scenarioLabel} items={scenarios} active={activeScenario} onPick={onScenario} />}
      {onStartMode && <Segment label="start from" options={START_MODES} value={startMode} onChange={onStartMode} />}
    </>
  );

  const legendItems = [
    ...legend.map((role) => ({ label: LEGEND_LABELS[role], stroke: ROLE_STYLE[role].stroke, fill: ROLE_STYLE[role].fill })),
    ...(showBalance ? [{ label: "balance factor", mark: <em>+1</em> }] : []),
  ];

  return (
    <StepperPage
      eyebrow={eyebrow}
      title={title}
      blurb={blurb}
      complexity={complexity}
      toolbar={toolbar}
      stage={<TreeStage step={current} bounds={bounds} speed={speed} showBalance={showBalance} />}
      legend={legendItems}
      status={
        <>
          {current.description}
          {run.finished && doneMessage && <span className="sp-done"> · {doneMessage}</span>}
        </>
      }
      filename={filename}
      code={code}
      codeLine={current.codeLine}
      playback={{
        index,
        total: steps.length,
        playing,
        speed,
        setSpeed,
        reset: run.reset,
        stepBack: run.stepBack,
        stepForward: run.stepForward,
        togglePlay: run.togglePlay,
        canBack: run.canBack,
        canForward: run.canForward,
        prefix: run.opNumber > 1 && `op ${run.opNumber} · `,
      }}
      shuffleLabel={shuffleLabel}
      onShuffle={onShuffle}
      input={{ value: inputValue, onChange: onInputChange, placeholder: "key", actionLabel, onAction }}
      stats={stats}
    />
  );
};

export default TreePage;
