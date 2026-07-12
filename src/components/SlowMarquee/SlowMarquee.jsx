import "./SlowMarquee.css";

const items = [
  "arrays",
  "stacks",
  "queues",
  "trees",
  "graphs",
  "heaps",
  "hash",
  "pointers",
  "recursion",
];

const SlowMarquee = () => {
  return (
    <div className="slowMarquee">
      <div className="track-slow">
        {
          [...items, ...items].map((item, index) => (
            <span key={index} className="item-slow">
              {item}
            </span>
          ))
        }
      </div>
    </div>
  );
}

export default SlowMarquee;
