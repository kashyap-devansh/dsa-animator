import { useParams } from "react-router-dom";
import CategoryGrid from "../shared/CategoryGrid";
import RecursionData from "./RecursionData";
import HanoiTower from "./TowerOfHanoi/TowerOfHanoi.jsx";
import "./Recursion.css";

const Recursion = () => {
  const { slug } = useParams();

  if (slug === "tower-of-hanoi") {
    return <HanoiTower />
  }

  return (
    <CategoryGrid
      wrapperClass="recursion"
      eyebrowClass="recursion-eyebrow"
      eyebrowText="recursion"
      gridClass="recursion-grid"
      cardClass="recursion-card"
      items={RecursionData}
      basePath="/playground/recursion"
    />
  )
}

export default Recursion
