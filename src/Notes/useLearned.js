import { useCallback, useSyncExternalStore } from "react";

// Which notes this reader has marked as learned. Kept in localStorage as a
// per-browser convenience; every read and write tolerates storage being blocked.

const KEY = "notesLearned";
const EVENT = "notes-learned-change";
let memory = "[]";

function read() {
  try {
    return localStorage.getItem(KEY) ?? memory;
  } catch {
    return memory;
  }
}

function subscribe(callback) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function useLearned() {
  const raw = useSyncExternalStore(subscribe, read, () => "[]");
  let learned;
  try {
    learned = new Set(JSON.parse(raw));
  } catch {
    learned = new Set();
  }

  const toggle = useCallback((slug) => {
    const next = new Set(JSON.parse(read()));
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    memory = JSON.stringify([...next]);
    try {
      localStorage.setItem(KEY, memory);
    } catch {
      /* storage blocked: progress just won't persist */
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { learned, toggle };
}
