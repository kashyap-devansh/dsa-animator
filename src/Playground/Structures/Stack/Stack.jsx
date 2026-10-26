import { useParams } from "react-router-dom";
import CategoryGrid from "../../shared/CategoryGrid";
import StackData from "./Stack.js";
import Push from "./Push/Push.jsx";
import Pop from "./Pop/Pop.jsx";
import "./Stack.css";

const Stack = () => {
  const { slug } = useParams();

  if (slug === "push") {
    return <Push />
  }

  if (slug === "pop") {
    return <Pop />
  }

  return (
    <CategoryGrid
      wrapperClass="stack-ui"
      eyebrowClass="stack-ui-eyebrow"
      eyebrowText="Stack"
      gridClass="stack-ui-grid"
      cardClass="stack-card"
      items={StackData}
      basePath="/playground/stack"
    />
  );
};

export default Stack;
