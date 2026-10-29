import MarqueeTrack from "../shared/MarqueeTrack";
import "./Marquee.css";

const items = [
  "QUICKSORT",
  "MERGE SORT",
  "BINARY SEARCH",
  "AVL ROTATIONS",
  "N-QUEENS",
  "HASH TABLES",
  "RADIX SORT",
  "TOWER OF HANOI",
  "LINKED LISTS",
  "BACKTRACKING",
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
