const SortingData = [{
  title: "Bubble Sort",
  complexity: "O(n²)",
  description: "Adjacent swaps bubble the largest value to the end each pass.",
  slug: "bubble-sort",
  active: true,
},
{
  title: "Selection Sort",
  complexity: "O(n²)",
  description: "Repeatedly selects the minimum of the unsorted tail.",
  slug: "selection-sort",
  active: true,

},
{
  title: "Insertion Sort",
  complexity: "O(n²)",
  description: "Grows a sorted prefix by inserting each element into place",
  slug: "insertion-sort",
  active: true,

},
{
  title: "Merge Sort",
  complexity: "O(n log n)",
  description: "Divides to single elements, then merges soreted halves back.",
  slug: "merge-sort",
  active: true,

},
{
  title: "Quick Sort",
  complexity: "O(n log n)",
  description: "Partitons around a pivot, then recurses on both sides.",
  slug: "quick-sort",
  active: true,

},
{
  title: "Radix Sort",
  complexity: "O(d(n + k))",
  description: "Sorts numbers digit by digit, from least to most significant, using a stable counting sort at each pass",
  slug: "radix-sort",
  active: true,
},
]

export default SortingData;
