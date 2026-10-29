import { useParams } from "react-router-dom";
import CategoryGrid from "../../shared/CategoryGrid";
import BSTData from "./BSTData.js";
import BSTInsert from "./Insert/BSTInsert.jsx";
import BSTSearch from "./Search/BSTSearch.jsx";
import BSTDelete from "./Delete/BSTDelete.jsx";
import "./BST.css";

const BST = () => {
  const { slug } = useParams();

  if (slug === "insertion") {
    return <BSTInsert />
  }

  if (slug === "search") {
    return <BSTSearch />
  }

  if (slug === "deletion") {
    return <BSTDelete />
  }

  return (
    <CategoryGrid
      wrapperClass="bst-ui"
      eyebrowClass="bst-ui-eyebrow"
      eyebrowText="Binary Search Tree"
      gridClass="bst-ui-grid"
      cardClass="bst-ui-card"
      items={BSTData}
      basePath="/playground/bst"
    />
  );
};

export default BST;
