import MarqueeTrack from "../shared/MarqueeTrack";
import "./Marquee.css";

const items = [
  "GRAPH TRAVERSAL",
  "QUICKSORT",
  "MERGE SORT",
  "BINARY SEARCH",
  "DIJKSTRA",
  "BFS",
  "DFS",
  "AVL TREES",
  "HEAPS",
  "HASH MAPS",
];

const Marquee = () => {
  return (
    <MarqueeTrack
      items={items}
      wrapperClass="marquee"
      trackClass="track"
      itemClass="item"
    />
  );
}

export default Marquee;
