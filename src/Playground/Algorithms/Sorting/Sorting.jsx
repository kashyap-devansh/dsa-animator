import { Link } from "react-router-dom";
import SortingData from "../Sorting/Sorting.js";
import "./Sorting.css";

const Sorting = () => {
  return (
    <section className="sorting">
      <p className="sorting-eyebrow">SORTING</p>

      <div className="sorting-grid">
        {SortingData.map((item) => (
          <Link
            to={`/sorting/${item.slug}`}
            className="sorting-card"
            key={item.slug}
          >
            <div className="card-top">
              <span className="complexity">{item.complexity}</span>
              <span className="arrow"> ↗ </span>
            </div>

            <h2>{item.title}</h2>

            <p className="description">{item.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default Sorting;
