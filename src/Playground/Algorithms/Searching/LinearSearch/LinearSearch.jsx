import ArraySearchPage from "../ArraySearchPage";
import { LINEAR_CODE, linearSearchSteps } from "../searchLessons";
import { randomArray } from "../../../shared/randomArray";

const unsortedRow = (n) => [...new Set(randomArray(n * 2))].slice(0, n);

const LinearSearch = () => (
  <ArraySearchPage
    generate={linearSearchSteps}
    size={10}
    makeArray={unsortedRow}
    code={LINEAR_CODE}
    filename="linear_search.cpp"
    complexity={[
      { label: "time", value: "O(n)" },
      { label: "space", value: "O(1)" },
    ]}
  />
);

export default LinearSearch;
