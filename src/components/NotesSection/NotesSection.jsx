import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion, useSpring } from "framer-motion";
import NotesData from "./NotesData.js";
import { Reveal } from "../shared/effects";
import "./NotesSection.css";

const EASE = [0.22, 1, 0.36, 1];

// Lines "ink in" left to right, one after another. Negative insets leave room
// for margin annotations that hang outside the line.
const inkLine = (index) => ({
  initial: { clipPath: "inset(-30% 100% -30% 0%)", opacity: 0.3 },
  animate: { clipPath: "inset(-30% -80% -30% 0%)", opacity: 1 },
  transition: { duration: 0.5, delay: 0.35 + index * 0.13, ease: EASE },
});

// Page turn: the old sheet swings away, the new one swings in from the other side.
const turn = {
  enter: (dir) => ({ opacity: 0, x: dir * 70, rotateY: dir * -28, rotate: dir * 2 }),
  center: { opacity: 1, x: 0, rotateY: 0, rotate: -0.6, transition: { duration: 0.55, ease: EASE } },
  exit: (dir) => ({ opacity: 0, x: dir * -90, rotateY: dir * 30, rotate: dir * -3, transition: { duration: 0.32, ease: "easeIn" } }),
};

const visualizerPath = (note) => `/playground/${note.category.toLowerCase()}/${note.id}`;

function LineBlock({ block }) {
  if (block.type === "idea") {
    return <p className="note_idea">{block.text}</p>;
  }

  if (block.type === "step") {
    return (
      <p className="note_step">
        {block.marker && (
          <span className="note_marker">
            {block.marker}
          </span>
        )}

        <span className="note_step_text">
          {block.text}

          {block.code && (
            <code className="note_code">
              {block.code}
            </code>
          )}

          {block.suffix}

        </span>

        {block.note && (
          <span className="note_annotation">
            {block.note.split("\n").map((line, lineIndex) => (
              <span
                key={lineIndex}
                className="note_annotation_line"
              >
                {line}
              </span>
            ))}
          </span>
        )}
      </p>
    );
  }

  if (block.type === "line") {
    return (
      <p className="note_line">
        {block.text}

        {block.star && (
          <span className="note_star">*</span>
        )}
      </p>
    );
  }

  if (block.type === "strike") {
    return (
      <p className="note_line note_strike">
        {block.text}
      </p>
    );
  }

  return null;
}

// One sheet of the notebook, inked in line by line.
export function NotebookPaper({ note, reduced }) {
  return (
    <>
      <span className="page_tape page_tape-left" />
      <span className="page_tape page_tape-right" />
      <div className="page_rules" />
      <div className="page_content">
        <span className="page_eyebrow">
          {note.category} · PAGE {note.page}
        </span>

        <h2 className="page_title">{note.title}</h2>

        <div className="page_body">
          {note.blocks.map((block, blockIndex) => (
            <motion.div key={blockIndex} {...(reduced ? {} : inkLine(blockIndex))}>
              <LineBlock block={block} />
            </motion.div>
          ))}
        </div>

        <span className="page_footer">— {note.footerLabel}</span>
      </div>
    </>
  );
}

function PageThumb({ note, active, onClick }) {
  return (
    <button
      type="button"
      className={`thumb${active ? " thumb-active" : ""}`}
      onClick={onClick}
    >
      <span className="thumb_paper">
        <span className="thumb_paper_title">{note.title}</span>

        {note.blocks.slice(0, 6).map((block, i) => (
          <span key={i} className={`thumb_paper_line${block.type === "strike" ? " is-strike" : ""}`}>
            {block.marker ? `${block.marker} ` : ""}{block.text}{block.code ? ` ${block.code}` : ""}
          </span>
        ))}
      </span>

      <span className="thumb_title">
        {note.title}
      </span>

      <span className="thumb_meta">
        {note.category} · PAGE {note.page}
      </span>
    </button>
  );
}

const Notes = ({ embedded = false }) => {
  const [{ index: currentPageIndex, dir }, setPage] = useState({ index: 0, dir: 1 });
  const reduced = useReducedMotion();

  const currentNote = NotesData[currentPageIndex];

  const goToPage = (pageIndex, direction = pageIndex > currentPageIndex ? 1 : -1) => {
    setPage({
      index: (pageIndex + NotesData.length) % NotesData.length,
      dir: direction,
    });
  };

  // Paper tilts gently toward the cursor.
  const tiltX = useSpring(0, { stiffness: 150, damping: 18 });
  const tiltY = useSpring(0, { stiffness: 150, damping: 18 });

  const tilt = (e) => {
    if (reduced || e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    tiltY.set(((e.clientX - rect.left) / rect.width - 0.5) * 8);
    tiltX.set(((e.clientY - rect.top) / rect.height - 0.5) * -8);
  };

  const untilt = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest("input, textarea")) return;
      if (embedded && !e.target.closest?.(".notes")) {
        const box = document.querySelector(".notes-embedded")?.getBoundingClientRect();
        if (!box || box.bottom < 0 || box.top > window.innerHeight) return;
      }
      if (e.key === "ArrowRight") setPage(({ index }) => ({ index: (index + 1) % NotesData.length, dir: 1 }));
      if (e.key === "ArrowLeft") setPage(({ index }) => ({ index: (index - 1 + NotesData.length) % NotesData.length, dir: -1 }));
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [embedded]);

  const swipe = (_, info) => {
    if (info.offset.x < -80) goToPage(currentPageIndex + 1, 1);
    else if (info.offset.x > 80) goToPage(currentPageIndex - 1, -1);
  };

  return (
    <section className={`notes ${embedded ? "notes-embedded" : ""}`}>
      {!embedded && <div className="notes_grid" />}

      {!embedded && (
      <Reveal className="notes_header">
        <span className="notes_header_eyebrow">The notebook</span>
        <h1 className="notes_header_title">
          Handwritten first.
          <br />
          Animated after.
        </h1>
        <p className="notes_header_lede">
          Pages from the notebook behind every visualizer — flip through them, then watch the algorithm run.
        </p>
      </Reveal>
      )}

      <div className="notes_layout">
        <div className="notes_stage" onPointerMove={tilt} onPointerLeave={untilt}>
          <motion.div className="page_holder" style={{ rotateX: tiltX, rotateY: tiltY }}>
            <AnimatePresence mode="popLayout" custom={dir} initial={false}>
              <motion.div
                key={currentNote.id}
                className="page"
                custom={dir}
                variants={reduced ? undefined : turn}
                initial="enter"
                animate="center"
                exit="exit"
                drag="x"
                dragSnapToOrigin
                dragElastic={0.35}
                onDragEnd={swipe}
              >
                <NotebookPaper note={currentNote} reduced={reduced} />
              </motion.div>
            </AnimatePresence>
          </motion.div>


          <div className="notes_pagination">
            <button
              type="button"
              className="page_arrow"
              onClick={() =>
                goToPage(currentPageIndex - 1, -1)
              }
              aria-label="Previous page"
            >
              ←
            </button>

            <span className="page_dots">
              {NotesData.map((note, i) => (
                <button
                  key={note.id}
                  type="button"
                  className={`page_dot${i === currentPageIndex ? " page_dot-active" : ""}`}
                  onClick={() => goToPage(i)}
                  aria-label={`Go to ${note.title}`}
                />
              ))}
            </span>

            <span className="page_count">
              {currentPageIndex + 1} / {NotesData.length}
            </span>

            <button
              type="button"
              className="page_arrow"
              onClick={() =>
                goToPage(currentPageIndex + 1, 1)
              }
              aria-label="Next page"
            >
              →
            </button>
          </div>

          <div className="notes_links">
            <Link to={visualizerPath(currentNote)} className="notes_watch">
              <span className="notes_watch_dot" />
              Watch it run →
            </Link>

            <a
              href={currentNote.pdf}
              target="_blank"
              rel="noreferrer"
              className="notes_open_pdf"
            >
              Open PDF ↗
            </a>
          </div>
        </div>

        <aside className="notes_sidebar">

          <span className="notes_sidebar_label">
            Pages in this notebook
          </span>

          <div className="notes_sidebar_list">

            {NotesData.map((note, pageIndex) => (
              <PageThumb
                key={note.id}
                note={note}
                active={pageIndex === currentPageIndex}
                onClick={() => goToPage(pageIndex)}
              />
            ))}
          </div>
        </aside>
      </div>

      {!embedded && (
      <div className="notes_meta">
        <span>
          DSA/Animator — Notes
        </span>

        <span>
          ← → to flip · swipe on touch
        </span>

      </div>
      )}

    </section>
  );
};

export default Notes;
