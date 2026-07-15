import { Link, useParams } from "react-router-dom";
import SortingData from "./SortingData.js";
import BubbleSort from "./BubbleSort/BubbleSort.jsx";
import SelectionSort from "./SelectionSort/SelectionSort.jsx";
import InsertionSort from "./InsertionSort/InsertionSort.jsx";
import "./Sorting.css";

const Sorting = () => {
  const { slug } = useParams();

  if (slug === "bubble-sort") {
    return <BubbleSort />;
  }
  else if (slug === "selection-sort") {
    return <SelectionSort />
  }
  else if (slug === "insertion-sort") {
    return <InsertionSort />
  }

  return (
    <section className="sorting">
      <p className="sorting-eyebrow">SORTING</p>

      <div className="sorting-grid">
        {SortingData.map((item) => (
          <Link
            key={item.slug}
            to={`/playground/sorting/${item.slug}`}
            className={`sorting-card ${item.active ? "active" : "locked"}`}
            onClick={(e) => !item.active && e.preventDefault()}
          >
            <div className="card-top">
              <span className="complexity">{item.complexity}</span>
              <span className="arrow" >
                {item.active ? <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up-right-icon lucide-arrow-up-right"><path d="M7 7h10v10" /><path d="M7 17 17 7" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#45454A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lock-icon lucide-lock"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>}
              </span>
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
