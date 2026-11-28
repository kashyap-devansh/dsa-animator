// Study note for red-black trees (Trees group).

const redBlack = [
  {
    slug: "red-black-tree",
    title: "Red-Black Trees",
    level: "Advanced",
    minutes: 9,
    viz: "tree",
    tldr: "A BST whose nodes are coloured red or black under three rules. The rules keep the height below 2·log₂(n + 1), and inserts and deletes fix them with recolours plus at most 2 (insert) or 3 (delete) rotations.",
    intuition: [
      "The rules: the root is black; a red node never has a red child; every path from a node down to an empty (NIL) leaf passes the same number of black nodes — its black height.",
      "If every path has b black nodes and reds can't be stacked, the longest path is at most twice the shortest. That is the whole balance guarantee: looser than AVL, but much cheaper to maintain.",
      "Insert a new node red so black heights don't change; then only a red–red pair can appear. Delete a black node and one path comes up a black short — the 'double black' — which recolours and rotations pay back.",
    ],
    steps: [
      "Insert: place the key as a red leaf, like a BST.",
      "If its parent is red, look at the uncle. Red uncle (case 1): recolour parent and uncle black, grandparent red, and repeat from the grandparent.",
      "Black uncle, bent shape (case 2): rotate at the parent to make a straight line. Straight line (case 3): recolour parent black and grandparent red, then rotate at the grandparent.",
      "Finally paint the root black.",
      "Delete: remove like a BST. If the removed node was red, stop; if its child is red, paint it black and stop; otherwise fix the double black.",
      "Double black, by sibling: red sibling (case 1) → recolour and rotate; black sibling with black children (case 2) → sibling red, move the problem up; near child red (case 3) → rotate the sibling; far child red (case 4) → recolour and rotate at the parent, done.",
    ],
    complexity: { best: "O(log n)", average: "O(log n)", worst: "O(log n)", space: "O(n)" },
    complexityRows: [
      ["Search / insert / delete", "O(log n)"],
      ["Height", "≤ 2·log₂(n + 1)"],
      ["Rotations per insert", "≤ 2"],
      ["Rotations per delete", "≤ 3"],
    ],
    facts: [
      { label: "New nodes", value: "Red" },
      { label: "Used in", value: "std::map, TreeMap" },
      { label: "vs AVL", value: "Fewer rotations" },
    ],
    code: [
      "while (z != root && z->parent->red) {",
      "  Node *p = z->parent, *g = p->parent;",
      "  Node* u = (p == g->left) ? g->right : g->left;",
      "  if (u && u->red) {                 // case 1",
      "    p->red = u->red = false; g->red = true; z = g;",
      "  } else {",
      "    if (z is an inner child) { z = p; rotate(z, outward); }  // case 2",
      "    z->parent->red = false; g->red = true;                  // case 3",
      "    rotate(g, away from z);",
      "  }",
      "}",
      "root->red = false;",
    ],
    pitfalls: [
      "Forgetting that NIL leaves count as black: a missing uncle or sibling is a black one.",
      "Inserting new nodes black: that breaks the black-height rule on one path at once, which is much harder to fix.",
      "Stopping after case 2 of insertion: the triangle rotation only sets up case 3, it doesn't fix anything by itself.",
    ],
    examTip: "Insert 10, 20, 30, 15, 25, 5 by hand into an empty tree, drawing the colours after each fix-up.",
    visualizers: [
      { label: "Insertion", path: "/playground/rbt/insertion" },
      { label: "Deletion", path: "/playground/rbt/deletion" },
    ],
    quiz: [
      {
        q: "What colour is a newly inserted node, and why?",
        options: ["Black, to keep the root black", "Red, so no path's black count changes", "Red, so it can be deleted faster", "Either; it doesn't matter"],
        answer: 1,
        why: "A red node adds no black to any path, so only the red–red rule can break, which is local and easy to fix.",
      },
      {
        q: "Inserting z, its parent and uncle are both red. What happens?",
        options: ["Rotate at the grandparent", "Recolour parent and uncle black, grandparent red", "Delete the uncle", "Paint z black"],
        answer: 1,
        why: "Case 1: recolouring keeps every black height and pushes any conflict up to the grandparent.",
      },
      {
        q: "The longest root-to-leaf path in a red-black tree is at most…",
        options: ["Equal to the shortest", "Twice the shortest", "log n longer", "Unbounded"],
        answer: 1,
        why: "Both paths have the same black nodes, and reds can't be stacked, so at most one red per black.",
      },
    ],
  },
];

export default redBlack;
