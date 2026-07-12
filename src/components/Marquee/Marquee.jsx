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
    <div className="marquee">
      <div className="track">
        {
          [...items, ...items].map((item, index) => (
            <span key={index} className="item">
              {item}
            </span>
          ))
        }
      </div>
    </div>
  );
}

export default Marquee;
