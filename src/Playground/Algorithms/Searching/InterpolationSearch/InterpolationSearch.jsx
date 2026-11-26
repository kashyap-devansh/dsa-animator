import ArraySearchPage from "../ArraySearchPage";
import { INTERPOLATION_CODE, interpolationSearchSteps, uniformArray } from "../searchLessons";

const InterpolationSearch = () => (
  <ArraySearchPage
    generate={interpolationSearchSteps}
    size={12}
    makeArray={uniformArray}
    code={INTERPOLATION_CODE}
    filename="interpolation_search.cpp"
    complexity={[
      { label: "average", value: "O(log log n)" },
      { label: "worst", value: "O(n)" },
      { label: "space", value: "O(1)" },
    ]}
  />
);

export default InterpolationSearch;
