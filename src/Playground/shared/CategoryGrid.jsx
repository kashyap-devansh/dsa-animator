import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRightIcon, LockIcon } from "./icons";
import { trackPointer } from "../../components/shared/pointer";
import { sectionId } from "./sectionId";
import "./CategoryGrid.css";

const MotionLink = motion.create(Link);

const grid = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const card = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const CategoryGrid = ({ wrapperClass, eyebrowClass, eyebrowText, gridClass, cardClass, items, basePath }) => {
  const reduced = useReducedMotion();
  const live = items.filter((item) => item.active).length;

  return (
    <div className={`${wrapperClass} pg-section`} id={sectionId(basePath)}>
      <p className={`${eyebrowClass} pg-eyebrow`}>
        {eyebrowText}
        <span className="pg-count">{String(live).padStart(2, "0")}</span>
      </p>

      <motion.div
        className={gridClass}
        variants={grid}
        initial={reduced ? false : "hidden"}
        whileInView="show"
        viewport={{ once: true, margin: "-8% 0px" }}
      >
        {items.map((item) => (
          <MotionLink
            key={item.slug}
            to={`${basePath}/${item.slug}`}
            variants={card}
            whileHover={item.active && !reduced ? { y: -4 } : undefined}
            className={`${cardClass} ${item.active ? "active spotlight spotlight-relative" : "locked"}`}
            onClick={(e) => !item.active && e.preventDefault()}
            onPointerMove={item.active ? trackPointer : undefined}
          >
            <div className="card-top">
              <span className="complexity">{item.complexity}</span>
              <span className="arrow">
                {item.active ? <ArrowUpRightIcon /> : <LockIcon />}
              </span>
            </div>

            <h2>{item.title}</h2>

            <p className="description">{item.description}</p>
          </MotionLink>
        ))}
      </motion.div>
    </div>
  );
};

export default CategoryGrid;
