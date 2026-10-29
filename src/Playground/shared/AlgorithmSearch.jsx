import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import searchIndex from "./searchIndex.js";
import { SearchIcon, LockIcon } from "./icons.jsx";
import "./AlgorithmSearch.css";

const MAX_RESULTS = 7;

const EXAMPLES = ["bubble sort", "avl rotation", "n-queens", "binary search", "hash table", "permutations", "merge sort"];

// Types and deletes example queries for the placeholder, like a live terminal.
function useTypedExample() {
  const reduced = useReducedMotion();
  const [state, setState] = useState({ i: 0, text: "", deleting: false });

  useEffect(() => {
    if (reduced) return;
    const word = EXAMPLES[state.i];
    const done = !state.deleting && state.text === word;
    const empty = state.deleting && state.text === "";

    const timer = setTimeout(() => {
      if (done) setState((s) => ({ ...s, deleting: true }));
      else if (empty) setState((s) => ({ i: (s.i + 1) % EXAMPLES.length, text: "", deleting: false }));
      else setState((s) => ({ ...s, text: s.deleting ? s.text.slice(0, -1) : word.slice(0, s.text.length + 1) }));
    }, done ? 1600 : empty ? 300 : state.deleting ? 35 : 75);

    return () => clearTimeout(timer);
  }, [state, reduced]);

  return reduced ? EXAMPLES[0] : state.text;
}

const AlgorithmSearch = () => {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const boxRef = useRef(null);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const example = useTypedExample();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return searchIndex
      .filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
      )
      .slice(0, MAX_RESULTS);
  }, [query]);

  useEffect(() => {
    setHighlight(0);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goTo = (item) => {
    if (!item || !item.active) return;

    navigate(item.path);
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e) => {
    if (!results.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((prev) => (prev + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      goTo(results[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="algo-search" ref={boxRef}>
      <div className={`algo-search-bar ${open && query ? "expanded" : ""}`}>
        <span className="algo-search-prompt">&gt;</span>
        <SearchIcon />

        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder={`search.algorithm('${example}')`}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          spellCheck="false"
          autoComplete="off"
        />

        <span className="algo-search-cursor" />
      </div>

      {open && query && (
        <div className="algo-search-results">
          {results.length === 0 ? (
            <p className="algo-search-empty">// no match for "{query}"</p>
          ) : (
            results.map((item, index) => (
              <button
                key={item.path}
                type="button"
                className={`algo-search-result ${index === highlight ? "highlighted" : ""} ${item.active ? "" : "locked"}`}
                onMouseEnter={() => setHighlight(index)}
                onClick={() => goTo(item)}
              >
                <span className="result-category">{item.category}</span>
                <span className="result-title">{item.title}</span>
                <span className="result-complexity">{item.complexity}</span>
                {!item.active && <LockIcon />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AlgorithmSearch;
