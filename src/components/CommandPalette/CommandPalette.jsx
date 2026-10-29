import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import searchIndex from "../../Playground/shared/searchIndex.js";
import { NOTES } from "../../Notes/content";
import "./CommandPalette.css";

// ⌘K / Ctrl+K anywhere: jump to any visualizer, note or page in a few keystrokes.

const PAGES = [
  { title: "Home", hint: "page", path: "/" },
  { title: "Playground", hint: "all visualizers", path: "/playground" },
  { title: "Study notes", hint: "all topics", path: "/notes" },
  { title: "For faculty", hint: "syllabus map & lesson builder", path: "/classroom" },
  { title: "Lesson builder", hint: "plan a lecture", path: "/classroom#builder" },
  { title: "Complexity cheat sheet", hint: "notes", path: "/notes#cheatsheet" },
  { title: "Big-O growth explorer", hint: "notes", path: "/notes#growth" },
];

const ITEMS = [
  ...searchIndex.filter((v) => v.active).map((v) => ({ kind: "Visualize", title: v.title, hint: v.category, extra: v.complexity, path: v.path })),
  ...NOTES.map((n) => ({ kind: "Notes", title: n.title, hint: n.group, extra: n.complexity.average, path: `/notes/${n.slug}` })),
  ...PAGES.map((p) => ({ kind: "Go to", ...p })),
];

function score(item, words) {
  const hay = `${item.title} ${item.hint} ${item.kind}`.toLowerCase();
  let total = 0;
  for (const w of words) {
    const at = hay.indexOf(w);
    if (at < 0) return -1;
    total += at === 0 ? 3 : hay[at - 1] === " " ? 2 : 1;
  }
  return total;
}


const CommandPalette = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const listRef = useRef(null);

  const results = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return ITEMS.filter((i) => i.kind !== "Notes").slice(0, 8).concat(ITEMS.filter((i) => i.kind === "Notes").slice(0, 4));
    return ITEMS.map((item) => ({ item, s: score(item, words) }))
      .filter((r) => r.s >= 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 12)
      .map((r) => r.item);
  }, [query]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-palette", onOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setCursor(0);
    window.__lenis?.stop();
    return () => window.__lenis?.start();
  }, [open]);

  useEffect(() => setCursor(0), [query]);

  useEffect(() => {
    listRef.current?.querySelector(".cp-item.is-active")?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  const go = (item) => {
    setOpen(false);
    const [path, hash] = item.path.split("#");
    navigate(path);
    if (hash) setTimeout(() => {
      const el = document.getElementById(hash);
      if (window.__lenis && el) window.__lenis.scrollTo(el, { offset: -90 });
      else el?.scrollIntoView({ behavior: "smooth" });
    }, 350);
  };

  const onInputKey = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === "Enter" && results[cursor]) {
      go(results[cursor]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
    e.stopPropagation();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="cp-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} onClick={() => setOpen(false)}>
          <motion.div
            className="cp"
            role="dialog"
            aria-label="Search"
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cp-input">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
              <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={onInputKey} placeholder="Jump to a visualizer, note or page…" />
              <kbd>esc</kbd>
            </div>

            <ul className="cp-list" ref={listRef} data-lenis-prevent>
              {results.map((item, i) => (
                <li key={`${item.kind}-${item.path}`}>
                  <button type="button" className={`cp-item ${i === cursor ? "is-active" : ""}`} onMouseMove={() => setCursor(i)} onClick={() => go(item)}>
                    <span className={`cp-kind cp-kind-${item.kind.replace(/\s/g, "").toLowerCase()}`}>{item.kind}</span>
                    <span className="cp-title">{item.title}</span>
                    <span className="cp-hint">{item.hint}</span>
                    {item.extra && <span className="cp-extra">{item.extra}</span>}
                  </button>
                </li>
              ))}
              {!results.length && <li className="cp-empty">Nothing matches “{query}”.</li>}
            </ul>

            <div className="cp-foot">
              <span><kbd>↑</kbd><kbd>↓</kbd> move</span>
              <span><kbd>↵</kbd> open</span>
              <span><kbd>⌘</kbd><kbd>K</kbd> toggle</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
