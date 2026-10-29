const BSTData = [
  {
    title: "Insertion",
    complexity: "O(log n)",
    description: "Walks left or right by comparison until it finds an empty spot for the new leaf.",
    slug: "insertion",
    active: true,
  },
  {
    title: "Search",
    complexity: "O(log n)",
    description: "Halves the search space at every node by following the ordering property.",
    slug: "search",
    active: true,
  },
  {
    title: "Deletion",
    complexity: "O(log n)",
    description: "Removes a leaf, a node with one child, or swaps in the inorder successor.",
    slug: "deletion",
    active: true,
  },
];

export default BSTData;
