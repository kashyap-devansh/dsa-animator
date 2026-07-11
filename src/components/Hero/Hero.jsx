import { useEffect, useState } from "react";
import "./Hero.css";

const PHRASES = [
  "Watch Algorithms Think.",
  "See Complexity Unfold.",
  "Feel The Recursion.",
];

const Hero = () => {
  const [text, setText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = PHRASES[phraseIndex];

    let timeout;

    if (!isDeleting && text.length < current.length) {
      timeout = setTimeout(() => {
        setText(current.slice(0, text.length + 1));
      }, 80);
    } else if (!isDeleting && text.length === current.length) {
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, 1800);
    } else if (isDeleting && text.length > 0) {
      timeout = setTimeout(() => {
        setText(current.slice(0, text.length - 1));
      }, 40);
    } else if (isDeleting && text.length === 0) {
      setIsDeleting(false);
      setPhraseIndex((prev) => (prev + 1) % PHRASES.length);
    }

    return () => clearTimeout(timeout);
  }, [text, isDeleting, phraseIndex]);

  return (
    <section className="hero">
      <div className="hero__grid" />

      <div className="hero__content">
        <span className="hero__tag">
          O(1) TO O(n²) — VISUALIZED
        </span>

        <h1 className="hero__title">
          <span className="typing">{text}</span>
        </h1>

        <p className="hero__description">
          A precision lab for sorting, searching, tree and graph algorithms —
          every comparison, swap and traversal rendered frame by frame.
        </p>
      </div>
    </section>
  );
}

export default Hero;
