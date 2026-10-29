import { useParams } from "react-router-dom";
import CategoryGrid from "../../shared/CategoryGrid";
import HashingData from "./HashingData";
import HashTable from "./HashTable/HashTable";
import Chaining from "./Chaining/Chaining";
import Probing from "./Probing/Probing";
import "./Hashing.css";

const Hashing = () => {
  const { slug } = useParams();

  if (slug === "hash-table") {
    return <HashTable />;
  }
  if (slug === "chaining") {
    return <Chaining />;
  }
  if (slug === "probing") {
    return <Probing />;
  }

  return (
    <CategoryGrid
      wrapperClass="hashing"
      eyebrowClass="hashing-eyebrow"
      eyebrowText="hashing"
      gridClass="hashing-grid"
      cardClass="hashing-card"
      items={HashingData}
      basePath="/playground/hashing"
    />
  )
}

export default Hashing
