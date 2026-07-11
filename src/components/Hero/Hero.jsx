import "./Hero.css";

const PHRASES = [
  "Watch Algorithms Think.",
  "See Complexity Unfold.",
  "Feel The Recursion.",
];

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero__grid" />

      <div className="hero__content">
        <span className="hero__tag">
          O(1) TO O(n²) — VISUALIZED
        </span>

        <h1 className="hero__title">
          {PHRASES[1]}
        </h1>

        <p className="hero__description">
          A precision lab for sorting, searching, tree and graph algorithms —
          every comparison, swap and traversal rendered frame by frame.
        </p>
      </div>
    </section>
  );
}
