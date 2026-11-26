import { useCallback, useSyncExternalStore } from "react";

// Small localStorage-backed stores: which lessons are finished, and the theme.
// Every read and write tolerates storage being blocked.

function createStore(key, fallback) {
  const event = `${key}:change`;
  let memory = fallback;

  const read = () => {
    try {
      return localStorage.getItem(key) ?? memory;
    } catch {
      return memory;
    }
  };

  const write = (value) => {
    memory = value;
    try {
      localStorage.setItem(key, value);
    } catch {
      /* not persisted */
    }
    window.dispatchEvent(new Event(event));
  };

  const subscribe = (cb) => {
    window.addEventListener(event, cb);
    window.addEventListener("storage", cb);
    return () => {
      window.removeEventListener(event, cb);
      window.removeEventListener("storage", cb);
    };
  };

  const use = () => useSyncExternalStore(subscribe, read, () => fallback);
  return { read, write, use };
}

const progressStore = createStore("dsa:progress", "[]");

const parse = (raw) => {
  try {
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
};

export function useProgress() {
  const done = parse(progressStore.use());

  const mark = useCallback((path, value = true) => {
    const next = parse(progressStore.read());
    if (value) next.add(path);
    else next.delete(path);
    progressStore.write(JSON.stringify([...next]));
  }, []);

  const reset = useCallback(() => progressStore.write("[]"), []);

  return { done, mark, reset };
}

const themeStore = createStore("dsa:theme", "");

export function useTheme() {
  const saved = themeStore.use();
  const theme = saved === "dark" || saved === "light" ? saved : document.documentElement.dataset.theme || "light";

  const toggle = useCallback(() => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = next === "dark" ? "#0c0d0f" : "#f6f3ec";
    themeStore.write(next);
  }, []);

  return { theme, toggle };
}
