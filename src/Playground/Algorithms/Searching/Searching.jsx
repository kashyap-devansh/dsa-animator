import { useParams } from "react-router-dom";
import CategoryGrid from "../../shared/CategoryGrid";
import SearchingData from "./SearchingData";
import LinearSearch from "./LinearSearch/LinearSearch";
import BinarySearch from "./BinarySearch/BinarySearch";
import InterpolationSearch from "./InterpolationSearch/InterpolationSearch";
import MedianSearch from "./MedianSearch/MedianSearch";
import JumpSearch from "./JumpSearch/JumpSearch";
import ExponentialSearch from "./ExponentialSearch/ExponentialSearch";
import FibonacciSearch from "./FibonacciSearch/FibonacciSearch";
import "./Searching.css";

const Searching = () => {
  const { slug } = useParams();

  if (slug === "linear-search") {
    return <LinearSearch />;
  }
  if (slug === "binary-search") {
    return <BinarySearch />;
  }
  if (slug === "interpolation-search") {
    return <InterpolationSearch />;
  }
  if (slug === "median-search") {
    return <MedianSearch />;
  }
  if (slug === "jump-search") {
    return <JumpSearch />;
  }
  if (slug === "exponential-search") {
    return <ExponentialSearch />;
  }
  if (slug === "fibonacci-search") {
    return <FibonacciSearch />;
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
