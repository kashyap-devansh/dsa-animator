import ArraySearchPage from "../ArraySearchPage";
import { EXPONENTIAL_CODE, exponentialSearchSteps } from "../searchSteps";

const IDEA = {
  title: "Double the bound, then binary search",
  body: "Check index 1, 2, 4, 8 and so on until the value there passes the target. That brackets the target between two powers of two, and a binary search inside that bracket finishes the job.",
  notice: "Useful when the row is huge or has no known end: the cost depends on where the target is, not on n.",
};

const ExponentialSearch = () => (
  <ArraySearchPage
    generate={exponentialSearchSteps}
    idea={IDEA}
    code={EXPONENTIAL_CODE}
    filename="exponential_search.cpp"
    complexity={[
      { label: "time", value: "O(log i)" },
      { label: "space", value: "O(1)" },
    ]}
  />
);

export default ExponentialSearch;
