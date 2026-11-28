import { useParams } from "react-router-dom";
import CategoryGrid from "../../shared/CategoryGrid";
import RBTData from "./RBTData.js";
import { RBInsertion, RBDeletion } from "./rbtLessons.jsx";

const RBT = () => {
  const { slug } = useParams();
  if (slug === "insertion") return <RBInsertion />;
  if (slug === "deletion") return <RBDeletion />;

  return (
    <CategoryGrid
      wrapperClass="bst-ui"
      eyebrowClass="bst-ui-eyebrow"
      eyebrowText="Red-Black Tree"
      gridClass="bst-ui-grid"
      cardClass="bst-ui-card"
      items={RBTData}
      basePath="/playground/rbt"
    />
  );
};

export default RBT;
