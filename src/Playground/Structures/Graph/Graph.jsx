import { useParams } from "react-router-dom";
import CategoryGrid from "../../shared/CategoryGrid";
import GraphData from "./GraphData.js";
import { AdjacencyMatrix, AdjacencyList, BFS, DFS, Dijkstra } from "./graphLessons.jsx";

const LESSONS = {
  "adjacency-matrix": AdjacencyMatrix,
  "adjacency-list": AdjacencyList,
  bfs: BFS,
  dfs: DFS,
  dijkstra: Dijkstra,
};

const Graph = () => {
  const { slug } = useParams();
  const Page = LESSONS[slug];
  if (Page) return <Page />;

  return (
    <CategoryGrid
      wrapperClass="bst-ui"
      eyebrowClass="bst-ui-eyebrow"
      eyebrowText="Graphs"
      gridClass="bst-ui-grid"
      cardClass="bst-ui-card"
      items={GraphData}
      basePath="/playground/graph"
    />
  );
};

export default Graph;
