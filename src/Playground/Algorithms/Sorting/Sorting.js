const Sorting = [
  {
    title: "Bubble Sort",
    complexity: "O(n²)",
    description: "Adjacent swaps bubble the largest value to the end each pass.",
    slug: "bubble-sort",
  },
  {
    title: "Selection Sort",
    complexity: "O(n²)",
    description: "Repeatedly selects the minimum of the unsorted tail.",
    slug: "selection-sort",
  },
  {
    title: "Insertion Sort",
    complexity: "O(n²)",
    description: "Grows a sorted prefix by inserting each element into place",
    slug: "insertion-sort",
  },
  {
    title: "Merge Sort",
    complexity: "O(n log n)",
    description: "Divides to single elements, then merges soreted halves back.",
    slug: "merge-sort",
  },
  {
    title: "Quick Sort",
    complexity: "O(n log n)",
    description: "Partitons around a pivot, then recurses on both sides.",
    slug: "quick-sort",
  },
]

export default Sorting;
