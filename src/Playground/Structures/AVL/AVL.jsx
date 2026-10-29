import { useParams } from "react-router-dom";
import CategoryGrid from "../../shared/CategoryGrid";
import AVLData from "./AVLData.js";
import AVLInsertion from "./Insertion/AVLInsertion.jsx";
import AVLDeletion from "./Deletion/AVLDeletion.jsx";
import "./AVL.css";

const AVL = () => {
  const { slug } = useParams();

  if (slug === "insertion") {
    return <AVLInsertion />
  }

  if (slug === "deletion") {
    return <AVLDeletion />
  }

  return (
    <CategoryGrid
      wrapperClass="avl-ui"
      eyebrowClass="avl-ui-eyebrow"
      eyebrowText="AVL Tree"
      gridClass="avl-ui-grid"
      cardClass="avl-ui-card"
      items={AVLData}
      basePath="/playground/avl"
    />
  );
};

export default AVL;
