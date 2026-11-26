import ArraySearchPage from "../ArraySearchPage";
import { FIBONACCI_CODE, fibonacciSearchSteps } from "../searchSteps";

const IDEA = {
  title: "Split by Fibonacci numbers",
  body: "Like binary search, but the row is cut at Fibonacci-sized pieces instead of halves. Each probe drops either the smaller or the larger piece, and the next Fibonacci numbers say where to look next.",
  notice: "It only needs addition and subtraction to find each probe, no division.",
};

const FibonacciSearch = () => (
  <ArraySearchPage
    generate={fibonacciSearchSteps}
    idea={IDEA}
    code={FIBONACCI_CODE}
    filename="fibonacci_search.cpp"
    complexity={[
      { label: "time", value: "O(log n)" },
      { label: "space", value: "O(1)" },
    ]}
  />
);

export default FibonacciSearch;
