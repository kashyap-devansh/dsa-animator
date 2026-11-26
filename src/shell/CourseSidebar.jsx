import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronRight, Folder, FolderOpen, File, FileCheck } from "lucide-react";
import { MODULES, TOTAL, findLesson } from "../course/course";
import { useProgress } from "../course/store";

// The course outline: one folder per module, opened to the current lesson.
const CourseSidebar = ({ open, onClose }) => {
  const { pathname } = useLocation();
  const { done } = useProgress();
  const current = findLesson(pathname);
  const [expanded, setExpanded] = useState(() => new Set(current ? [current.module.id] : [MODULES[0].id]));

  // Whenever the lesson changes, make sure its module is open.
  useEffect(() => {
    if (!current) return;
    setExpanded((prev) => (prev.has(current.module.id) ? prev : new Set([...prev, current.module.id])));
    onClose?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.lesson.path]);

  const toggle = (id) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const finished = MODULES.reduce((sum, m) => sum + m.lessons.filter((l) => done.has(l.path)).length, 0);

  return (
    <>
      <div className={`co-scrim ${open ? "co-scrim-on" : ""}`} onClick={onClose} />
      <aside className={`co ${open ? "co-open" : ""}`} aria-label="Course outline">
        <div className="co-head">
          <FolderOpen size={18} className="co-head-icon" fill="currentColor" />
          <span className="co-head-title">Course</span>
          <span className="co-head-count">{TOTAL} lessons</span>
        </div>

        <div className="co-list">
          {MODULES.map((m) => {
            const isOpen = expanded.has(m.id);
            const isCurrent = current?.module.id === m.id;
            const count = m.lessons.filter((l) => done.has(l.path)).length;
            const FolderIcon = isOpen ? FolderOpen : Folder;

            return (
              <div key={m.id} className={`co-module ${isOpen ? "co-module-open" : ""}`}>
                <button className="co-module-btn" onClick={() => toggle(m.id)} aria-expanded={isOpen}>
                  <ChevronRight size={15} className="co-chevron" />
                  <FolderIcon size={17} className={`co-folder ${isCurrent ? "co-folder-on" : ""}`} fill={isCurrent ? "currentColor" : "none"} />
                  <span className="co-module-title">
                    {m.number}. {m.title}
                  </span>
                  <span className={`co-module-count ${count === m.lessons.length ? "co-module-count-done" : ""}`}>
                    {count}/{m.lessons.length}
                  </span>
                </button>

                <div className="co-lessons" hidden={!isOpen}>
                  {m.lessons.map((l) => {
                    const Icon = done.has(l.path) ? FileCheck : File;
                    return (
                      <NavLink key={l.path} to={l.path} className={({ isActive }) => `co-lesson ${isActive ? "co-lesson-on" : ""}`}>
                        <Icon size={15} className="co-lesson-icon" />
                        <span>{l.title}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="co-progress">
          <span>Progress</span>
          <div className="co-bar">
            <div style={{ width: `${(finished / TOTAL) * 100}%` }} />
          </div>
          <b>
            {finished} / {TOTAL}
          </b>
        </div>
      </aside>
    </>
  );
};

export default CourseSidebar;
