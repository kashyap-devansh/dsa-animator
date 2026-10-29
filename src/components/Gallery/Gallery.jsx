import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { MiniSort, MiniBinarySearch, MiniList, MiniQueue } from "../MiniViz/MiniViz";
import { Reveal } from "../shared/effects";
import { trackPointer } from "../shared/pointer";
import "./Gallery.css";

const GalleryElements = [
  {
    title: "Bubble Sort",
    tag: "sorting",
    complexity: "O(n²)",
    slug: "bubble-sort",
    Viz: MiniSort,
  },
  {
    title: "Binary Search",
    tag: "searching",
    complexity: "O(log n)",
    slug: "binary-search",
    Viz: MiniBinarySearch,
  },
  {
    title: "Insert At Head",
    tag: "linkedList",
    complexity: "O(1)",
    slug: "insert-at-head",
    Viz: MiniList,
  },
  {
    title: "Enqueue",
    tag: "queue",
    complexity: "O(1)",
    slug: "enqueue",
    Viz: MiniQueue,
  },

]

// Earlier cards ease back as later ones stack over them.
const GalleryCard = ({ item, index, total, progress, onOpen }) => {
  const scale = useTransform(progress, [index / total, 1], [1, 1 - (total - 1 - index) * 0.045]);
  const { Viz } = item;

  return (
    <motion.div className="gallery-card spotlight" style={{ scale }} onPointerMove={trackPointer}>
      <div className="gallery-card-header">
        <span className="gallery-number">
          {String(index + 1).padStart(2, "0")} / {item.tag.toUpperCase()}
        </span>

        <span className="gallery-complexity">
          {item.complexity}
        </span>
      </div>

      <div className="gallery-card-body">
        <div className="gallery-card-text">
          <h1>{item.title}</h1>

          <button className="gallery-btn" onClick={onOpen}>
            View Case
          </button>
        </div>

        <div className="gallery-card-viz">
          <Viz />
        </div>
      </div>
    </motion.div>
  );
};

const Gallery = () => {
  const navigate = useNavigate();
  const stackRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: stackRef, offset: ["start start", "end end"] });

  return (
    <div
      className="gallery-wrapper"
      id="gallery"
    >
      <div className="gallery">
        <Reveal className="gallery-header">
          <span className="gallery-eyebrow">THE GALLERY</span>
          <h1>
            Visualizers worth
            <br />
            studying
          </h1>
        </Reveal>

        <div className="gallery-card-wrapper" ref={stackRef}>
          {GalleryElements.map((item, index) => (
            <GalleryCard
              key={item.slug}
              item={item}
              index={index}
              total={GalleryElements.length}
              progress={scrollYProgress}
              onOpen={() => navigate(`/playground/${item.tag}/${item.slug}`)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Gallery
