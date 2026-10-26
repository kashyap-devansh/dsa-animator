import QueueData from "./QueueData.js"
import { useParams } from "react-router-dom";
import CategoryGrid from "../../shared/CategoryGrid";
import Enqueue from "./Enqueue/Enqueue.jsx";
import Dequeue from "./Dequeue/Dequeue.jsx";
import "./Queue.css";

const Queue = () => {
  const { slug } = useParams();

  if (slug === "enqueue") {
    return <Enqueue />;
  }

  if (slug === "dequeue") {
    return <Dequeue />;
  }

  return (
    <CategoryGrid
      wrapperClass="queue-ui"
      eyebrowClass="queue-ui-eyebrow"
      eyebrowText="Queue"
      gridClass="queue-ui-grid"
      cardClass="queue-card"
      items={QueueData}
      basePath="/playground/queue"
    />
  );
};

export default Queue;
