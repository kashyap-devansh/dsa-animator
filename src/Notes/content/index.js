import sorting from "./sorting.js";
import searching from "./searching.js";
import { hashing, structures } from "./structures.js";
import { foundations, recursion } from "./recursion.js";

const withVisualizer = (basePath) => (note) => ({
  visualizers: [{ label: note.title, path: `${basePath}/${note.slug}` }],
  ...note,
});

const trees = structures.filter((n) => n.slug === "bst" || n.slug === "avl-tree");
const linear = structures.filter((n) => !trees.includes(n));

export const NOTE_GROUPS = [
  { id: "foundations", label: "Foundations", tone: "lime", notes: foundations },
  { id: "sorting", label: "Sorting", tone: "orange", notes: sorting.map(withVisualizer("/playground/sorting")) },
  { id: "searching", label: "Searching", tone: "blue", notes: searching.map(withVisualizer("/playground/searching")) },
  { id: "hashing", label: "Hashing", tone: "cyan", notes: hashing },
  { id: "structures", label: "Linear Structures", tone: "lime", notes: linear },
  { id: "trees", label: "Trees", tone: "blue", notes: trees },
  { id: "recursion", label: "Recursion & Backtracking", tone: "orange", notes: recursion },
];

export const NOTES = NOTE_GROUPS.flatMap((group) =>
  group.notes.map((note) => ({ ...note, group: group.label, groupId: group.id, tone: group.tone }))
);

export const noteBySlug = (slug) => NOTES.find((n) => n.slug === slug);

// Colour a Big-O string by how fast it grows.
export function bigOTone(value = "") {
  const v = value.replace(/\s/g, "");
  if (/n!|2ⁿ|2\^n|φ/.test(v)) return "bad";
  if (/n²|n\^2|n³/.test(v)) return "warn";
  if (/nlogn|n·n!|√n|O\(n\)|n\+k|d\(n|1\+α|O\(n/.test(v)) return "mid";
  if (/O\(1\)|log/.test(v)) return "good";
  return "mid";
}
