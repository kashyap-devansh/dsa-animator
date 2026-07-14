import { Link, useParams } from "react-router-dom";
import SortingData from "./SortingData.js";
import BubbleSort from "./BubbleSort/BubbleSort.jsx";
import SelectionSort from "./SelectionSort/SelectionSort.jsx";
import "./Sorting.css";

const Sorting = () => {
  const { slug } = useParams();

  if (slug === "bubble-sort") {
    return <BubbleSort />;
  }
  else if (slug === "selection-sort") {
    return <SelectionSort />
  }

  return (
    <section className="sorting">
      <p className="sorting-eyebrow">SORTING</p>

      <div className="sorting-grid">
        {SortingData.map((item) => (
          <Link
            key={item.slug}
            to={`/playground/sorting/${item.slug}`}
            className="sorting-card"
          >
            <div className="card-top">
              <span className="complexity">{item.complexity}</span>
              <span className="arrow">↗</span>
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
