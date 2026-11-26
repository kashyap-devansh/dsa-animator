// Brand mark: three offset isometric bars, like an array being sorted.
const Logo = ({ size = 34 }) => (
  <svg className="logo-mark" width={size} height={size} viewBox="0 0 34 34" aria-hidden="true">
    <rect width="34" height="34" rx="8" className="logo-bg" />
    <g strokeLinejoin="round" strokeWidth="1.3">
      <path d="M7 21.5 11 19.2 15 21.5 11 23.8Z" className="logo-top" />
      <path d="M7 21.5V25L11 27.3V23.8Z" className="logo-left" />
      <path d="M15 21.5V25L11 27.3V23.8Z" className="logo-right" />

      <path d="M13 15.5 17 13.2 21 15.5 17 17.8Z" className="logo-top" />
      <path d="M13 15.5V22.6L17 24.9V17.8Z" className="logo-left" />
      <path d="M21 15.5V22.6L17 24.9V17.8Z" className="logo-coral" />

      <path d="M19 9.5 23 7.2 27 9.5 23 11.8Z" className="logo-top" />
      <path d="M19 9.5V20L23 22.3V11.8Z" className="logo-left" />
      <path d="M27 9.5V20L23 22.3V11.8Z" className="logo-right" />
    </g>
  </svg>
);

export default Logo;
