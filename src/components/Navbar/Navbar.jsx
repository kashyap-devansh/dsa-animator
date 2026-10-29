import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { openPalette } from "../CommandPalette/palette";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={
        `navbar ${scrolled ? "scrolled" : ""}`
      }
    >
      <div className="navbar-container">
        <Link
          className="logo"
          to="/"
        >
          DSA<span>/</span>ANIMATOR
        </Link>

        <input
          type="checkbox"
          id="nav-toggle"
          className="nav-toggle-checkbox"
        />

        <label
          htmlFor="nav-toggle"
          className="nav-toggle"
        >
          <span></span>
          <span></span>
          <span></span>
        </label>

        <nav>
          <Link to="/playground">Playground</Link>
          <Link to="/notes">Notes</Link>
          <Link to="/classroom">For faculty</Link>
          <a href="/#gallery">Gallery</a>

          <button
            className="launch-btn mobile-launch-btn"
            onClick={() => navigate("/playground")}
          >
            Launch App
          </button>
        </nav>

        <div className="nav-actions desktop-btn">
        <button type="button" className="nav-search" onClick={openPalette} aria-label="Search">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          Search
          <kbd>{navigator.platform?.startsWith("Mac") ? "⌘" : "Ctrl"} K</kbd>
        </button>

        <button
          className="launch-btn"
          onClick={() => navigate("/playground")}
        >
          Launch App
        </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
