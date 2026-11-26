import { useId } from "react";

// The faint isometric floor grid behind every diagram.
const StageGrid = () => {
  const id = useId().replace(/:/g, "");
  const w = 40;
  const h = 20;

  return (
    <svg className="lx-grid" aria-hidden="true">
      <defs>
        <pattern id={`${id}-g`} width={w} height={h} patternUnits="userSpaceOnUse">
          <path d={`M0 0 L${w} ${h} M${w} 0 L0 ${h}`} />
        </pattern>
        <radialGradient id={`${id}-f`} cx="50%" cy="48%" r="62%">
          <stop offset="0%" stopColor="#fff" stopOpacity="1" />
          <stop offset="70%" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id={`${id}-m`}>
          <rect width="100%" height="100%" fill={`url(#${id}-f)`} />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id}-g)`} mask={`url(#${id}-m)`} />
    </svg>
  );
};

export default StageGrid;
