import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
    <header className={
      `navbar ${scrolled ? "scrolled" : ""}`
    }>
      <div className="navbar-container">
        <div className="logo">
          DSA<span>/</span>ANIMATOR
        </div>

        <nav>
          <a href="/">Visualizers</a>
          <a href="/">Gallery</a>
          <a href="/">Manifesto</a>
          <a href="/">Notes</a>
        </nav>

        <button
          className="launch-btn"
          onClick={() => navigate("/playground")}
        >
          Launch App
        </button>
      </div>
    </header>
  );
}

export default Navbar;
