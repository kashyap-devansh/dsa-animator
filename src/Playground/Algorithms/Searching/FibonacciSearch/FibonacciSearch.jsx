import ArraySearchPage from "../ArraySearchPage";
import { FIBONACCI_CODE, fibonacciSearchSteps } from "../searchSteps";

const FibonacciSearch = () => (
  <ArraySearchPage
    generate={fibonacciSearchSteps}
    title="Fibonacci Search"
    blurb="Split the range at Fibonacci-sized offsets instead of halves — only additions and subtractions, no division."
    complexity={[
      { label: "time", value: "O(log n)", tone: "time" },
      { label: "space", value: "O(1)", tone: "space" },
    ]}
    filename="fibonacci_search.cpp"
    code={FIBONACCI_CODE}
  />
);

export default FibonacciSearch;
