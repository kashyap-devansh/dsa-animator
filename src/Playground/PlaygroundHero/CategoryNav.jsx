import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { categories } from "../shared/searchIndex.js";
import { sectionId } from "../shared/sectionId";

const ITEMS = categories.map(({ label, basePath, data }) => ({
  label,
  id: sectionId(basePath),
  count: data.filter((item) => item.active).length,
}));

// Sticky category bar: tracks which section is in view and jumps to one on click.
const CategoryNav = () => {
  const [active, setActive] = useState(ITEMS[0].id);
  const barRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) setActive(visible[0].target.id);
      },
      { rootMargin: "-35% 0px -60% 0px" }
    );

    ITEMS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Keep the active chip visible when the bar scrolls sideways (phones).
  useEffect(() => {
    const bar = barRef.current;
    const chip = bar?.querySelector(`[data-id="${active}"]`);
    if (!bar || !chip) return;
    bar.scrollTo({ left: chip.offsetLeft - bar.clientWidth / 2 + chip.clientWidth / 2, behavior: "smooth" });
  }, [active]);

  const jump = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    setActive(id);
    if (window.__lenis) window.__lenis.scrollTo(el, { offset: -150 });
    else el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="pg-nav">
      <div className="pg-nav-track" ref={barRef}>
        {ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            data-id={item.id}
            className={`pg-nav-chip ${active === item.id ? "pg-nav-chip-active" : ""}`}
            onClick={() => jump(item.id)}
          >
            {active === item.id && (
              <motion.span layoutId="pg-nav-pill" className="pg-nav-pill" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
            )}
            <span className="pg-nav-label">{item.label}</span>
            <span className="pg-nav-count">{item.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryNav;
