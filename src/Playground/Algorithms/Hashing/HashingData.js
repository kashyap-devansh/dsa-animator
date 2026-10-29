const HashingData = [
  {
    title: "Hash Table",
    complexity: "O(1)",
    description: "Maps keys to array slots using a hash function for near-constant time access.",
    slug: "hash-table",
    active: true,
  },
  {
    title: "Chaining",
    complexity: "O(1 + α)",
    description: "Resolves collisions by storing multiple keys in a linked list at each slot.",
    slug: "chaining",
    active: true,
  },
  {
    title: "Probing",
    complexity: "O(1)",
    description: "Resolves collisions by linearly searching for the next open slot in the table.",
    slug: "probing",
    active: true,
  },
];

export default HashingData;
