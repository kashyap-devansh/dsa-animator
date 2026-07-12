import "./Gallery.css";

const GalleryElements = [
  {
    title: "Quicksort Chamber",
    tag: "Sorting",
    complexity: "O(n log n)",
  },
  {
    title: "Dijkstra Pathfinder",
    tag: "Graphs",
    complexity: "O((V+E) log V)",
  },
  {
    title: "AVL Balancer",
    tag: "Trees",
    complexity: "O(log n)",
  },
  {
    title: "Knapsack Grid",
    tag: "Dynamic Programming",
    complexity: "O(n·W)",
  },

]

const Gallery = () => {
  return (
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

            <button className="gallery-btn">
              View Case
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Gallery
