import { Link } from "react-router-dom";
import { ArrowUpRightIcon, LockIcon } from "./icons";

const CategoryGrid = ({ wrapperClass, eyebrowClass, eyebrowText, gridClass, cardClass, items, basePath }) => (
  <div className={wrapperClass}>
    <p className={eyebrowClass}>{eyebrowText}</p>

    <div className={gridClass}>
      {items.map((item) => (
        <Link
          key={item.slug}
          to={`${basePath}/${item.slug}`}
          className={`${cardClass} ${item.active ? "active" : "locked"}`}
          onClick={(e) => !item.active && e.preventDefault()}
        >
          <div className="card-top">
            <span className="complexity">{item.complexity}</span>
            <span className="arrow">
              {item.active ? <ArrowUpRightIcon /> : <LockIcon />}
            </span>
          </div>

          <h2>{item.title}</h2>

          <p className="description">{item.description}</p>
        </Link>
      ))}
    </div>
  </div>
);

export default CategoryGrid;
