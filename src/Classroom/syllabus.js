// A typical undergraduate Data Structures & Algorithms course, unit by unit,
// mapped onto what the site can show. Each unit doubles as a ready-made lesson.

const v = (ref) => ({ type: "v", ref });
const n = (ref) => ({ type: "n", ref });
const q = (ref) => ({ type: "q", ref });

const SYLLABUS = [
  {
    id: "unit-1",
    unit: "Unit 1",
    title: "Complexity & Searching",
    outcome: "Analyse running time with Big-O and compare linear and logarithmic search.",
    hours: 6,
    items: [n("big-o"), q("big-o"), v("searching/linear-search"), v("searching/binary-search"), q("binary-search"), v("searching/jump-search"), v("searching/interpolation-search"), v("searching/exponential-search"), v("searching/fibonacci-search")],
  },
  {
    id: "unit-2",
    unit: "Unit 2",
    title: "Arrays, Stacks & Queues",
    outcome: "Implement array operations and the LIFO / FIFO abstract data types.",
    hours: 6,
    items: [n("arrays"), v("array/insert"), v("array/delete"), v("array/traverse"), n("stack"), v("stack/push"), v("stack/pop"), n("queue"), v("queue/enqueue"), v("queue/dequeue"), q("stack")],
  },
  {
    id: "unit-3",
    unit: "Unit 3",
    title: "Linked Lists",
    outcome: "Insert and delete nodes at any position by rewiring pointers safely.",
    hours: 5,
    items: [n("linked-list"), v("linkedList/insert-at-head"), v("linkedList/insert-at-tail"), v("linkedList/insert-at-position"), v("linkedList/delete-from-head"), v("linkedList/delete-from-tail"), v("linkedList/delete-from-position"), q("linked-list")],
  },
  {
    id: "unit-4",
    unit: "Unit 4",
    title: "Sorting",
    outcome: "Trace and compare comparison sorts and linear-time non-comparison sorts.",
    hours: 8,
    items: [v("sorting/bubble-sort"), v("sorting/selection-sort"), v("sorting/insertion-sort"), q("insertion-sort"), v("sorting/merge-sort"), v("sorting/quick-sort"), q("quick-sort"), v("sorting/count-sort"), v("sorting/radix-sort"), v("sorting/bucket-sort"), v("searching/median-search")],
  },
  {
    id: "unit-5",
    unit: "Unit 5",
    title: "Hashing",
    outcome: "Design hash tables and resolve collisions by chaining and open addressing.",
    hours: 3,
    items: [n("hash-tables"), v("hashing/hash-table"), v("hashing/chaining"), v("hashing/probing"), q("hash-tables")],
  },
  {
    id: "unit-6",
    unit: "Unit 6",
    title: "Trees",
    outcome: "Maintain binary search trees and keep them balanced with AVL rotations.",
    hours: 8,
    items: [n("bst"), v("bst/insertion"), v("bst/search"), v("bst/deletion"), q("bst"), n("avl-tree"), v("avl/insertion"), v("avl/deletion"), q("avl-tree")],
  },
  {
    id: "unit-7",
    unit: "Unit 7",
    title: "Recursion & Backtracking",
    outcome: "Write recursive solutions, read call trees and prune search with backtracking.",
    hours: 6,
    items: [n("factorial"), v("recursion/factorial"), v("recursion/tower-of-hanoi"), v("recursion/fibonacci-sequence"), q("fibonacci-sequence"), v("recursion/permutations"), v("recursion/subset-sum"), v("recursion/n-queens"), q("n-queens")],
  },
];

export default SYLLABUS;
