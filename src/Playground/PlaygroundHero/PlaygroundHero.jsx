import "./PlaygroundHero.css";
import AlgorithmSearch from "../shared/AlgorithmSearch.jsx";
import Sorting from "../Algorithms/Sorting/Sorting.jsx";
import Searching from "../Algorithms/Searching/Searching.jsx";
import Hashing from "../Algorithms/Hashing/Hashing.jsx";
import ArrayStructure from "../Structures/Array/Array.jsx";
import LinkedList from "../Structures/LinkedList/LinkedList.jsx";
import Stack from "../Structures/Stack/Stack.jsx";
import Queue from "../Structures/Queue/Queue.jsx";
import Recursion from "../Recursion/Recursion.jsx";

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

        <AlgorithmSearch />

        <Sorting />
        <Searching />
        <Hashing />
        <ArrayStructure />
        <LinkedList />
        <Stack />
        <Queue />
        <Recursion />
      </div>
    </section>
  );
};

export default Playground;
