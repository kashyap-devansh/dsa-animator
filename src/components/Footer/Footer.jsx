import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">

        <div className="footer-top">

          <div className="footer-brand">
            <h2>
              DSA<span>/</span>ANIMATOR
            </h2>

            <p>
              A visual lab for the algorithms and data
              structures that run underneath every serious
              codebase.
            </p>
          </div>

          <div className="footer-links">

            <div className="footer-column">
              <h4>VISUALIZERS</h4>

              <Link to="/playground">Sorting</Link>
              <Link to="/playground">Searching & Trees</Link>
              <Link href="/playground">Graphs</Link>
              <Link href="/playground">Dynamic Programming</Link>
            </div>

            <div className="footer-column">
              <h4>LAB</h4>

              <a href="/#gallery">Gallery</a>
              <Link to="/notes">Notes</Link>
              <a href="/#manifesto">Manifesto</a>
              <a href="/#visualizers">Visualizers</a>
            </div>

            <div className="footer-column">
              <h4>CONNECT</h4>

              <a href="https://github.com/kashyap-devansh">GitHub</a>
              <a href="mailto:devansh14007@gmail.com">Gmail</a>
              <a href="https://instagram.com/x.__devansh__.x">Instagram</a>
              <a href="tel:+919315858470">Phone Number</a>
            </div>

          </div>

        </div>

        <div className="footer-divider"></div>

        <div className="footer-bottom">
          <p>© 2026 DSA Animator. All frames rendered.</p>

          <p>Made by <span>Devansh Kashyap</span></p>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
