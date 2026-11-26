import SortingData from "../Playground/Algorithms/Sorting/SortingData.js";
import SearchingData from "../Playground/Algorithms/Searching/SearchingData.js";
import HashingData from "../Playground/Algorithms/Hashing/HashingData.js";
import ArrayData from "../Playground/Structures/Array/ArrayData.js";
import LinkedListData from "../Playground/Structures/LinkedList/LinkedListData.js";
import StackData from "../Playground/Structures/Stack/Stack.js";
import QueueData from "../Playground/Structures/Queue/QueueData.js";
import BSTData from "../Playground/Structures/BST/BSTData.js";
import AVLData from "../Playground/Structures/AVL/AVLData.js";
import RecursionData from "../Playground/Recursion/RecursionData.js";

// The course: modules in teaching order, each a list of lessons. Lesson
// paths are the existing visualizer routes, so old links keep working.

const from = (data, base, rename = {}) =>
  data.map((item) => ({
    ...item,
    title: rename[item.slug] ?? item.title,
    path: `${base}/${item.slug}`,
  }));

const RAW = [
  { id: "arrays", title: "Arrays", lessons: from(ArrayData, "/playground/array", { insert: "Inserting into an Array", delete: "Deleting from an Array", traverse: "Traversing an Array" }) },
  { id: "linked-lists", title: "Linked Lists", lessons: from(LinkedListData, "/playground/linkedList") },
  {
    id: "stacks-queues",
    title: "Stacks & Queues",
    lessons: [
      ...from(StackData, "/playground/stack", { push: "Stack: Push", pop: "Stack: Pop" }),
      ...from(QueueData, "/playground/queue", { enqueue: "Queue: Enqueue", dequeue: "Queue: Dequeue" }),
    ],
  },
  { id: "hashing", title: "Hashing", lessons: from(HashingData, "/playground/hashing", { probing: "Open Addressing" }) },
  {
    id: "trees",
    title: "Trees",
    lessons: [
      ...from(BSTData, "/playground/bst", { insertion: "BST Insertion", search: "BST Search", deletion: "BST Deletion" }),
      ...from(AVLData, "/playground/avl", { insertion: "AVL Insertion", deletion: "AVL Deletion" }),
    ],
  },
  { id: "recursion", title: "Recursion & Backtracking", lessons: from(RecursionData, "/playground/recursion") },
  { id: "searching", title: "Searching", lessons: from(SearchingData, "/playground/searching") },
  { id: "sorting", title: "Sorting", lessons: from(SortingData, "/playground/sorting") },
];

let n = 0;
export const MODULES = RAW.map((m, mi) => ({
  ...m,
  number: String(mi + 1).padStart(2, "0"),
  lessons: m.lessons.map((l, li) => ({ ...l, index: li, number: ++n, moduleId: m.id })),
}));

export const LESSONS = MODULES.flatMap((m) => m.lessons);
export const TOTAL = LESSONS.length;
export const FIRST_LESSON = LESSONS[0].path;

export function findLesson(pathname) {
  const clean = pathname.replace(/\/+$/, "");
  const lesson = LESSONS.find((l) => l.path === clean);
  if (!lesson) return null;
  const module = MODULES.find((m) => m.id === lesson.moduleId);
  const flat = LESSONS.indexOf(lesson);
  return { lesson, module, prev: LESSONS[flat - 1] ?? null, next: LESSONS[flat + 1] ?? null };
}
