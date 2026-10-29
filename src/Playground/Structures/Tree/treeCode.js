// Line numbers here are what treeEngine's save(codeLine, ...) calls point at.

const INSERT_DESCEND = [
  "Node* insert(Node* n, int key) {",
  "  if (!n) return new Node(key);",
  "  if (key < n->key)",
  "    n->left = insert(n->left, key);",
  "  else if (key > n->key)",
  "    n->right = insert(n->right, key);",
];

export const BST_INSERT_CODE = [
  ...INSERT_DESCEND,
  "  return n;",
  "}",
];

export const AVL_INSERT_CODE = [
  ...INSERT_DESCEND,
  "  else return n;",
  "  update(n);",
  "  int bf = balance(n);",
  "  if (bf > 1 && key < n->left->key)",
  "    return rotateRight(n);          // LL",
  "  if (bf < -1 && key > n->right->key)",
  "    return rotateLeft(n);           // RR",
  "  if (bf > 1) {                     // LR",
  "    n->left = rotateLeft(n->left);",
  "    return rotateRight(n);",
  "  }",
  "  if (bf < -1) {                    // RL",
  "    n->right = rotateRight(n->right);",
  "    return rotateLeft(n);",
  "  }",
  "  return n;",
  "}",
];

export const BST_SEARCH_CODE = [
  "Node* search(Node* n, int key) {",
  "  while (n) {",
  "    if (key == n->key) return n;",
  "    if (key < n->key) n = n->left;",
  "    else n = n->right;",
  "  }",
  "  return nullptr;",
  "}",
];

const DELETE_DESCEND = [
  "Node* remove(Node* n, int key) {",
  "  if (!n) return n;",
  "  if (key < n->key)",
  "    n->left = remove(n->left, key);",
  "  else if (key > n->key)",
  "    n->right = remove(n->right, key);",
  "  else {",
  "    if (!n->left) return n->right;",
  "    if (!n->right) return n->left;",
  "    Node* s = minNode(n->right);",
  "    n->key = s->key;",
  "    n->right = remove(n->right, s->key);",
  "  }",
];

export const BST_DELETE_CODE = [
  ...DELETE_DESCEND,
  "  return n;",
  "}",
];

export const AVL_DELETE_CODE = [
  ...DELETE_DESCEND,
  "  update(n);",
  "  int bf = balance(n);",
  "  if (bf > 1) {                // R0 · R1 · R-1",
  "    if (balance(n->left) < 0)",
  "      n->left = rotateLeft(n->left);",
  "    return rotateRight(n);",
  "  }",
  "  if (bf < -1) {               // L0 · L1 · L-1",
  "    if (balance(n->right) > 0)",
  "      n->right = rotateRight(n->right);",
  "    return rotateLeft(n);",
  "  }",
  "  return n;",
  "}",
];
