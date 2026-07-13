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

              <a href="/">Sorting</a>
              <a href="/">Searching & Trees</a>
              <a href="/">Graphs</a>
              <a href="/">Dynamic Programming</a>
            </div>

            <div className="footer-column">
              <h4>LAB</h4>

              <a href="/">Gallery</a>
              <a href="/">Notes</a>
              <a href="/">Manifesto</a>
              <a href="/">Changelog</a>
            </div>

            <div className="footer-column">
              <h4>CONNECT</h4>

              <a href="/">GitHub</a>
              <a href="/">Discord</a>
              <a href="/">Twitter / X</a>
            </div>

          </div>

        </div>

        <div className="footer-divider"></div>

        <div className="footer-bottom">
          <p>© 2026 DSA Animator. All frames rendered.</p>

          <a href="mailto:hello@dsaanimator.dev">
            hello@dsaanimator.dev
          </a>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
