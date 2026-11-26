import ArraySearchPage from "../ArraySearchPage";
import { BINARY_CODE, binarySearchSteps } from "../searchLessons";

const BinarySearch = () => (
  <ArraySearchPage
    generate={binarySearchSteps}
    size={12}
    code={BINARY_CODE}
    filename="binary_search.cpp"
    complexity={[
      { label: "time", value: "O(log n)" },
      { label: "space", value: "O(1)" },
    ]}
  />
);

export default BinarySearch;
