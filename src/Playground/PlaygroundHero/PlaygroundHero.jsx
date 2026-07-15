import "./PlaygroundHero.css";
import Sorting from "../Algorithms/Sorting/Sorting.jsx";
import Searching from "../Algorithms/Searching/Searching.jsx";

const Playground = () => {
  return (
    <section className="playground">
      <div className="playground-content">
        <p className="playground-eyebrow">
          THE PLAYGROUND
        </p>

        <h1 className="playground-title">
          Every structure. Every
          <br />
          algorithm. Rendered.
        </h1>

        <p className="playground-description">
          Real code, real execution — step forward, step back, or press play.
          Pick one below.
        </p>

        <Sorting />
        <Searching />
      </div>
    </section>
  );
};

export default Playground;
