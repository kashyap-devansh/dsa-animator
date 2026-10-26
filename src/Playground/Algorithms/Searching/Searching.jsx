import { useParams } from "react-router-dom";
import CategoryGrid from "../../shared/CategoryGrid";
import SearchingData from "./SearchingData";
import LinearSearch from "./LinearSearch/LinearSearch";
import BinarySearch from "./BinarySearch/BinarySearch";
import "./Searching.css";

const Searching = () => {
  const { slug } = useParams();

  if (slug === "linear-search") {
    return <LinearSearch />;
  }
  if (slug === "binary-search") {
    return <BinarySearch />;
  }

  return (
    <CategoryGrid
      wrapperClass="searching"
      eyebrowClass="searching-eyebrow"
      eyebrowText="searching"
      gridClass="searching-grid"
      cardClass="searching-card"
      items={SearchingData}
      basePath="/playground/searching"
    />
  )
}

export default Searching
