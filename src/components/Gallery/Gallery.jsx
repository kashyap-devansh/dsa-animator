import { useNavigate } from "react-router-dom";
import "./Gallery.css";

const GalleryElements = [
  {
    title: "Bubble Sort",
    tag: "sorting",
    complexity: "O(n²)",
    slug: "bubble-sort",
  },
  {
    title: "Binary Search",
    tag: "searching",
    complexity: "O(log n)",
    slug: "binary-search",
  },
  {
    title: "Insert At Head",
    tag: "linkedList",
    complexity: "O(1)",
    slug: "insert-at-head",
  },
  {
    title: "Enqueue",
    tag: "queue",
    complexity: "O(1)",
    slug: "enqueue",
  },

]

const Gallery = () => {
  const navigate = useNavigate();
  return (
    <div
      className="gallery-wrapper"
      id="gallery"
    >
      <div className="gallery">
        <div className="gallery-header">
          <span className="gallery-eyebrow">THE GALLERY</span>
          <h1>
            Visualizers worth
            <br />
            studying
          </h1>
        </div>

        <div className="gallery-card-wrapper">
          {GalleryElements.map((item, index) => (
            <div className="gallery-card" key={index}>
              <div className="gallery-card-header">
                <span className="gallery-number">
                  {String(index + 1).padStart(2, "0")} / {item.tag.toUpperCase()}
                </span>

                <span className="gallery-complexity">
                  {item.complexity}
                </span>
              </div>

              <h1>{item.title}</h1>

              <button
                className="gallery-btn"
                onClick={() => navigate(`/playground/${item.tag}/${item.slug}`)}
              >
                View Case
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Gallery
