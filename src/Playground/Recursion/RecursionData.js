const RecursionData = [
  {
    title: "Tower of Hanoi",
    complexity: "O(2^n)",
    description: "Moves a stack of disks between pegs, one at a time, using a spare peg as a stepping stone.",
    slug: "tower-of-hanoi",
    active: true,
  },
  {
    title: "Factorial",
    complexity: "O(n)",
    description: "Multiplies a number by the factorial of everything smaller than it.",
    slug: "factorial",
    active: false,
  },
  {
    title: "Fibonacci Sequence",
    complexity: "O(2^n)",
    description: "Computes each term as the sum of the two terms before it.",
    slug: "fibonacci-sequence",
    active: false,
  },
  {
    title: "Permutations",
    complexity: "O(n!)",
    description: "Builds every possible ordering of a set by swapping elements into each position.",
    slug: "permutations",
    active: false,
  },
  {
    title: "Subset Sum",
    complexity: "O(2^n)",
    description: "Explores every include-or-exclude choice to find a subset matching a target sum.",
    slug: "subset-sum",
    active: false,
  },
  {
    title: "N-Queens",
    complexity: "O(n!)",
    description: "Places queens row by row, backtracking whenever two queens threaten each other.",
    slug: "n-queens",
    active: false,
  },
];

export default RecursionData;
