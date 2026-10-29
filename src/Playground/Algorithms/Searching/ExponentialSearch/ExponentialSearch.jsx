import ArraySearchPage from "../ArraySearchPage";
import { EXPONENTIAL_CODE, exponentialSearchSteps } from "../searchSteps";

const ExponentialSearch = () => (
  <ArraySearchPage
    generate={exponentialSearchSteps}
    title="Exponential Search"
    blurb="Double a bound — 1, 2, 4, 8… — until it passes the target, then binary search the range it just jumped over."
    complexity={[
      { label: "time", value: "O(log n)", tone: "time" },
      { label: "space", value: "O(1)", tone: "space" },
    ]}
    filename="exponential_search.cpp"
    code={EXPONENTIAL_CODE}
  />
);

export default ExponentialSearch;
