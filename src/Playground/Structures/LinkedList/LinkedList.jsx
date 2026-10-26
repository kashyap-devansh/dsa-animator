import { useParams } from "react-router-dom";
import CategoryGrid from "../../shared/CategoryGrid";
import LinkedListData from "./LinkedListData";
import InsertAtHead from "./InsertAtHead/InsertAtHead";
import InsertAtTail from "./InsertAtTail/InsertAtTail";
import InsertAtPosition from "./InsertAtPosition/InsertAtPosition.jsx";
import DeleteFromHead from "./DeleteFromHead/DeleteFromHead.jsx";
import DeleteFromTail from "./DeleteFromTail/DeleteFromTail.jsx";
import DeleteFromPosition from "./DeleteFromPosition/DeleteFromPosition.jsx";
import "./LinkedList.css";

const LinkedList = () => {
  const { slug } = useParams();

  if (slug === "insert-at-head") {
    return <InsertAtHead />;
  }

  if (slug === "insert-at-tail") {
    return <InsertAtTail />;
  }

  if (slug === "insert-at-position") {
    return <InsertAtPosition />
  }

  if (slug === "delete-from-head") {
    return <DeleteFromHead />
  }

  if (slug === "delete-from-tail") {
    return <DeleteFromTail />
  }

  if (slug === "delete-from-position") {
    return <DeleteFromPosition />
  }

  return (
    <CategoryGrid
      wrapperClass="linkedList"
      eyebrowClass="linkedList-eyebrow"
      eyebrowText="Linked List"
      gridClass="linkedList-grid"
      cardClass="linkedList-card"
      items={LinkedListData}
      basePath="/playground/linkedList"
    />
  );
};

export default LinkedList;
