const SearchingData = [
  {
    title: "Linear Search",
    complexity: "O(n)",
    description: "Scans each element one by one until the target is found.",
    slug: "linear-search",
    active: true,
  },
  {
    title: "Binary Search",
    complexity: "O(log n)",
    description: "Repeatedly halves a sorted array to locate the target.",
    slug: "binary-search",
    active: true,
  },
  {
    title: "Jump Search",
    complexity: "O(√n)",
    description: "Jumps ahead by fixed steps, then performs a linear scan.",
    slug: "jump-search",
    active: false,
  },
  {
    title: "Interpolation Search",
    complexity: "O(log log n)",
    description: "Estimates the target position in uniformly distributed data.",
    slug: "interpolation-search",
    active: false,
  },
  {
    title: "Exponential Search",
    complexity: "O(log n)",
    description: "Expands the search range exponentially before binary search.",
    slug: "exponential-search",
    active: false,
  },
  {
    title: "Fibonacci Search",
    complexity: "O(log n)",
    description: "Uses Fibonacci numbers to divide the search space efficiently.",
    slug: "fibonacci-search",
    active: false,
  },
];

export default SearchingData;
