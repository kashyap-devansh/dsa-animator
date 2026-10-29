import "./PlaygroundHero.css";
import AlgorithmSearch from "../shared/AlgorithmSearch.jsx";
import { Reveal } from "../../components/shared/effects";
import Showcase from "./Showcase.jsx";
import CategoryNav from "./CategoryNav.jsx";
import Sorting from "../Algorithms/Sorting/Sorting.jsx";
import Searching from "../Algorithms/Searching/Searching.jsx";
import Hashing from "../Algorithms/Hashing/Hashing.jsx";
import ArrayStructure from "../Structures/Array/Array.jsx";
import LinkedList from "../Structures/LinkedList/LinkedList.jsx";
import Stack from "../Structures/Stack/Stack.jsx";
import Queue from "../Structures/Queue/Queue.jsx";
import BST from "../Structures/BST/BST.jsx";
import AVL from "../Structures/AVL/AVL.jsx";
import Recursion from "../Recursion/Recursion.jsx";

const Playground = () => {
  return (
    <section className="playground">
      <div className="playground-content">
        <div className="playground-intro">
          <Reveal className="playground-intro-text">
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
          </Reveal>

          <Reveal delay={0.15} className="playground-intro-showcase">
            <Showcase />
          </Reveal>
        </div>

        <CategoryNav />

        <Sorting />
        <Searching />
        <Hashing />
        <ArrayStructure />
        <LinkedList />
        <Stack />
        <Queue />
        <BST />
        <AVL />
        <Recursion />
      </div>
    </section>
  );
};

export default Playground;
