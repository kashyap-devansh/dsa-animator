import SortingData from "../Algorithms/Sorting/SortingData.js";
import SearchingData from "../Algorithms/Searching/SearchingData.js";
import HashingData from "../Algorithms/Hashing/HashingData.js";
import ArrayData from "../Structures/Array/ArrayData.js";
import LinkedListData from "../Structures/LinkedList/LinkedListData.js";
import StackData from "../Structures/Stack/Stack.js";
import QueueData from "../Structures/Queue/QueueData.js";
import BSTData from "../Structures/BST/BSTData.js";
import AVLData from "../Structures/AVL/AVLData.js";
import RecursionData from "../Recursion/RecursionData.js";

export const categories = [
  { label: "Sorting", basePath: "/playground/sorting", data: SortingData },
  { label: "Searching", basePath: "/playground/searching", data: SearchingData },
  { label: "Hashing", basePath: "/playground/hashing", data: HashingData },
  { label: "Array", basePath: "/playground/array", data: ArrayData },
  { label: "Linked List", basePath: "/playground/linkedList", data: LinkedListData },
  { label: "Stack", basePath: "/playground/stack", data: StackData },
  { label: "Queue", basePath: "/playground/queue", data: QueueData },
  { label: "Binary Search Tree", basePath: "/playground/bst", data: BSTData },
  { label: "AVL Tree", basePath: "/playground/avl", data: AVLData },
  { label: "Recursion", basePath: "/playground/recursion", data: RecursionData },
];

const searchIndex = categories.flatMap(({ label, basePath, data }) =>
  data.map((item) => ({
    ...item,
    category: label,
    path: `${basePath}/${item.slug}`,
  }))
);

export default searchIndex;
