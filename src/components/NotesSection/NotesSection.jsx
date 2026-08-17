import { useState } from "react";
import { motion } from "framer-motion";
import NotesData from "./NotesData.js";
import "./NotesSection.css";

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

function PageThumb({ note, active, onClick }) {
  return (
    <button
      type="button"
      className={`thumb${active ? " thumb-active" : ""}`}
      onClick={onClick}
    >
      <span className="thumb_paper" />

      <span className="thumb_title">
        {note.title}
      </span>

      <span className="thumb_meta">
        {note.category} · PAGE {note.page}
      </span>
    </button>
  );
}

const Notes = () => {
  const [currentPageIndex, setCurrentPageIndex] = useState(
    NotesData.length - 1
  );

  const currentNote = NotesData[currentPageIndex];

  const goToPage = (pageIndex) => {
    setCurrentPageIndex(
      (pageIndex + NotesData.length) % NotesData.length
    );
  };

  return (
    <section className="notes">
      <div className="notes_layout">
        <div className="notes_stage">
          <motion.div
            key={currentNote.id}
            className="page"
            initial={{
              opacity: 0,
              y: 14,
              rotate: -0.6,
            }}
            animate={{
              opacity: 1,
              y: 0,
              rotate: -0.6,
            }}
            transition={{
              duration: 0.32,
              ease: "easeOut",
            }}
          >
            <span className="page_tape page_tape-left" />
            <span className="page_tape page_tape-right" />
            <div className="page_rules" />
            <div className="page_content">
              <span className="page_eyebrow">
                {currentNote.category} · PAGE{" "}
                {currentNote.page}
              </span>

              <h2 className="page_title">
                {currentNote.title}
              </h2>

              <div className="page_body">
                {currentNote.blocks.map(
                  (block, blockIndex) => (
                    <LineBlock
                      block={block}
                      key={blockIndex}
                    />
                  )
                )}
              </div>

              <span className="page_footer">
                — {currentNote.footerLabel}
              </span>

            </div>
          </motion.div>


          <div className="notes_pagination">
            <button
              type="button"
              className="page_arrow"
              onClick={() =>
                goToPage(currentPageIndex - 1)
              }
              aria-label="Previous page"
            >
              ←
            </button>

            <span className="page_count">
              {currentPageIndex + 1} / {NotesData.length}
            </span>

            <button
              type="button"
              className="page_arrow"
              onClick={() =>
                goToPage(currentPageIndex + 1)
              }
              aria-label="Next page"
            >
              →
            </button>
          </div>

          <a
            href={currentNote.pdf}
            target="_blank"
            rel="noreferrer"
            className="notes_open_pdf"
          >
            Open PDF ↗
          </a>
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
                onClick={() =>
                  setCurrentPageIndex(pageIndex)
                }
              />
            ))}
          </div>
        </aside>
      </div>

      <div className="notes_meta">
        <span>
          DSA/Animator — Notes
        </span>

        <span>
          Scanned from the physical notebook
        </span>

      </div>

    </section>
  );
};

export default Notes;
