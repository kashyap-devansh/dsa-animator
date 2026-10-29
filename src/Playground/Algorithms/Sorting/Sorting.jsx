import { useParams } from "react-router-dom";
import CategoryGrid from "../../shared/CategoryGrid";
import SortingData from "./SortingData.js";
import BubbleSort from "./BubbleSort/BubbleSort.jsx";
import SelectionSort from "./SelectionSort/SelectionSort.jsx";
import InsertionSort from "./InsertionSort/InsertionSort.jsx";
import MergeSort from "./MergeSort/MergeSort.jsx";
import QuickSort from "./QuickSort/QuickSort.jsx";
import RadixSort from "./RadixSort/RadixSort.jsx";
import BucketSort from "./BucketSort/BucketSort.jsx";
import CountSort from "./CountSort/CountSort.jsx";
import "./Sorting.css";

const Sorting = () => {
  const { slug } = useParams();

  if (slug === "bubble-sort") {
    return <BubbleSort />;
  }
  else if (slug === "selection-sort") {
    return <SelectionSort />
  }
  else if (slug === "insertion-sort") {
    return <InsertionSort />
  }
  else if (slug === "merge-sort") {
    return <MergeSort />
  }
  else if (slug === "quick-sort") {
    return <QuickSort />
  }
  else if (slug === "radix-sort") {
    return <RadixSort />
  }
  else if (slug === "bucket-sort") {
    return <BucketSort />
  }
  else if (slug === "count-sort") {
    return <CountSort />
  }

  return (
    <CategoryGrid
      wrapperClass="sorting"
      eyebrowClass="sorting-eyebrow"
      eyebrowText="SORTING"
      gridClass="sorting-grid"
      cardClass="sorting-card"
      items={SortingData}
      basePath="/playground/sorting"
    />
  );
};

export default Sorting;
