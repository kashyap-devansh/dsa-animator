import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
        <div className="logo">
          DSA<span>/</span>ANIMATOR
        </div>

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
          <a href="/">Visualizers</a>
          <a href="/">Gallery</a>
          <a href="/">Manifesto</a>
          <Link to="/notes">Notes</Link>

          <button
            className="launch-btn mobile-launch-btn"
            onClick={() => navigate("/playground")}
          >
            Launch App
          </button>
        </nav>

        <button
          className="launch-btn desktop-btn"
          onClick={() => navigate("/playground")}
        >
          Launch App
        </button>
      </div>
    </header>
  );
}

export default Navbar;
