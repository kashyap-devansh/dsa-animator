import { Link, NavLink, useLocation } from "react-router-dom";
import { BookOpen, NotebookText, Presentation, ChartNoAxesColumn, Search, Moon, Sun, PanelLeft } from "lucide-react";
import { openPalette } from "../components/CommandPalette/palette";
import { useTheme } from "../course/store";
import { FIRST_LESSON } from "../course/course";
import Logo from "./Logo";
import "./Shell.css";

const TABS = [
  { to: FIRST_LESSON, match: "/playground", label: "Learn", icon: BookOpen },
  { to: "/notes", match: "/notes", label: "Notes", icon: NotebookText },
  { to: "/classroom", match: "/classroom", label: "Teach", icon: Presentation },
  { to: "/progress", match: "/progress", label: "Progress", icon: ChartNoAxesColumn },
];

const TopNav = ({ onMenu }) => {
  const { pathname } = useLocation();
  const { theme, toggle } = useTheme();

  return (
    <header className="tn">
      {onMenu && (
        <button className="tn-icon tn-menu" onClick={onMenu} aria-label="Show course outline">
          <PanelLeft size={18} />
        </button>
      )}

      <Link to="/" className="tn-brand" aria-label="DSA Animator home">
        <Logo />
        <span className="tn-brand-name">
          DSA <b>Animator</b>
        </span>
      </Link>

      <nav className="tn-tabs" aria-label="Sections">
        {TABS.map(({ to, match, label, icon: Icon }) => {
          const active = pathname.startsWith(match) || (match === "/playground" && pathname === "/learn");
          return (
            <NavLink key={label} to={to} className={`tn-tab ${active ? "tn-tab-on" : ""}`}>
              <Icon size={18} strokeWidth={1.9} />
              <span>{label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="tn-tools">
        <button className="tn-search" onClick={openPalette}>
          <Search size={17} />
          <span className="tn-search-text">Search lessons…</span>
          <span className="ui-kbd tn-search-kbd">Ctrl K</span>
        </button>

        <button className="tn-icon" onClick={toggle} aria-label={theme === "dark" ? "Use light theme" : "Use dark theme"}>
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <a className="tn-icon tn-gh" href="https://github.com/kashyap-devansh" target="_blank" rel="noreferrer" aria-label="Devansh Kashyap on GitHub">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.39-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
          </svg>
        </a>
      </div>
    </header>
  );
};

export default TopNav;
