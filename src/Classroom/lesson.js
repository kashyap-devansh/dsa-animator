import searchIndex from "../Playground/shared/searchIndex.js";
import { NOTES, noteBySlug } from "../Notes/content";

// A lesson is an ordered list of items a teacher walks through in class:
//   v~<category>/<slug>  a visualizer
//   n~<slug>             a study note
//   q~<slug>             a projected class quiz built from a note's questions
// Lessons travel in the URL so a teacher can share one with a single link.

const VIZ = searchIndex.filter((v) => v.active);

export const CATALOG = [
  ...VIZ.map((v) => ({ type: "v", ref: v.path.replace("/playground/", ""), title: v.title, group: v.category })),
  ...NOTES.map((n) => ({ type: "n", ref: n.slug, title: n.title, group: n.group })),
  ...NOTES.map((n) => ({ type: "q", ref: n.slug, title: `${n.title} quiz`, group: n.group })),
];

export const KIND = {
  v: { label: "Visualize", tone: "orange" },
  n: { label: "Notes", tone: "lime" },
  q: { label: "Class quiz", tone: "blue" },
};

export function pathOf(item) {
  if (item.type === "v") return `/playground/${item.ref}`;
  if (item.type === "n") return `/notes/${item.ref}`;
  return `/quiz/${item.ref}`;
}

export function describe(item) {
  if (item.type === "v") {
    const v = VIZ.find((x) => x.path === `/playground/${item.ref}`);
    return v ? { title: v.title, group: v.category } : null;
  }
  const note = noteBySlug(item.ref);
  if (!note) return null;
  return { title: item.type === "q" ? `${note.title} quiz` : note.title, group: note.group };
}

export const keyOf = (item) => `${item.type}~${item.ref}`;

export function encodeLesson({ title, items }) {
  const params = new URLSearchParams();
  params.set("title", title || "Untitled lesson");
  params.set("items", items.map(keyOf).join(","));
  return `/lesson?${params.toString()}`;
}

export function decodeLesson(search) {
  const params = new URLSearchParams(search);
  const items = (params.get("items") || "")
    .split(",")
    .filter(Boolean)
    .map((raw) => {
      const [type, ref] = raw.split("~");
      return { type, ref };
    })
    .filter((item) => KIND[item.type] && describe(item));
  return { title: params.get("title") || "Lesson", items };
}

/* ---------- the lesson currently being taught (per tab) ---------- */

const KEY = "activeLesson";
const EVENT = "lesson-change";
let memory = null;

export function readLesson() {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : memory;
  } catch {
    return memory;
  }
}

export function writeLesson(lesson) {
  memory = lesson;
  try {
    if (lesson) sessionStorage.setItem(KEY, JSON.stringify(lesson));
    else sessionStorage.removeItem(KEY);
  } catch {
    /* storage blocked: the in-memory copy still works for this visit */
  }
  window.dispatchEvent(new Event(EVENT));
}

export const LESSON_EVENT = EVENT;
