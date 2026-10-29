import { useParams } from "react-router-dom";
import CategoryGrid from "../../shared/CategoryGrid";
import ArrayData from "./ArrayData.js";
import Insert from "./Insert/Insert.jsx";
import Delete from "./Delete/Delete.jsx";
import Traverse from "./Traverse/Traverse.jsx";
import "./Array.css";

const ArrayStructure = () => {
  const { slug } = useParams();

  if (slug === "insert") {
    return <Insert />
  }

  if (slug === "delete") {
    return <Delete />
  }

  if (slug === "traverse") {
    return <Traverse />
  }

  return (
    <CategoryGrid
      wrapperClass="array-ui"
      eyebrowClass="array-ui-eyebrow"
      eyebrowText="Array"
      gridClass="array-ui-grid"
      cardClass="array-card"
      items={ArrayData}
      basePath="/playground/array"
    />
  );
};

export default ArrayStructure;
