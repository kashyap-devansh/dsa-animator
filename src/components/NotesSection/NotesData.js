import bubbleSortPdf from "../../assets/notes/BubbleSort.pdf";
import binarySearchPdf from "../../assets/notes/BinarySearch.pdf";
import insertionSortPdf from "../../assets/notes/InsertionSort.pdf";
import selectionSortPdf from "../../assets/notes/SelectionSort.pdf";
import linearSearchPdf from "../../assets/notes/LinearSearch.pdf";

const NotesData = [
  {
    id: "bubble-sort",
    category: "SORTING",
    page: 1,
    title: "bubble sort",
    pdf: bubbleSortPdf,
    footerLabel: "pg. 1",
    blocks: [
      { type: "idea", text: "idea: keep swapping neighbors until nothing swaps" },
      { type: "step", marker: "1)", text: "compare", code: "arr[j]", note: null },
      { type: "step", marker: "", text: "and", code: "arr[j+1]", note: null },
      { type: "step", marker: "2)", text: "swap if left one is bigger", note: "n passes, each pass\nfixes one from the end" },
      { type: "step", marker: "3)", text: "biggest value bubbles to the end each pass" },
      { type: "line", text: "stop early if a pass makes zero swaps", star: true },
      { type: "strike", text: "always run all n passes" },
      { type: "line", text: "add a swapped flag, break when false" },
    ],
  },
  {
    id: "insertion-sort",
    category: "SORTING",
    page: 2,
    title: "insertion sort",
    pdf: insertionSortPdf,
    footerLabel: "pg. 2",
    blocks: [
      { type: "idea", text: "idea: build sorted part on the left" },
      { type: "step", marker: "1)", text: "pick", code: "arr[i]", suffix: ", call it key" },
      { type: "step", marker: "2)", text: "shift everything bigger than key one step right", note: "faster when array is\nalmost sorted" },
      { type: "step", marker: "3)", text: "drop key in the gap" },
      { type: "line", text: "like sorting cards in your hand", star: true },
      { type: "strike", text: "shift left" },
      { type: "line", text: "shift RIGHT to make space, then insert" },
    ],
  },
  {
    id: "selection-sort",
    category: "SORTING",
    page: 3,
    title: "selection sort",
    pdf: selectionSortPdf,
    footerLabel: "pg. 3",
    blocks: [
      { type: "idea", text: "idea: find the minimum, put it in front" },
      { type: "step", marker: "1)", text: "scan unsorted part, track index of smallest" },
      { type: "step", marker: "2)", text: "swap smallest into", code: "arr[i]", note: "only 1 swap\nper pass" },
      { type: "step", marker: "3)", text: "move boundary i one step right" },
      { type: "line", text: "fewest swaps of the O(n²) sorts", star: true },
    ],
  },
  {
    id: "binary-search",
    category: "SEARCHING",
    page: 1,
    title: "binary search",
    pdf: binarySearchPdf,
    footerLabel: "pg. 1",
    blocks: [
      { type: "idea", text: "idea: cut the search space in half every time" },
      { type: "step", marker: "1)", text: "check the middle,", code: "mid = (lo+hi)/2" },
      { type: "step", marker: "2)", text: "go left if target is smaller, right if bigger", note: "array MUST\nbe sorted first" },
      { type: "step", marker: "3)", text: "stop when lo > hi -> not found" },
      { type: "strike", text: "mid = (lo + hi) / 2" },
      { type: "line", text: "mid = lo + (hi - lo) / 2  — avoids overflow" },
    ],
  },
  {
    id: "linear-search",
    category: "SEARCHING",
    page: 2,
    title: "linear search",
    pdf: linearSearchPdf,
    footerLabel: "pg. 2",
    blocks: [
      { type: "idea", text: "idea: check every element, left to right" },
      { type: "step", marker: "1)", text: "walk i from 0 to n-1" },
      { type: "step", marker: "2)", text: "if", code: "arr[i] === target", suffix: ", return i", note: "no sorted-order\nrequirement" },
      { type: "line", text: "only option when the array isn't sorted", star: true },
    ],
  },
];

export default NotesData;
