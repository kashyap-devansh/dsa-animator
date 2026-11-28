import searchIndex from "../Playground/shared/searchIndex.js";
import { NOTES, noteBySlug } from "../Notes/content";

// A lesson is an ordered list of items a teacher walks through in class:
//   { type: "v", ref: "<category>/<slug>" }  a visualizer
//   { type: "n", ref: "<slug>" }             a study note
//   { type: "q", ref: "<slug>" }             a projected quiz from a note's questions
//   { type: "c", q: { q, options, answer, why } }  the teacher's own question
// Any item may also carry `min` (planned minutes) and `note` (speaker notes,
// kept on the teacher's machine and never put in a shared link).
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
  c: { label: "Question", tone: "blue" },
};

// Planned minutes when the teacher hasn't set any.
export function minutesOf(item) {
  if (item.min > 0) return item.min;
  if (item.type === "v") return 8;
  if (item.type === "n") return 5;
  if (item.type === "q") return Math.max(2, noteBySlug(item.ref)?.quiz.length ?? 2) * 1.5;
  return 2;
}

export const totalMinutes = (items) => Math.round(items.reduce((s, it) => s + minutesOf(it), 0));

export const formatMinutes = (m) => (m >= 60 ? `${Math.floor(m / 60)} h ${m % 60 ? `${m % 60} min` : ""}`.trim() : `${m} min`);

// Custom questions are addressed by their place in the lesson.
export function pathOf(item, index = 0) {
  if (item.type === "v") return `/playground/${item.ref}`;
  if (item.type === "n") return `/notes/${item.ref}`;
  if (item.type === "c") return `/question/${index}`;
  return `/quiz/${item.ref}`;
}

const validQuestion = (q) =>
  q && typeof q.q === "string" && q.q.trim() && Array.isArray(q.options) && q.options.length >= 2 && q.options.every((o) => typeof o === "string") && q.answer >= 0 && q.answer < q.options.length;

export function describe(item) {
  if (item.type === "v") {
    const v = VIZ.find((x) => x.path === `/playground/${item.ref}`);
    return v ? { title: v.title, group: v.category } : null;
  }
  if (item.type === "c") return validQuestion(item.q) ? { title: item.q.q, group: "Your question" } : null;
  const note = noteBySlug(item.ref);
  if (!note) return null;
  return { title: item.type === "q" ? `${note.title} quiz` : note.title, group: note.group };
}

// The questions an item asks, for quizzes and handouts.
export function questionsOf(item) {
  if (item.type === "c") return validQuestion(item.q) ? [item.q] : [];
  if (item.type === "q") return noteBySlug(item.ref)?.quiz ?? [];
  return [];
}

export const keyOf = (item) => (item.type === "c" ? `c~${item.q.q}` : `${item.type}~${item.ref}`);

/* ---------- links ---------- */

const toB64 = (s) => btoa(String.fromCharCode(...new TextEncoder().encode(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromB64 = (s) => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0)));

// What goes into a shared link: everything but the speaker notes.
const shareable = (item) => {
  const out = item.type === "c" ? { t: "c", q: item.q } : { t: item.type, r: item.ref };
  if (item.min > 0) out.m = item.min;
  return out;
};

export function encodeLesson({ title, items }, base = "/lesson") {
  const params = new URLSearchParams();
  params.set("title", title || "Untitled lesson");
  // Plain lists stay readable; anything with questions or timings is packed.
  if (items.every((it) => it.type !== "c" && !(it.min > 0))) params.set("items", items.map(keyOf).join(","));
  else params.set("d", toB64(JSON.stringify(items.map(shareable))));
  return `${base}?${params.toString()}`;
}

export function decodeLesson(search) {
  const params = new URLSearchParams(search);
  let items = [];

  if (params.get("d")) {
    try {
      items = JSON.parse(fromB64(params.get("d"))).map((x) => ({ type: x.t, ...(x.t === "c" ? { q: x.q } : { ref: x.r }), ...(x.m > 0 ? { min: Number(x.m) } : {}) }));
    } catch {
      items = [];
    }
  } else {
    items = (params.get("items") || "")
      .split(",")
      .filter(Boolean)
      .map((raw) => {
        const [type, ref] = raw.split("~");
        return { type, ref };
      });
  }

  return { title: params.get("title") || "Lesson", items: items.filter((item) => KIND[item.type] && describe(item)) };
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

// Same lesson? (so reopening its cover keeps the speaker notes and the clock)
export const sameLesson = (a, b) => !!a && !!b && a.title === b.title && a.items.length === b.items.length && a.items.every((it, i) => keyOf(it) === keyOf(b.items[i]));

export const LESSON_EVENT = EVENT;
