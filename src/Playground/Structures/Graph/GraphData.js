const GraphData = [
  {
    title: "Adjacency Matrix",
    complexity: "O(V²)",
    description: "A V × V grid where cell [u][v] says whether u and v are joined: O(1) lookups, V² space.",
    slug: "adjacency-matrix",
    active: true,
  },
  {
    title: "Adjacency List",
    complexity: "O(V + E)",
    description: "One list of neighbours per vertex: only the edges that exist are stored.",
    slug: "adjacency-list",
    active: true,
  },
  {
    title: "Breadth-First Search",
    complexity: "O(V + E)",
    description: "Explores ring by ring with a queue, finding the fewest-edges path to every vertex.",
    slug: "bfs",
    active: true,
  },
  {
    title: "Depth-First Search",
    complexity: "O(V + E)",
    description: "Goes as deep as it can along one path, then backtracks, with the call stack as its memory.",
    slug: "dfs",
    active: true,
  },
  {
    title: "Dijkstra's Algorithm",
    complexity: "O((V + E) log V)",
    description: "Shortest paths on weighted graphs: always settle the closest unfinished vertex next.",
    slug: "dijkstra",
    active: true,
  },
];

export default GraphData;
