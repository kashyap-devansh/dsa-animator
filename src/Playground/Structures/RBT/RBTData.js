const RBTData = [
  {
    title: "Insertion",
    complexity: "O(log n)",
    description: "Inserts a red node like a BST, then fixes red–red conflicts by recolouring and at most two rotations.",
    slug: "insertion",
    active: true,
  },
  {
    title: "Deletion",
    complexity: "O(log n)",
    description: "Deletes like a BST, then pays off a missing black with recolours and at most three rotations.",
    slug: "deletion",
    active: true,
  },
];

export default RBTData;
