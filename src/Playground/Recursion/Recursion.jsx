import { useParams } from "react-router-dom";
import CategoryGrid from "../shared/CategoryGrid";
import RecursionData from "./RecursionData";
import HanoiTower from "./TowerOfHanoi/TowerOfHanoi.jsx";
import Factorial from "./Factorial/Factorial.jsx";
import FibonacciSequence from "./FibonacciSequence/FibonacciSequence.jsx";
import Permutations from "./Permutations/Permutations.jsx";
import SubsetSum from "./SubsetSum/SubsetSum.jsx";
import NQueens from "./NQueens/NQueens.jsx";
import "./Recursion.css";

const Recursion = () => {
  const { slug } = useParams();

  if (slug === "tower-of-hanoi") {
    return <HanoiTower />
  }

  if (slug === "factorial") {
    return <Factorial />
  }

  if (slug === "fibonacci-sequence") {
    return <FibonacciSequence />
  }

  if (slug === "permutations") {
    return <Permutations />
  }

  if (slug === "subset-sum") {
    return <SubsetSum />
  }

  if (slug === "n-queens") {
    return <NQueens />
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
