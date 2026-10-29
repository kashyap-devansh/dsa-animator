import MarqueeTrack from "../shared/MarqueeTrack";
import "./SlowMarquee.css";

const items = [
  "arrays",
  "stacks",
  "queues",
  "trees",
  "hashing",
  "searching",
  "sorting",
  "pointers",
  "recursion",
];

const SlowMarquee = () => {
  return (
    <MarqueeTrack
      items={items}
      wrapperClass="slowMarquee"
      trackClass="track-slow"
      itemClass="item-slow"
    />
  );
}

export default SlowMarquee;
