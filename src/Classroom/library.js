import { useSyncExternalStore } from "react";
import { describe } from "./lesson";

// The teacher's saved lectures, kept in this browser. Export / import moves
// them between machines (office laptop → lab PC) as one small JSON file.

const KEY = "lectures";
const OLD_DRAFT = "lessonDraft";
const EVENT = "lectures-change";

let cache = null;

const clean = (items = []) => items.filter((it) => it && describe(it)).map(({ uid: _uid, ...it }) => it);
const uid = () => Math.random().toString(36).slice(2, 10);

function load() {
  if (cache) return cache;
  let list = [];
  try {
    list = JSON.parse(localStorage.getItem(KEY)) ?? [];
    // Bring over the single draft the old builder kept.
    if (!localStorage.getItem(KEY)) {
      const draft = JSON.parse(localStorage.getItem(OLD_DRAFT));
      if (draft?.items?.length) list = [{ id: uid(), title: draft.title || "My lecture", items: clean(draft.items), updatedAt: Date.now() }];
    }
  } catch {
    list = [];
  }
  cache = Array.isArray(list) ? list.map((l) => ({ ...l, items: clean(l.items) })) : [];
  return cache;
}

function save(list) {
  cache = list;
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
    localStorage.removeItem(OLD_DRAFT);
  } catch {
    /* storage blocked: changes last for this visit */
  }
  window.dispatchEvent(new Event(EVENT));
}

const subscribe = (cb) => {
  window.addEventListener(EVENT, cb);
  const onStorage = (e) => {
    if (e.key === KEY) {
      cache = null;
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", onStorage);
  };
};

export const useLectures = () => useSyncExternalStore(subscribe, load, () => []);

export function createLecture({ title = "Untitled lecture", items = [] } = {}) {
  const lecture = { id: uid(), title, items: clean(items), updatedAt: Date.now() };
  save([lecture, ...load()]);
  return lecture.id;
}

export function updateLecture(id, patch) {
  save(load().map((l) => (l.id === id ? { ...l, ...patch, items: patch.items ? clean(patch.items) : l.items, updatedAt: Date.now() } : l)));
}

export function duplicateLecture(id) {
  const src = load().find((l) => l.id === id);
  if (!src) return null;
  return createLecture({ title: `${src.title} (copy)`, items: src.items });
}

export function deleteLecture(id) {
  save(load().filter((l) => l.id !== id));
}

export function restoreLecture(lecture, index = 0) {
  const list = load().filter((l) => l.id !== lecture.id);
  list.splice(index, 0, lecture);
  save(list);
}

export function exportLectures() {
  const blob = new Blob([JSON.stringify({ app: "dsa-animator", version: 1, lectures: load() }, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `lectures-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

// Adds every lecture from a file; returns how many came in.
export async function importLectures(file) {
  const data = JSON.parse(await file.text());
  const incoming = (Array.isArray(data) ? data : data.lectures ?? []).filter((l) => l && typeof l.title === "string" && Array.isArray(l.items));
  if (!incoming.length) throw new Error("No lectures found in that file.");
  save([...incoming.map((l) => ({ id: uid(), title: l.title, items: clean(l.items), updatedAt: Date.now() })), ...load()]);
  return incoming.length;
}
